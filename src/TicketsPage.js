import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, StatCard, PrimaryButton, Alert, Select } from './components/ui';
import { adminApi, supportApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';

export default function TicketsPage() {
    const auth = useAuth();
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [transferNote, setTransferNote] = useState('');
    const [transferringId, setTransferringId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const reload = () => {
        const load = auth.role === 'SUPPORT_AGENT'
            ? supportApi.allOpen().then(setTickets)
            : adminApi.tickets().then(setTickets);
        load.catch(() => setTickets([]));
    };

    useEffect(() => {
        if (auth.role === 'CUSTOMER') return;
        reload();
    }, [auth.role]);

    const handleTransferToSales = async (ticketId) => {
        setError('');
        setMessage('');
        try {
            await supportApi.transferToSales(ticketId, transferNote || 'Customer wants to purchase');
            setTransferringId(null);
            setTransferNote('');
            setMessage('Ticket transferred to sales. A sales conversation was created for the customer.');
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

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
            {error && <Alert type="error">{error}</Alert>}
            {message && <Alert type="success">{message}</Alert>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Open" value={tickets.filter((t) => t.status === 'open').length} icon="📂" status="warning" />
                <StatCard title="In Progress" value={tickets.filter((t) => t.status === 'in_progress').length} icon="⏳" status="info" />
                <StatCard title="Resolved" value={tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length} icon="✅" status="success" />
            </div>
            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </Select>
                </div>
                <DataTable
                    columns={[
                        { key: 'id', label: 'ID', render: (r) => r.id?.slice(-6).toUpperCase() },
                        { key: 'subject', label: 'Subject' },
                        { key: 'customerName', label: 'Customer' },
                        { key: 'priority', label: 'Priority' },
                        { key: 'assigneeName', label: 'Assignee', render: (r) => r.assigneeName || 'Unassigned' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status === 'resolved' ? 'success' : row.status === 'open' ? 'warning' : 'info'} label={(row.status || '').replace('_', ' ')} /> },
                        ...(auth.role === 'SUPPORT_AGENT' ? [{
                            key: 'actions',
                            label: '',
                            render: (r) => r.transferredToSales ? (
                                <StatusBadge status="info" label="With Sales" />
                            ) : transferringId === r.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
                                    <input
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        placeholder="Note for sales (optional)"
                                        style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                    />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <PrimaryButton onClick={() => handleTransferToSales(r.id)} style={{ fontSize: 11, padding: '4px 10px' }}>Confirm</PrimaryButton>
                                        <button type="button" onClick={() => { setTransferringId(null); setTransferNote(''); }} style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)', color: '#aaa', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <PrimaryButton onClick={() => setTransferringId(r.id)} style={{ fontSize: 11, padding: '4px 10px' }}>
                                    Transfer to Sales
                                </PrimaryButton>
                            ),
                        }] : []),
                    ]}
                    rows={filtered}
                    emptyMessage="No tickets found."
                />
            </Card>
        </DashboardLayout>
    );
}
