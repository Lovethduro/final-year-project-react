import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, StatCard, PrimaryButton, Alert } from './components/ui';
import { customerApi, paymentApi, userApi, getSession } from './utils/apiClient';
import { storeAuthSession } from './utils/authFlow';
import { refreshNotifications } from './utils/notifications';
import { theme } from './styles/theme';

function formatAmount(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function BillingPage() {
    const [overview, setOverview] = useState(null);
    const [tab, setTab] = useState('invoices');
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(null);
    const [provider, setProvider] = useState('paystack');

    const load = () => {
        customerApi.billingOverview().then(setOverview).catch((err) => setError(err.message));
    };

    useEffect(() => {
        load();
        userApi.getProfile()
            .then((profile) => {
                if (profile.preferredPaymentMethod) {
                    setProvider(profile.preferredPaymentMethod);
                }
            })
            .catch(() => {});
    }, []);

    const savePaymentPreference = async (method) => {
        setProvider(method);
        try {
            const updated = await userApi.updateProfile({ preferredPaymentMethod: method });
            const session = getSession();
            storeAuthSession({
                userId: updated.userId || session.userId,
                fullName: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                role: updated.role,
                mfaEnabled: updated.mfaEnabled,
                emailVerified: updated.emailVerified,
                avatarUrl: updated.profileImageUrl || updated.avatarUrl,
                preferredPaymentMethod: updated.preferredPaymentMethod,
                createdAt: updated.createdAt,
                token: session.token,
            }, session.rememberMe);
        } catch {
            // Non-blocking — selection still applies for this session
        }
    };

    const payInvoice = async (invoice) => {
        setPaying(invoice.id);
        setError('');
        try {
            const init = provider === 'paystack'
                ? await paymentApi.initPaystack({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id })
                : await paymentApi.initFlutterwave({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id });

            if (init.sandbox || init.authorizationUrl?.includes('sandbox=1')) {
                await paymentApi.sandboxComplete(init.reference);
                load();
                userApi.getProfile().then((updated) => {
                    const session = getSession();
                    storeAuthSession({
                        userId: updated.userId || session.userId,
                        fullName: updated.fullName,
                        email: updated.email,
                        phone: updated.phone,
                        role: updated.role,
                        mfaEnabled: updated.mfaEnabled,
                        emailVerified: updated.emailVerified,
                        avatarUrl: updated.profileImageUrl || updated.avatarUrl,
                        preferredPaymentMethod: updated.preferredPaymentMethod,
                        createdAt: updated.createdAt,
                        token: session.token,
                    }, session.rememberMe);
                }).catch(() => {});
                refreshNotifications();
                return;
            }
            if (init.authorizationUrl) {
                window.location.href = init.authorizationUrl;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setPaying(null);
        }
    };

    const invoices = overview?.invoices || [];
    const transactions = overview?.transactions || [];

    return (
        <DashboardLayout>
            <PageHeader title="Billing & Subscriptions" subtitle="Manage invoices and pay with Paystack or Flutterwave (sandbox)" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Monthly Revenue" value={formatAmount(overview?.monthlyRevenue)} icon="💰" status="success" />
                <StatCard title="Paid Invoices" value={overview?.activePlans ?? 0} icon="📋" status="info" />
                <StatCard title="Pending" value={overview?.pendingInvoices ?? 0} icon="⏳" status="warning" />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {['invoices', 'transactions'].map((t) => (
                    <button key={t} type="button" onClick={() => setTab(t)} style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: tab === t ? theme.primary : 'rgba(255,255,255,0.05)',
                        color: tab === t ? '#fff' : theme.textMuted, textTransform: 'capitalize',
                    }}>
                        {t}
                    </button>
                ))}
                <select value={provider} onChange={(e) => savePaymentPreference(e.target.value)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: '8px 12px', color: theme.text }}>
                    <option value="paystack">Paystack (Sandbox)</option>
                    <option value="flutterwave">Flutterwave (Sandbox)</option>
                </select>
            </div>

            {tab === 'invoices' ? (
                <Card title="Invoices">
                    <DataTable
                        columns={[
                            { key: 'description', label: 'Description' },
                            { key: 'amount', label: 'Amount', render: (r) => formatAmount(r.amount) },
                            { key: 'dueDate', label: 'Due', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
                            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'paid' ? 'success' : 'warning'} label={r.status} /> },
                            { key: 'actions', label: '', render: (r) => r.status !== 'paid' && (
                                <PrimaryButton onClick={() => payInvoice(r)} disabled={paying === r.id} style={{ fontSize: 12, padding: '6px 12px' }}>
                                    {paying === r.id ? 'Processing…' : 'Pay Now'}
                                </PrimaryButton>
                            )},
                        ]}
                        rows={invoices}
                    />
                </Card>
            ) : (
                <Card title="Payment Transactions">
                    <DataTable
                        columns={[
                            { key: 'reference', label: 'Reference' },
                            { key: 'provider', label: 'Provider' },
                            { key: 'amount', label: 'Amount', render: (r) => formatAmount(r.amount) },
                            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'success' ? 'success' : 'warning'} label={r.status} /> },
                            { key: 'createdAt', label: 'Date', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' },
                        ]}
                        rows={transactions}
                    />
                </Card>
            )}
        </DashboardLayout>
    );
}
