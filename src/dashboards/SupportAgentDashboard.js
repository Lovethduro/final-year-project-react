import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, DataTable, StatusBadge, PrimaryButton, Alert } from '../components/ui';
import { WelcomeBanner, QuickActions, ActivityTimeline, StatusToggle, StarRating, MetricCard } from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { supportApi } from '../utils/apiClient';
import { theme } from '../styles/theme';

const STATUS_OPTIONS = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'away', label: 'Away' },
    { value: 'on_break', label: 'On Break' },
];

function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTimer(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function SupportAgentDashboard() {
    const auth = useAuth();
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState('');
    const [replyTicket, setReplyTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [transferringId, setTransferringId] = useState(null);
    const [transferNote, setTransferNote] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(0);
    const formRef = useRef(null);

    const load = () => {
        supportApi.overview().then(setOverview).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const base = overview?.agentStatus?.statusSeconds || 0;
        setTimer(base);
        const id = setInterval(() => setTimer((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [overview?.agentStatus?.statusSeconds, overview?.agentStatus?.status]);

    const stats = overview?.stats || {};
    const agentStatus = overview?.agentStatus || {};

    const setAgentStatus = async (status) => {
        try {
            await supportApi.updateAgentStatus(status);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const quickReply = async (ticketId) => {
        if (!replyText.trim()) return;
        try {
            await supportApi.respond(ticketId, replyText, false);
            setReplyText('');
            setReplyTicket(null);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const transferToSales = async (ticketId) => {
        setError('');
        setSuccess('');
        try {
            await supportApi.transferToSales(ticketId, transferNote || 'Customer wants to purchase');
            setTransferringId(null);
            setTransferNote('');
            setSuccess('Ticket transferred to sales.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <WelcomeBanner
                title={`Welcome back, ${auth.fullName || 'Agent'}`}
                subtitle={formatDate()}
                badge={`Status: ${(agentStatus.status || 'available').replace('_', ' ')}`}
            >
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: theme.accent, fontFamily: 'monospace' }}>{formatTimer(timer)}</div>
                    <div style={{ fontSize: 12, color: theme.textDim }}>{agentStatus.shiftLabel || 'Shift'}</div>
                </div>
            </WelcomeBanner>

            <div style={{ marginBottom: 20 }}>
                <StatusToggle value={agentStatus.status || 'available'} options={STATUS_OPTIONS} onChange={setAgentStatus} />
            </div>

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24 }}>
                <MetricCard label="My Open Tickets" value={stats.openTickets ?? 0} accent={theme.accent} />
                <MetricCard label="Avg Response Time" value={stats.avgResponseTime || '—'} accent={theme.warning} />
                <MetricCard label="Resolved Today" value={stats.resolvedToday ?? 0} accent={theme.success} />
                <MetricCard label="Satisfaction Rating" value={stats.satisfactionRating ? `${stats.satisfactionRating}/5` : '—'} accent={theme.success} />
                <MetricCard label="SLA Compliance" value={`${stats.slaCompliance ?? 0}%`} accent={stats.slaCompliance >= 90 ? theme.success : theme.warning} />
            </div>

            <QuickActions actions={[
                { label: 'Create New Ticket', onClick: () => formRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'View My Tickets', onClick: () => document.getElementById('active-tickets')?.scrollIntoView({ behavior: 'smooth' }) },
                { to: '/dashboard/knowledge-base', label: 'Search Knowledge Base' },
                { label: 'Contact Customer', onClick: () => document.getElementById('priority-tickets')?.scrollIntoView({ behavior: 'smooth' }) },
            ]} />

            <div id="priority-tickets">
            <Card title="Needs Your Attention" style={{ marginBottom: 24 }}>
                {(overview?.priorityTickets || []).length ? overview.priorityTickets.map((t) => (
                    <div key={t.id} style={{ padding: 14, marginBottom: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `0.5px solid ${t.slaBreached ? theme.error : theme.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            <div>
                                <span style={{ color: theme.accent, fontSize: 12, marginRight: 8 }}>{t.ticketNumber}</span>
                                <strong style={{ color: theme.text }}>{t.subject}</strong>
                            </div>
                            <StatusBadge status={t.priority === 'high' ? 'error' : 'warning'} label={t.priority} />
                        </div>
                        <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8 }}>{t.customerEmail} · {t.slaRemaining}</div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 10 }}>
                            <div style={{ width: `${t.slaPercent}%`, height: '100%', background: t.slaBreached ? theme.error : theme.warning, borderRadius: 4 }} />
                        </div>
                        <PrimaryButton onClick={() => setReplyTicket(t)} style={{ fontSize: 12, padding: '6px 14px', marginRight: 8 }}>Quick Reply</PrimaryButton>
                        {!t.transferredToSales && (
                            transferringId === t.id ? (
                                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                                    <input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Note for sales" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <PrimaryButton onClick={() => transferToSales(t.id)} style={{ fontSize: 11, padding: '4px 10px' }}>Confirm transfer</PrimaryButton>
                                        <button type="button" onClick={() => { setTransferringId(null); setTransferNote(''); }} style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setTransferringId(t.id)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>
                                    Transfer to Sales
                                </button>
                            )
                        )}
                    </div>
                )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No priority tickets right now.</p>}
            </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div>
                    <div id="active-tickets">
                        <Card title="My Active Tickets" style={{ marginBottom: 24 }}>
                            <DataTable
                                columns={[
                                    { key: 'ticketNumber', label: '#' },
                                    { key: 'subject', label: 'Subject' },
                                    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority === 'high' ? 'error' : 'warning'} label={r.priority} /> },
                                    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'resolved' ? 'success' : 'info'} label={r.status} /> },
                                    { key: 'slaPercent', label: 'SLA', render: (r) => (
                                        <div style={{ minWidth: 80 }}>
                                            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                                <div style={{ width: `${r.slaPercent}%`, height: '100%', background: r.slaBreached ? theme.error : theme.accent, borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontSize: 10, color: theme.textDim }}>{r.slaRemaining}</span>
                                        </div>
                                    )},
                                    { key: 'lastUpdate', label: 'Updated' },
                                    { key: 'actions', label: '', render: (r) => r.transferredToSales ? (
                                        <StatusBadge status="info" label="With Sales" />
                                    ) : transferringId === r.id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                                            <input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Note for sales" style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <PrimaryButton onClick={() => transferToSales(r.id)} style={{ fontSize: 10, padding: '3px 8px' }}>Confirm</PrimaryButton>
                                                <button type="button" onClick={() => { setTransferringId(null); setTransferNote(''); }} style={{ fontSize: 10, padding: '3px 8px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setTransferringId(r.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>
                                            Transfer to Sales
                                        </button>
                                    )},
                                ]}
                                rows={overview?.activeTickets || []}
                            />
                        </Card>
                    </div>

                    <Card title="Recent Activity Feed">
                        <ActivityTimeline items={(overview?.recentActivity || []).map((a) => ({ title: `${a.type}: ${a.title}`, time: a.time }))} />
                    </Card>
                </div>

                <div>
                    <Card title="Today's Performance" style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>
                            Target: {overview?.todayPerformance?.target ?? 8} · Achieved: {overview?.todayPerformance?.achieved ?? 0}
                        </div>
                        <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }}>
                            <div style={{ width: `${overview?.todayPerformance?.percent ?? 0}%`, height: '100%', background: `linear-gradient(90deg, ${theme.primary}, ${theme.success})`, borderRadius: 6 }} />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: theme.text, marginTop: 12 }}>{overview?.todayPerformance?.percent ?? 0}%</div>
                    </Card>

                    <Card title="Recent Feedback" style={{ marginBottom: 20 }}>
                        {(overview?.recentFeedback || []).length ? overview.recentFeedback.map((f, i) => (
                            <div key={i} style={{ padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: 13, color: theme.text }}>{f.customerName}</strong>
                                    <StarRating rating={f.rating} />
                                </div>
                                <div style={{ fontSize: 11, color: theme.textDim }}>{f.companyName}</div>
                                <p style={{ fontSize: 12, color: theme.textMuted, margin: '6px 0 0' }}>{f.comment}</p>
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No feedback yet.</p>}
                    </Card>

                    <Card title="Suggested Articles" style={{ marginBottom: 20 }}>
                        {(overview?.suggestedArticles || []).map((a) => (
                            <Link key={a.id} to="/dashboard/knowledge-base" style={{ display: 'block', padding: '8px 0', color: theme.accent, fontSize: 13, textDecoration: 'none' }}>
                                {a.title} <span style={{ color: theme.textDim }}>({a.category})</span>
                            </Link>
                        ))}
                    </Card>

                    <Card title="Team Availability">
                        {(overview?.teamAvailability || []).map((m) => (
                            <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <span style={{ fontSize: 13, color: theme.text }}>{m.name}</span>
                                <span style={{ fontSize: 11, color: theme.textMuted }}>{m.status?.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            {replyTicket && (
                <Card title={`Quick Reply: ${replyTicket.subject}`} style={{ marginTop: 20 }}>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 12, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <PrimaryButton onClick={() => quickReply(replyTicket.id)}>Send</PrimaryButton>
                        <button type="button" onClick={() => setReplyTicket(null)} style={{ background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textMuted, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </Card>
            )}

            <div ref={formRef} style={{ marginTop: 20 }}>
                <Link to="/profile" style={{ color: theme.accent, fontSize: 14 }}>Profile settings →</Link>
            </div>
        </DashboardLayout>
    );
}
