import { useEffect, useState } from 'react';
import { PageHeader, Card, DataTable, StatusBadge, StatCard, PrimaryButton, Alert, Select } from './components/ui';
import { customerApi, paymentApi, userApi, getSession } from './utils/apiClient';
import { storeAuthSession } from './utils/authFlow';
import { refreshNotifications } from './utils/notifications';
import { completePaymentIfNeeded, isSimulatedPayment } from './utils/paymentUtils';
import { theme } from './styles/theme';

function formatAmount(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function BillingPage() {
    const session = getSession();
    const isStaff = ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'].includes(session.role);
    const [overview, setOverview] = useState(null);
    const [tab, setTab] = useState(isStaff ? 'transactions' : 'invoices');
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
            // Non-blocking - selection still applies for this session
        }
    };

    const payInvoice = async (invoice) => {
        setPaying(invoice.id);
        setError('');
        try {
            const init = provider === 'paystack'
                ? await paymentApi.initPaystack({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id })
                : await paymentApi.initFlutterwave({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id });

            if (isSimulatedPayment(init)) {
                setError(
                    provider === 'flutterwave'
                        ? 'Flutterwave is not configured on the server. Add FLUTTERWAVE_SECRET_KEY to application-local.properties and restart the backend.'
                        : 'Paystack is not configured on the server. Add PAYSTACK_SECRET_KEY to application-local.properties and restart the backend.'
                );
                return;
            }
            if (init.authorizationUrl) {
                window.location.href = init.authorizationUrl;
                return;
            }
            if (await completePaymentIfNeeded(init, paymentApi)) {
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
        } catch (err) {
            setError(err.message);
        } finally {
            setPaying(null);
        }
    };

    const invoices = overview?.invoices || [];
    const transactions = overview?.transactions || [];

    return (
        <>
                    <PageHeader
                title={isStaff ? 'Purchases & Payments' : 'Billing & Subscriptions'}
                subtitle={isStaff ? 'View your staff store purchases and payment history' : 'Manage invoices and pay with Paystack or Flutterwave'}
            />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title={isStaff ? 'Total Spent' : 'Monthly Revenue'} value={formatAmount(overview?.monthlyRevenue)} icon="ðŸ’°" status="success" />
                <StatCard title={isStaff ? 'Successful Payments' : 'Paid Invoices'} value={overview?.activePlans ?? 0} icon="ðŸ“‹" status="info" />
                {!isStaff && <StatCard title="Pending" value={overview?.pendingInvoices ?? 0} icon="â³" status="warning" />}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {(isStaff ? ['transactions'] : ['invoices', 'transactions']).map((t) => (
                    <button key={t} type="button" onClick={() => setTab(t)} style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: tab === t ? theme.primary : 'rgba(15,23,42,0.04)',
                        color: tab === t ? '#fff' : theme.textMuted, textTransform: 'capitalize',
                    }}>
                        {t}
                    </button>
                ))}
                <Select value={provider} onChange={(e) => savePaymentPreference(e.target.value)} style={{ marginLeft: 'auto', width: 'auto' }}>
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                </Select>
            </div>

            {tab === 'invoices' ? (
                <Card title="Invoices">
                    <DataTable
                        columns={[
                            { key: 'description', label: 'Description' },
                            { key: 'amount', label: 'Amount', render: (r) => formatAmount(r.amount) },
                            { key: 'dueDate', label: 'Due', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-' },
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
                            { key: 'createdAt', label: 'Date', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '-' },
                        ]}
                        rows={transactions}
                    />
                </Card>
            )}
        </>
    );
}