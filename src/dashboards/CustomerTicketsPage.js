import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, PrimaryButton, Alert, Select } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { customerApi, assetUrl } from '../utils/apiClient';
import { theme } from '../styles/theme';
import { refreshNotifications } from '../utils/notifications';
import { AgentChatHeader, ChatMessageRow } from '../components/ChatMessage';
import { StarRatingInput } from '../components/StarRatingInput';

export default function CustomerTicketsPage() {
    const auth = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
    const [attachment, setAttachment] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [ticketRating, setTicketRating] = useState(0);
    const [ticketRatingComment, setTicketRatingComment] = useState('');
    const [ticketRated, setTicketRated] = useState(false);
    const [estimatedResponse, setEstimatedResponse] = useState(null);

    const loadTickets = () => {
        customerApi.tickets().then(setTickets).catch((err) => setError(err.message));
    };

    useEffect(() => { loadTickets(); }, []);

    const openTicket = async (id) => {
        setError('');
        setTicketRating(0);
        setTicketRatingComment('');
        setTicketRated(false);
        try {
            const data = await customerApi.getTicket(id);
            setSelected(data.ticket);
            setMessages(data.messages || []);
            setEstimatedResponse(data.estimatedResponse || null);
        } catch (err) {
            setError(err.message);
        }
    };

    const submitTicketRating = async (e) => {
        e.preventDefault();
        if (!selected || ticketRating < 1) return;
        try {
            await customerApi.rateTicket(selected.id, ticketRating, ticketRatingComment.trim());
            setTicketRated(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const submitTicket = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (attachment) {
                await customerApi.createTicketWithAttachment(form, attachment);
            } else {
                await customerApi.createTicket(form);
            }
            setShowForm(false);
            setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
            setAttachment(null);
            loadTickets();
            refreshNotifications();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sendReply = async (e) => {
        e.preventDefault();
        if (!selected || !reply.trim()) return;
        try {
            await customerApi.replyToTicket(selected.id, reply.trim());
            setReply('');
            openTicket(selected.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 };

    return (
        <DashboardLayout>
            <PageHeader
                title="My Support Tickets"
                subtitle="Only your tickets are shown here"
                action={(
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link
                            to="/customer/support"
                            style={{
                                fontSize: 13,
                                color: theme.accent,
                                textDecoration: 'none',
                                padding: '8px 14px',
                                border: `0.5px solid ${theme.border}`,
                                borderRadius: 8,
                            }}
                        >
                            Contact Support
                        </Link>
                        <PrimaryButton onClick={() => setShowForm(true)}>+ New Ticket</PrimaryButton>
                    </div>
                )}
            />
            {error && <Alert type="error">{error}</Alert>}

            {showForm && (
                <Card title="Create Ticket" style={{ marginBottom: 24 }}>
                    <form onSubmit={submitTicket}>
                        <input style={inputStyle} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                        <textarea style={{ ...inputStyle, minHeight: 100 }} placeholder="Describe your issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                        <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            <option value="general">General</option>
                            <option value="billing">Billing / Payment</option>
                            <option value="technical">Technical</option>
                        </Select>
                        <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                            <option value="urgent">Urgent</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </Select>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Attach screenshot or image (optional)</label>
                            <input type="file" accept="image/*" onChange={(e) => setAttachment(e.target.files?.[0] || null)} style={{ color: theme.textMuted, fontSize: 13 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit Ticket'}</PrimaryButton>
                            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textMuted, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
                <Card title="Your Tickets">
                    <DataTable
                        columns={[
                            { key: 'id', label: '#', render: (r) => r.id?.slice(-6).toUpperCase() },
                            { key: 'subject', label: 'Subject' },
                            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'resolved' ? 'success' : 'warning'} label={r.status} /> },
                            { key: 'priority', label: 'Priority' },
                            { key: 'actions', label: '', render: (r) => (
                                <button type="button" onClick={() => openTicket(r.id)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.primary, color: '#fff', cursor: 'pointer' }}>View</button>
                            )},
                        ]}
                        rows={tickets}
                        emptyMessage="No tickets yet. Create one to get help."
                    />
                </Card>

                {selected && (
                    <Card title={selected.subject}>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
                            Status: <StatusBadge status={selected.status === 'resolved' ? 'success' : 'warning'} label={selected.status} />
                            {' · '}Priority: {selected.priority}
                        </div>
                        {estimatedResponse && (
                            <div style={{
                                marginBottom: 12,
                                borderRadius: 8,
                                border: `0.5px solid ${theme.accent}55`,
                                background: 'rgba(56,189,248,0.08)',
                                padding: '10px 12px',
                                fontSize: 12,
                                color: theme.textMuted,
                            }}>
                                <span style={{ color: theme.text, fontWeight: 600 }}>Estimated first response:</span>{' '}
                                <span style={{ color: theme.accent, fontWeight: 600 }}>{estimatedResponse.estimatedLabel}</span>
                                {' · '}SLA target: {estimatedResponse.policyLabel}
                            </div>
                        )}
                        <p style={{ fontSize: 14, color: theme.text, marginBottom: 12 }}>{selected.description}</p>
                        {selected.assigneeName && (
                            <AgentChatHeader
                                name={selected.assigneeName}
                                imageUrl={selected.assigneeAvatarUrl}
                                roleLabel="Support Agent"
                            />
                        )}
                        {selected.attachmentUrl && (
                            <img src={assetUrl(selected.attachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 16 }} />
                        )}
                        <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16, borderTop: `0.5px solid ${theme.border}`, paddingTop: 12 }}>
                            {messages.length ? messages.map((m) => {
                                const mine = m.authorId === auth.userId;
                                return (
                                <div key={m.id} style={{ marginBottom: 4 }}>
                                    <ChatMessageRow
                                        message={{ ...m, messageType: 'text' }}
                                        isMine={mine}
                                        showAvatar={!mine}
                                    />
                                    <div style={{ fontSize: 10, color: theme.textDim, margin: mine ? '-8px 0 8px 0' : '-8px 0 8px 42px', textAlign: mine ? 'right' : 'left' }}>
                                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                                    </div>
                                </div>
                            ); }) : <p style={{ color: theme.textDim, fontSize: 13 }}>No messages yet.</p>}
                        </div>
                        {selected.status !== 'closed' && selected.status !== 'resolved' && (
                            <form onSubmit={sendReply}>
                                <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." rows={3} style={inputStyle} required />
                                <PrimaryButton type="submit">Send Reply</PrimaryButton>
                            </form>
                        )}
                        {['resolved', 'closed'].includes(selected.status) && !ticketRated && (
                            <form onSubmit={submitTicketRating} style={{ marginTop: 12, padding: 14, borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: `0.5px solid ${theme.success}44` }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: theme.success, marginBottom: 8 }}>Rate your support experience</div>
                                <StarRatingInput value={ticketRating} onChange={setTicketRating} />
                                <textarea value={ticketRatingComment} onChange={(e) => setTicketRatingComment(e.target.value)} placeholder="Optional comment…" rows={2} style={inputStyle} />
                                <PrimaryButton type="submit" disabled={ticketRating < 1}>Submit Rating</PrimaryButton>
                            </form>
                        )}
                        {ticketRated && (
                            <p style={{ fontSize: 13, color: theme.success, marginTop: 12 }}>Thank you for your feedback!</p>
                        )}
                        <button type="button" onClick={() => { setSelected(null); setEstimatedResponse(null); }} style={{ marginTop: 12, background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}>← Back to list</button>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
