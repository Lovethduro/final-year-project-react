import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, DataTable, StatusBadge, PrimaryButton, Alert, Select } from '../components/ui';
import { HotDealsStrip } from '../components/HotDealsStrip';
import { ProductCard } from '../components/ProductCard';
import { WelcomeBanner, QuickActions, ActivityTimeline, MetricCard } from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { customerApi, productApi, userApi, formatPaymentMethod, getProfileImageUrl, assetUrl } from '../utils/apiClient';
import { theme } from '../styles/theme';

const KB_SUGGESTIONS = [
    { title: 'How to reset your password', category: 'Account' },
    { title: 'Understanding your invoice', category: 'Billing' },
    { title: 'Creating a support ticket', category: 'Support' },
];

function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function CustomerDashboard() {
    const auth = useAuth();
    const formRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
    const [error, setError] = useState('');

    const load = () => {
        Promise.all([
            customerApi.stats().then(setStats).catch(() => {}),
            customerApi.tickets().then(setTickets).catch(() => setTickets([])),
            customerApi.invoices().then(setInvoices).catch(() => setInvoices([])),
            productApi.list().then(setProducts).catch(() => {}),
            userApi.getProfile().then(setProfile).catch(() => {}),
        ]);
    };

    useEffect(() => { load(); }, []);

    const openTickets = stats?.openTickets ?? tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
    const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'unpaid').length;
    const subscriptions = products.length > 0 ? Math.min(products.length, 3) : 0;

    const activity = tickets.slice(0, 5).map((t) => ({
        title: `${t.subject} — ${t.status}`,
        time: formatRelative(t.createdAt),
    }));

    const createTicket = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await customerApi.createTicket(form);
            setShowForm(false);
            setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 };

    return (
        <>
                    <WelcomeBanner
                title={`Welcome back, ${auth.fullName || 'Customer'}`}
                subtitle={[formatDate(), profile?.createdAt ? `Member since ${profile.createdAt}` : null].filter(Boolean).join(' · ')}
                badge={profile?.active !== false ? 'Account Active' : 'Account Inactive'}
            >
                {getProfileImageUrl(profile) && (
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                        border: `2px solid ${theme.borderHover}`, flexShrink: 0,
                    }}>
                        <img src={assetUrl(getProfileImageUrl(profile))} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </WelcomeBanner>

            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                <MetricCard label="Active Subscriptions" value={subscriptions} accent={theme.accent} />
                <MetricCard label="Open Support Tickets" value={openTickets} accent={theme.warning} />
                <MetricCard label="Pending Invoices" value={pendingInvoices} accent={theme.warning} />
                <MetricCard label="Account Status" value={profile?.active !== false ? 'Active' : 'Inactive'} accent={theme.success} />
            </div>

            <QuickActions actions={[
                { label: 'Contact Support', to: '/customer/support' },
                { label: 'My Tickets', to: '/customer/tickets' },
                { label: 'Message Sales', to: '/customer/messages' },
                { label: 'Hot Deals', to: '/customer/hot-deals' },
                { label: 'Help Center', to: '/dashboard/knowledge-base' },
                { label: 'View Invoices', to: '/dashboard/billing' },
                { label: 'My Products', to: '/customer/products' },
            ]} />

            <Card title="Hot Deals" style={{ marginBottom: 24 }}>
                <HotDealsStrip compact maxItems={3} showTitle={false} products={products} emptyMessage="No hot deals right now. Watch your notifications for new offers." />
                <Link to="/customer/hot-deals" style={{ display: 'inline-block', marginTop: 12, color: theme.accent, fontSize: 14 }}>
                    View all hot deals →
                </Link>
            </Card>

            {showForm && (
                <div ref={formRef}>
                    <Card title="Create New Ticket" style={{ marginBottom: 24 }}>
                        <form onSubmit={createTicket}>
                            <input style={inputStyle} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                            <textarea style={{ ...inputStyle, minHeight: 100 }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value="general">General</option>
                                <option value="billing">Billing</option>
                                <option value="technical">Technical</option>
                            </Select>
                            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Select>
                            <PrimaryButton type="submit">Submit Ticket</PrimaryButton>
                        </form>
                    </Card>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20, alignItems: 'start' }}>
                <div>
                    <Card title="My Products" style={{ marginBottom: 20 }}>
                        {products.length ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                                {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} compact />)}
                            </div>
                        ) : (
                            <p style={{ color: theme.textDim, fontSize: 14 }}>Browse our catalog to get started.</p>
                        )}
                        <Link to="/customer/products" style={{ display: 'inline-block', marginTop: 16, color: theme.accent, fontSize: 14 }}>
                            View full catalog & cart →
                        </Link>
                    </Card>

                    <Card title="Recent Support Tickets">
                        <DataTable
                            columns={[
                                { key: 'id', label: 'Ticket #', render: (r) => r.id?.slice(-6).toUpperCase() || '—' },
                                { key: 'subject', label: 'Subject' },
                                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'resolved' ? 'success' : 'warning'} label={r.status} /> },
                                { key: 'priority', label: 'Priority' },
                                { key: 'createdAt', label: 'Date', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
                            ]}
                            rows={tickets.slice(0, 6)}
                            emptyMessage="No support tickets yet."
                        />
                    </Card>
                </div>

                <div>
                    <Card title="Recent Activity" style={{ marginBottom: 20 }}>
                        <ActivityTimeline items={activity} />
                    </Card>

                    <Card title="Recommended for You" style={{ marginBottom: 20 }}>
                        {KB_SUGGESTIONS.map((a) => (
                            <Link key={a.title} to="/dashboard/knowledge-base" style={{ display: 'block', padding: '10px 0', borderBottom: `0.5px solid ${theme.border}`, textDecoration: 'none' }}>
                                <div style={{ fontSize: 13, color: theme.text }}>{a.title}</div>
                                <div style={{ fontSize: 11, color: theme.accent }}>{a.category}</div>
                            </Link>
                        ))}
                    </Card>

                    <div id="account-summary" style={{ scrollMarginTop: 80 }}>
                    <Card title="Account Summary">
                        <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>
                            <div><span style={{ color: theme.textDim }}>Account type:</span> {profile?.customerType || 'Individual'}</div>
                            <div><span style={{ color: theme.textDim }}>Member since:</span> {profile?.createdAt || '—'}</div>
                            <div><span style={{ color: theme.textDim }}>Email:</span> {auth.email}</div>
                            <div><span style={{ color: theme.textDim }}>Payment method:</span> {formatPaymentMethod(profile?.preferredPaymentMethod)}</div>
                            <div style={{ marginTop: 12 }}>
                                <span style={{ color: theme.textDim }}>Invoices:</span> {invoices.length || 'None'}
                            </div>
                        </div>
                        <Link to="/profile" style={{ display: 'inline-block', marginTop: 16, color: theme.accent, fontSize: 13 }}>Manage account →</Link>
                    </Card>
                    </div>
                </div>
            </div>
        </>
    );
}