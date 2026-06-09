import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, StatCard } from './components/ui';

const mockCustomers = [
    { id: '1', name: 'Sarah Thompson', email: 'sarah@techinn.com', company: 'Tech Innovations Ltd', type: 'Enterprise', status: 'active', tickets: 12 },
    { id: '2', name: 'Michael Chen', email: 'm.chen@digitalsol.com', company: 'Digital Solutions Inc', type: 'Business', status: 'active', tickets: 8 },
    { id: '3', name: 'David Park', email: 'david@example.com', company: '—', type: 'Individual', status: 'active', tickets: 3 },
    { id: '4', name: 'Emma Wilson', email: 'emma@smarttech.ng', company: 'Smart Tech Solutions', type: 'Business', status: 'inactive', tickets: 5 },
];

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const filtered = mockCustomers.filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = [c.name, c.email, c.company].join(' ').toLowerCase().includes(q);
        const matchesType = typeFilter === 'All' || c.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <DashboardLayout>
            <PageHeader title="Customers" subtitle="Manage customer accounts and relationships" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Customers" value={mockCustomers.length} icon="👥" status="info" />
                <StatCard title="Active" value={mockCustomers.filter((c) => c.status === 'active').length} icon="✅" status="success" />
                <StatCard title="Open Tickets" value={mockCustomers.reduce((s, c) => s + c.tickets, 0)} icon="🎫" status="warning" />
            </div>
            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
                    <FilterSelect value={typeFilter} onChange={setTypeFilter} options={['All', 'Individual', 'Business', 'Enterprise']} />
                </div>
                <DataTable
                    columns={[
                        { key: 'name', label: 'Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'company', label: 'Company' },
                        { key: 'type', label: 'Type' },
                        { key: 'tickets', label: 'Tickets' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                    ]}
                    rows={filtered}
                />
            </Card>
        </DashboardLayout>
    );
}
