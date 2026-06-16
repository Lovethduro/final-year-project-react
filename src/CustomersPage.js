import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, StatCard, Alert } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { salesApi } from './utils/apiClient';

export default function CustomersPage() {
    const auth = useAuth();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!['SALES_AGENT', 'ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'].includes(auth.role)) {
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
    }, [auth.role]);

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = [c.name, c.email, c.company, c.phone].filter(Boolean).join(' ').toLowerCase().includes(q);
        const matchesType = typeFilter === 'All' || c.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <DashboardLayout>
            <PageHeader title="Customers" subtitle="View customer accounts and support activity" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Customers" value={loading ? '…' : customers.length} status="info" />
                <StatCard title="Active" value={loading ? '…' : customers.filter((c) => c.status === 'active').length} status="success" />
                <StatCard title="Open Tickets" value={loading ? '…' : customers.reduce((s, c) => s + (c.tickets || 0), 0)} status="warning" />
            </div>

            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
                    <FilterSelect value={typeFilter} onChange={setTypeFilter} options={['All', 'Individual', 'Business', 'Enterprise']} />
                </div>
                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>Loading customers…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'name', label: 'Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'company', label: 'Company' },
                            { key: 'type', label: 'Type' },
                            { key: 'tickets', label: 'Tickets' },
                            { key: 'memberSince', label: 'Member Since', render: (r) => r.memberSince || '—' },
                            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                        ]}
                        rows={filtered}
                        emptyMessage="No customers found."
                    />
                )}
            </Card>
        </DashboardLayout>
    );
}
