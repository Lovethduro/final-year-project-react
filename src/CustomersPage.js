import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import {
    PageHeader,
    Card,
    DataTable,
    StatusBadge,
    SearchInput,
    FilterSelect,
    StatCard,
    PrimaryButton,
    GhostButton,
    Alert,
    Select,
    AvatarInitials,
} from './components/ui';
import { useAuth } from './hooks/useAuth';
import { assetUrl, salesApi } from './utils/apiClient';
import { theme, inputStyle } from './styles/theme';

const TYPE_OPTIONS = ['All Types', 'Enterprise', 'Business', 'Individual'];
const STATUS_OPTIONS = ['All Status', 'Active', 'Inactive'];

const ghostButtonStyle = {
    padding: '8px 14px',
    borderRadius: 8,
    border: `0.5px solid ${theme.border}`,
    background: 'rgba(255,255,255,0.03)',
    color: theme.text,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: theme.fontBody,
};

function CustomerAvatar({ customer }) {
    const imageUrl = assetUrl(customer.avatarUrl);
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt=""
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
        );
    }
    return <AvatarInitials name={customer.name} size={40} fontSize={13} />;
}

export default function CustomersPage() {
    const auth = useAuth();
    const canAccess = ['SALES_AGENT', 'ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'].includes(auth.role);
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [minTickets, setMinTickets] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        customerType: 'individual',
    });

    const load = useCallback(() => {
        if (!canAccess) {
            setLoading(false);
            return;
        }
        setLoading(true);
        salesApi.customers()
            .then(setCustomers)
            .catch((err) => {
                setError(err.message);
                setCustomers([]);
            })
            .finally(() => setLoading(false));
    }, [canAccess]);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => ({
        total: customers.length,
        enterprise: customers.filter((c) => c.type === 'Enterprise').length,
        business: customers.filter((c) => c.type === 'Business').length,
        individual: customers.filter((c) => c.type === 'Individual').length,
    }), [customers]);

    const filtered = useMemo(() => customers.filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = [c.name, c.email, c.company, c.phone].filter(Boolean).join(' ').toLowerCase().includes(q);
        const matchesType = typeFilter === 'All Types' || c.type === typeFilter;
        const matchesStatus = statusFilter === 'All Status'
            || c.status === statusFilter.toLowerCase();
        const matchesTickets = !minTickets || (c.tickets ?? 0) >= Number(minTickets);
        return matchesSearch && matchesType && matchesStatus && matchesTickets;
    }), [customers, search, typeFilter, statusFilter, minTickets]);

    const resetForm = () => {
        setForm({
            fullName: '',
            email: '',
            phone: '',
            companyName: '',
            customerType: 'individual',
        });
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await salesApi.createCustomer(form);
            setSuccess('Customer account created.');
            setShowAddModal(false);
            resetForm();
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async (format) => {
        setExporting(format);
        setError('');
        setSuccess('');
        try {
            await salesApi.customersReport(format);
            setSuccess(`Customer list downloaded as ${format.toUpperCase()}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setExporting('');
        }
    };

    const headerActions = (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <GhostButton onClick={() => handleExport('csv')} disabled={!!exporting || loading || !customers.length}>
                {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
            </GhostButton>
            <GhostButton onClick={() => handleExport('pdf')} disabled={!!exporting || loading || !customers.length}>
                {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
            </GhostButton>
            <PrimaryButton onClick={() => { setShowAddModal(true); setSuccess(''); setError(''); }}>
                Add Customer
            </PrimaryButton>
        </div>
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="Customer Management"
                subtitle="Manage and view all customer information"
                action={headerActions}
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Customers" value={loading ? '…' : stats.total.toLocaleString()} status="info" />
                <StatCard title="Enterprise" value={loading ? '…' : stats.enterprise.toLocaleString()} status="warning" />
                <StatCard title="Business" value={loading ? '…' : stats.business.toLocaleString()} status="info" />
                <StatCard title="Individual" value={loading ? '…' : stats.individual.toLocaleString()} status="success" />
            </div>

            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or company..." />
                    <FilterSelect value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
                    <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
                    <button
                        type="button"
                        onClick={() => setShowMoreFilters((open) => !open)}
                        style={{ ...ghostButtonStyle, width: '100%', textAlign: 'left' }}
                    >
                        {showMoreFilters ? 'Hide Filters' : 'More Filters'}
                    </button>
                </div>

                {showMoreFilters && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                        <input
                            type="number"
                            min="0"
                            value={minTickets}
                            onChange={(e) => setMinTickets(e.target.value)}
                            placeholder="Minimum tickets"
                            style={{ ...inputStyle, marginBottom: 0 }}
                        />
                    </div>
                )}

                {loading ? (
                    <p style={{ color: theme.textDim }}>Loading customers…</p>
                ) : (
                    <DataTable
                        columns={[
                            {
                                key: 'customer',
                                label: 'Customer',
                                render: (row) => (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                                        <CustomerAvatar customer={row} />
                                        <div>
                                            <div style={{ color: theme.text, fontWeight: 600, marginBottom: 2 }}>{row.name}</div>
                                            <div style={{ fontSize: 12, color: theme.textDim }}>{row.company}</div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'contact',
                                label: 'Contact',
                                render: (row) => (
                                    <div style={{ minWidth: 180 }}>
                                        <div style={{ fontSize: 13, color: theme.text }}>{row.email}</div>
                                        {row.phone && <div style={{ fontSize: 12, color: theme.textDim, marginTop: 2 }}>{row.phone}</div>}
                                    </div>
                                ),
                            },
                            {
                                key: 'type',
                                label: 'Type',
                                render: (row) => <StatusBadge status="info" label={row.type} />,
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (row) => <StatusBadge status={row.status === 'active' ? 'success' : 'inactive'} label={row.status === 'active' ? 'Active' : 'Inactive'} />,
                            },
                            {
                                key: 'lifetimeValue',
                                label: 'Lifetime Value',
                                render: (row) => (
                                    <div style={{ fontWeight: 600, color: theme.text }}>{row.lifetimeValue || '₦0'}</div>
                                ),
                            },
                            { key: 'tickets', label: 'Tickets' },
                            { key: 'lastContact', label: 'Last Contact', render: (row) => row.lastContact || '—' },
                            {
                                key: 'actions',
                                label: 'Actions',
                                render: (row) => (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {row.email && (
                                            <a href={`mailto:${row.email}`} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, color: theme.accent, textDecoration: 'none' }}>
                                                Email
                                            </a>
                                        )}
                                        {row.phone && (
                                            <a href={`tel:${row.phone.replace(/\s/g, '')}`} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, color: theme.text, textDecoration: 'none' }}>
                                                Call
                                            </a>
                                        )}
                                        <Link to="/dashboard/tickets" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: theme.primary, color: '#fff', textDecoration: 'none' }}>
                                            Tickets
                                        </Link>
                                    </div>
                                ),
                            },
                        ]}
                        rows={filtered}
                        emptyMessage="No customers found."
                    />
                )}
            </Card>

            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    zIndex: 1000,
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 520,
                        background: theme.bg,
                        border: `0.5px solid ${theme.border}`,
                        borderRadius: 14,
                        padding: 24,
                    }}>
                        <h2 style={{ margin: '0 0 8px', color: theme.text, fontSize: 18 }}>Add Customer</h2>
                        <p style={{ margin: '0 0 20px', color: theme.textDim, fontSize: 13 }}>
                            Creates a customer account and sends welcome credentials by email.
                        </p>
                        <form onSubmit={handleCreateCustomer}>
                            <input
                                value={form.fullName}
                                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                placeholder="Full name"
                                required
                                style={inputStyle}
                            />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="Email"
                                required
                                style={inputStyle}
                            />
                            <input
                                value={form.phone}
                                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                placeholder="Phone"
                                style={inputStyle}
                            />
                            <input
                                value={form.companyName}
                                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                                placeholder="Company"
                                style={inputStyle}
                            />
                            <Select
                                value={form.customerType}
                                onChange={(e) => setForm((prev) => ({ ...prev, customerType: e.target.value }))}
                                style={{ marginBottom: 16 }}
                            >
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                                <option value="enterprise">Enterprise</option>
                            </Select>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} style={ghostButtonStyle}>
                                    Cancel
                                </button>
                                <PrimaryButton type="submit" disabled={saving}>
                                    {saving ? 'Creating…' : 'Create Customer'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
