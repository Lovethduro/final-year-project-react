import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, StatCard, PrimaryButton, Alert, Select } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { adminApi, salesApi, supervisorApi } from './utils/apiClient';
import { theme } from './styles/theme';

const QUOTE_TYPE_LABELS = {
    products_only: 'Products Only',
    products_installation: 'Products + Installation',
    installation_only: 'Installation Only',
};

function formatQuoteType(type) {
    if (!type) return '—';
    return QUOTE_TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

function formatLeadSummary(lead) {
    if (lead.details) return lead.details;
    const parts = [];
    if (lead.productName) parts.push(`Product: ${lead.productName}`);
    if (lead.quantity) parts.push(`Qty: ${lead.quantity}`);
    if (lead.deliveryAddress) parts.push(`Delivery: ${lead.deliveryAddress}`);
    if (lead.productType) parts.push(`Type: ${lead.productType}`);
    if (lead.installationAddress) parts.push(`Install: ${lead.installationAddress}`);
    if (lead.preferredInstallationDate) parts.push(`Date: ${lead.preferredInstallationDate}`);
    if (lead.existingProductDetails) parts.push(`Existing: ${lead.existingProductDetails}`);
    if (lead.siteContactName) parts.push(`Site: ${lead.siteContactName}`);
    return parts.length ? parts.join(' · ') : '—';
}

const STATUSES = ['new', 'contacted', 'qualified', 'lost', 'converted'];

const EMAIL_TEMPLATES = [
    {
        id: 'thanks',
        label: 'Thank you for your quote',
        subject: 'Thanks for your CyForce quote request',
        message: 'Thank you for requesting a quote from CyForce Technologies. I have received your details and will prepare a tailored proposal for you.\n\nIf you have any questions in the meantime, reply through your quote portal link or send a message here.',
    },
    {
        id: 'followup',
        label: 'Following up',
        subject: 'Following up on your quote',
        message: 'I wanted to follow up on your recent quote request. Please let me know if you have any questions or if you would like to discuss options further.\n\nYou can reply directly through your online quote portal — no need to schedule a call unless you prefer one.',
    },
];

export default function LeadsPage() {
    const auth = useAuth();
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });
    const [emailLead, setEmailLead] = useState(null);
    const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [assignLead, setAssignLead] = useState(null);
    const [agents, setAgents] = useState([]);
    const [assignForm, setAssignForm] = useState({ agentId: '', emergency: false, customerRequest: false, reason: '', proofUrl: '' });
    const [assigning, setAssigning] = useState(false);

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

    useEffect(() => {
        if (auth.role === 'SUPERVISOR' || auth.role === 'ADMIN') {
            supervisorApi.salesAgents().then(setAgents).catch(() => setAgents([]));
        }
    }, [auth.role]);

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
            const create = auth.role === 'SUPERVISOR' || auth.role === 'ADMIN'
                ? supervisorApi.createLead(form)
                : salesApi.createLead(form);
            await create;
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', company: '', source: 'website' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const submitAssign = async (e) => {
        e.preventDefault();
        if (!assignLead) return;
        setAssigning(true);
        setError('');
        try {
            const result = await supervisorApi.assignLead(assignLead.id, assignForm);
            setAssignLead(null);
            setAssignForm({ agentId: '', emergency: false, customerRequest: false, reason: '', proofUrl: '' });
            if (result.needsApproval) {
                setEmailSuccess(result.message || 'Sent for admin approval.');
            } else {
                setEmailSuccess(result.message || 'Lead assigned.');
            }
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setAssigning(false);
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

    const openEmailModal = (lead) => {
        setEmailLead(lead);
        setEmailForm({ subject: '', message: '' });
        setEmailSuccess('');
        setError('');
    };

    const applyEmailTemplate = (templateId) => {
        const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
        if (template) {
            setEmailForm({ subject: template.subject, message: template.message });
        }
    };

    const sendLeadEmail = async (e) => {
        e.preventDefault();
        if (!emailLead) return;
        setEmailSending(true);
        setError('');
        setEmailSuccess('');
        try {
            const result = await salesApi.sendLeadEmail(emailLead.id, emailForm);
            setEmailSuccess(result.message || 'Email sent.');
            load();
            setTimeout(() => {
                setEmailLead(null);
                setEmailSuccess('');
            }, 1800);
        } catch (err) {
            setError(err.message);
        } finally {
            setEmailSending(false);
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
            {emailSuccess && !emailLead && <Alert type="success">{emailSuccess}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Leads" value={loading ? '…' : leads.length} status="info" />
                <StatCard title="Qualified" value={loading ? '…' : leads.filter((l) => l.status === 'qualified').length} status="success" />
                <StatCard title="Converted" value={loading ? '…' : leads.filter((l) => l.status === 'converted').length} status="success" />
            </div>

            {showForm && (
                <Card title="Add New Lead" style={{ marginBottom: 20 }}>
                    <form onSubmit={addLead}>
                        <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <input style={inputStyle} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="event">Event</option>
                            <option value="cold_call">Cold Call</option>
                            <option value="social">Social</option>
                        </Select>
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
                            { key: 'quoteType', label: 'Quote type', render: (r) => formatQuoteType(r.quoteType) },
                            { key: 'details', label: 'Details', render: (r) => {
                                const summary = formatLeadSummary(r);
                                return summary !== '—' ? (
                                    <span title={summary} style={{ fontSize: 12, color: theme.textMuted }}>{summary.length > 56 ? `${summary.slice(0, 56)}…` : summary}</span>
                                ) : '—';
                            } },
                            { key: 'source', label: 'Source' },
                            { key: 'ownerName', label: 'Owner', render: (r) => r.ownerName || 'Unassigned' },
                            {
                                key: 'actions',
                                label: 'Actions',
                                render: (r) => (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {(auth.role === 'SUPERVISOR' || auth.role === 'ADMIN') && (
                                            <button
                                                type="button"
                                                onClick={() => { setAssignLead(r); setAssignForm({ agentId: '', emergency: false, customerRequest: false, reason: '', proofUrl: '' }); }}
                                                style={{ fontSize: 12, color: theme.accent, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {auth.role === 'SALES_AGENT' && r.conversationId && (
                                            <Link
                                                to={`/sales/messages?conversation=${r.conversationId}`}
                                                style={{
                                                    fontSize: 12,
                                                    color: theme.accent,
                                                    textDecoration: 'none',
                                                    padding: '4px 8px',
                                                    border: `1px solid ${theme.border}`,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                Message
                                            </Link>
                                        )}
                                        {auth.role === 'SALES_AGENT' && r.email && (
                                            <button
                                                type="button"
                                                onClick={() => openEmailModal(r)}
                                                style={{
                                                    fontSize: 12,
                                                    color: theme.text,
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${theme.border}`,
                                                    borderRadius: 6,
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    fontFamily: theme.fontBody,
                                                }}
                                            >
                                                Email
                                            </button>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (r) => auth.role === 'SALES_AGENT' ? (
                                    <Select
                                        value={r.status || 'new'}
                                        onChange={(e) => updateStatus(r.id, e.target.value)}
                                        style={{
                                            borderRadius: 6,
                                            padding: '4px 8px',
                                            fontSize: 12,
                                            width: 'auto',
                                            minWidth: 108,
                                            marginBottom: 0,
                                        }}
                                    >
                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </Select>
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

            {emailLead && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        zIndex: 1000,
                    }}
                    onClick={() => !emailSending && setEmailLead(null)}
                >
                    <div
                        style={{ ...inputStyle, width: '100%', maxWidth: 520, background: theme.bgCard, borderRadius: 12, padding: 24, marginBottom: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontFamily: theme.fontHeading, color: theme.text, margin: '0 0 8px', fontSize: 18 }}>
                            Email {emailLead.name}
                        </h3>
                        <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 16px' }}>
                            Sends from CyForce and includes a link to their quote portal if available.
                        </p>
                        {emailSuccess && <Alert type="success">{emailSuccess}</Alert>}
                        <form onSubmit={sendLeadEmail}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {EMAIL_TEMPLATES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => applyEmailTemplate(t.id)}
                                        style={{
                                            fontSize: 11,
                                            padding: '5px 10px',
                                            borderRadius: 6,
                                            border: `1px solid ${theme.border}`,
                                            background: 'transparent',
                                            color: theme.textMuted,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <input
                                style={inputStyle}
                                placeholder="Subject"
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                            />
                            <textarea
                                style={{ ...inputStyle, minHeight: 120 }}
                                placeholder="Your message"
                                value={emailForm.message}
                                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                                required
                            />
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setEmailLead(null)}
                                    disabled={emailSending}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: 8,
                                        border: `1px solid ${theme.border}`,
                                        background: 'transparent',
                                        color: theme.textMuted,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <PrimaryButton type="submit" disabled={emailSending}>
                                    {emailSending ? 'Sending…' : 'Send email'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {assignLead && (
                <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }} onClick={() => !assigning && setAssignLead(null)}>
                    <div style={{ ...inputStyle, width: '100%', maxWidth: 520, background: theme.bgCard, borderRadius: 12, padding: 24, marginBottom: 0 }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontFamily: theme.fontHeading, color: theme.text, margin: '0 0 8px', fontSize: 18 }}>Assign {assignLead.name}</h3>
                        <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 16px' }}>
                            Assign to the sales agent with the lightest load. Same agent cannot be assigned more than once per month unless you request an exception with proof.
                        </p>
                        <form onSubmit={submitAssign}>
                            <Select required value={assignForm.agentId} onChange={(e) => setAssignForm({ ...assignForm, agentId: e.target.value })} style={{ marginBottom: 12 }}>
                                <option value="">Select sales agent</option>
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id} disabled={!a.canAssign}>
                                        {a.name} ({a.activeLeads} active leads){!a.canAssign ? ' — at capacity' : ''}
                                    </option>
                                ))}
                            </Select>
                            <label style={{ display: 'flex', gap: 8, fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>
                                <input type="checkbox" checked={assignForm.emergency} onChange={(e) => setAssignForm({ ...assignForm, emergency: e.target.checked })} />
                                Emergency exception (requires admin approval)
                            </label>
                            <label style={{ display: 'flex', gap: 8, fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>
                                <input type="checkbox" checked={assignForm.customerRequest} onChange={(e) => setAssignForm({ ...assignForm, customerRequest: e.target.checked })} />
                                Customer specifically requested this agent (attach proof)
                            </label>
                            <input style={inputStyle} placeholder="Reason / notes" value={assignForm.reason} onChange={(e) => setAssignForm({ ...assignForm, reason: e.target.value })} />
                            <input style={inputStyle} placeholder="Proof URL (optional)" value={assignForm.proofUrl} onChange={(e) => setAssignForm({ ...assignForm, proofUrl: e.target.value })} />
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setAssignLead(null)} disabled={assigning} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, cursor: 'pointer' }}>Cancel</button>
                                <PrimaryButton type="submit" disabled={assigning}>{assigning ? 'Assigning…' : 'Assign lead'}</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
