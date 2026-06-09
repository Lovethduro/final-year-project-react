import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, StatCard, PrimaryButton, Alert } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { adminApi, salesApi, supervisorApi } from './utils/apiClient';
import { theme } from './styles/theme';

const STATUSES = ['new', 'contacted', 'qualified', 'lost', 'converted'];

export default function LeadsPage() {
    const auth = useAuth();
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });

    const load = () => {
        setLoading(true);
        setError('');
        const request = auth.role === 'SALES_AGENT'
            ? salesApi.leads()
            : auth.role === 'SUPERVISOR'
                ? supervisorApi.leads()
                : adminApi.leads();

        request
            .then(setLeads)
            .catch((err) => {
                setError(err.message);
                setLeads([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [auth.role]);

    const filtered = leads.filter((lead) => {
        const q = search.toLowerCase();
        const matchesSearch = [lead.name, lead.email, lead.source, lead.company].filter(Boolean).join(' ').toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' || (lead.status || 'new') === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const addLead = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await salesApi.createLead(form);
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', company: '', source: 'website' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const updateStatus = async (id, status) => {
        setError('');
        try {
            await salesApi.updateLead(id, { status });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${theme.border}`,
        borderRadius: 8,
        padding: 10,
        color: theme.text,
        fontFamily: theme.fontBody,
        marginBottom: 12,
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Leads"
                subtitle="Track prospects through your sales pipeline"
                action={['ADMIN', 'SUPERVISOR', 'SALES_AGENT'].includes(auth.role) ? (
                    <PrimaryButton onClick={() => setShowForm(!showForm)}>+ Add Lead</PrimaryButton>
                ) : null}
            />

            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Leads" value={loading ? '…' : leads.length} icon="🎯" status="info" />
                <StatCard title="Qualified" value={loading ? '…' : leads.filter((l) => l.status === 'qualified').length} icon="⭐" status="success" />
                <StatCard title="Converted" value={loading ? '…' : leads.filter((l) => l.status === 'converted').length} icon="🏆" status="success" />
            </div>

            {showForm && (
                <Card title="Add New Lead" style={{ marginBottom: 20 }}>
                    <form onSubmit={addLead}>
                        <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <input style={inputStyle} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        <select style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="event">Event</option>
                            <option value="cold_call">Cold Call</option>
                        </select>
                        <PrimaryButton type="submit">Save Lead</PrimaryButton>
                    </form>
                </Card>
            )}

            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
                    <FilterSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={['All', 'New', 'Contacted', 'Qualified', 'Lost', 'Converted']}
                    />
                </div>
                {loading ? (
                    <p style={{ color: theme.textDim }}>Loading leads…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'name', label: 'Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'source', label: 'Source' },
                            { key: 'score', label: 'Score', render: (r) => r.score ?? '—' },
                            { key: 'ownerName', label: 'Owner', render: (r) => r.ownerName || 'Unassigned' },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (r) => ['ADMIN', 'SUPERVISOR', 'SALES_AGENT'].includes(auth.role) ? (
                                    <select
                                        value={r.status || 'new'}
                                        onChange={(e) => updateStatus(r.id, e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: 4, fontSize: 12 }}
                                    >
                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                ) : (
                                    <StatusBadge status={r.status === 'converted' ? 'success' : 'info'} label={r.status || 'new'} />
                                ),
                            },
                        ]}
                        rows={filtered}
                        emptyMessage="No leads yet. Add a lead or check that the backend is running."
                    />
                )}
            </Card>
        </DashboardLayout>
    );
}
