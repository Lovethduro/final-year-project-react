import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, StatCard } from './components/ui';
import { adminApi, supportApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';

export default function TicketsPage() {
    const auth = useAuth();
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (auth.role === 'CUSTOMER') return;
        const load = auth.role === 'SUPPORT_AGENT'
            ? supportApi.allOpen().then(setTickets)
            : adminApi.tickets().then(setTickets);
        load.catch(() => setTickets([]));
    }, [auth.role]);

    if (auth.role === 'CUSTOMER') {
        return <Navigate to="/customer/tickets" replace />;
    }

    const filtered = tickets.filter((t) => {
        const q = search.toLowerCase();
        const matchesSearch = [t.id, t.subject, t.customerName, t.customerEmail].filter(Boolean).join(' ').toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <PageHeader title="Support Tickets" subtitle="Track and resolve customer support requests" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Open" value={tickets.filter((t) => t.status === 'open').length} icon="📂" status="warning" />
                <StatCard title="In Progress" value={tickets.filter((t) => t.status === 'in_progress').length} icon="⏳" status="info" />
                <StatCard title="Resolved" value={tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length} icon="✅" status="success" />
            </div>
            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff' }}>
                        <option value="all">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <DataTable
                    columns={[
                        { key: 'id', label: 'ID', render: (r) => r.id?.slice(-6).toUpperCase() },
                        { key: 'subject', label: 'Subject' },
                        { key: 'customerName', label: 'Customer' },
                        { key: 'priority', label: 'Priority' },
                        { key: 'assigneeName', label: 'Assignee', render: (r) => r.assigneeName || 'Unassigned' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status === 'resolved' ? 'success' : row.status === 'open' ? 'warning' : 'info'} label={(row.status || '').replace('_', ' ')} /> },
                    ]}
                    rows={filtered}
                    emptyMessage="No tickets found."
                />
            </Card>
        </DashboardLayout>
    );
}
