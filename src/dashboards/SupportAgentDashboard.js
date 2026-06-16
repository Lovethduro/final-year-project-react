import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, DataTable, StatusBadge, PrimaryButton, Alert, Select } from '../components/ui';
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

function firstName(fullName) {
    return (fullName || 'Agent').trim().split(/\s+/)[0];
}

function initials(name) {
    return (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function priorityBadgeStatus(priority) {
    const p = (priority || 'medium').toLowerCase();
    if (['critical', 'urgent', 'high'].includes(p)) return 'error';
    if (p === 'medium') return 'warning';
    return 'info';
}

function priorityLabel(priority) {
    const p = (priority || 'medium').toLowerCase();
    if (['critical', 'urgent'].includes(p)) return 'CRITICAL';
    return (priority || 'medium').toUpperCase();
}

function teamStatusColor(status) {
    const s = (status || 'offline').toLowerCase();
    if (s === 'available') return theme.success;
    if (s === 'busy') return theme.error;
    if (s === 'away' || s === 'on_break') return theme.warning;
    return theme.textDim;
}

function TransferActions({ ticketId, transferringId, transferMode, transferNote, transferAgentId, agents, onStartSales, onStartAgent, onNoteChange, onAgentChange, onConfirmSales, onConfirmAgent, onCancel }) {
    const active = transferringId === ticketId;
    if (!active) {
        return (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <Link to={`/dashboard/tickets?ticket=${ticketId}`} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: theme.primary, color: '#fff', textDecoration: 'none' }}>Quick Reply</Link>
                <button type="button" onClick={() => onStartAgent(ticketId)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer' }}>
                    Transfer to Agent
                </button>
                <button type="button" onClick={() => onStartSales(ticketId)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>
                    Transfer to Sales
                </button>
            </div>
        );
    }

    if (transferMode === 'agent') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, maxWidth: 320 }}>
                <Select value={transferAgentId} onChange={(e) => onAgentChange(e.target.value)} style={{ marginBottom: 0, fontSize: 12 }}>
                    <option value="">Select support agent…</option>
                    {agents.filter((a) => !a.self).map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.openTickets} open)</option>
                    ))}
                </Select>
                <input value={transferNote} onChange={(e) => onNoteChange(e.target.value)} placeholder="Handoff note for the next agent" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
                <div style={{ display: 'flex', gap: 6 }}>
                    <PrimaryButton onClick={() => onConfirmAgent(ticketId)} style={{ fontSize: 11, padding: '4px 10px' }}>Confirm transfer</PrimaryButton>
                    <button type="button" onClick={onCancel} style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, maxWidth: 320 }}>
            <input value={transferNote} onChange={(e) => onNoteChange(e.target.value)} placeholder="Note for sales" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
            <div style={{ display: 'flex', gap: 6 }}>
                <PrimaryButton onClick={() => onConfirmSales(ticketId)} style={{ fontSize: 11, padding: '4px 10px' }}>Confirm transfer</PrimaryButton>
                <button type="button" onClick={onCancel} style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
        </div>
    );
}

export default function SupportAgentDashboard() {
    const auth = useAuth();
    const [overview, setOverview] = useState(null);
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [transferringId, setTransferringId] = useState(null);
    const [transferMode, setTransferMode] = useState(null);
    const [transferNote, setTransferNote] = useState('');
    const [transferAgentId, setTransferAgentId] = useState('');
    const [timer, setTimer] = useState(0);

    const load = () => {
        supportApi.overview().then(setOverview).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        supportApi.agents().then(setAgents).catch(() => setAgents([]));
    }, []);

    useEffect(() => {
        const base = overview?.agentStatus?.statusSeconds || 0;
        setTimer(base);
        const id = setInterval(() => setTimer((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, [overview?.agentStatus?.statusSeconds, overview?.agentStatus?.status]);

    const stats = overview?.stats || {};
    const agentStatus = overview?.agentStatus || {};
    const topPriority = overview?.priorityTickets?.[0];
    const performance = overview?.todayPerformance || {};

    const setAgentStatus = async (status) => {
        try {
            await supportApi.updateAgentStatus(status);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const resetTransfer = () => {
        setTransferringId(null);
        setTransferMode(null);
        setTransferNote('');
        setTransferAgentId('');
    };

    const transferToSales = async (ticketId) => {
        setError('');
        setSuccess('');
        try {
            await supportApi.transferToSales(ticketId, transferNote || 'Customer wants to purchase');
            resetTransfer();
            setSuccess('Ticket transferred to sales.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const transferToAgent = async (ticketId) => {
        if (!transferAgentId) {
            setError('Select an agent to transfer to.');
            return;
        }
        setError('');
        setSuccess('');
        try {
            await supportApi.transferToAgent(ticketId, transferAgentId, transferNote || 'Handoff from dashboard');
            resetTransfer();
            setSuccess('Ticket transferred to another support agent.');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <WelcomeBanner
                title={`Hello, ${firstName(auth.fullName)}! 👋`}
                subtitle={formatDate()}
                badge={`${(agentStatus.status || 'available').replace('_', ' ')} · ${formatTimer(timer)}`}
            >
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 4 }}>Current Shift</div>
                    <div style={{ fontSize: 14, color: theme.text, fontWeight: 500 }}>{agentStatus.shiftLabel || '8:00 AM – 4:00 PM'}</div>
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
                <MetricCard label="Satisfaction Rating" value={stats.satisfactionRating ? `${stats.satisfactionRating}` : '—'} accent={theme.success} />
                <MetricCard label="SLA Compliance" value={`${stats.slaCompliance ?? 0}%`} accent={stats.slaCompliance >= 90 ? theme.success : theme.warning} />
            </div>

            <QuickActions actions={[
                { to: '/dashboard/tickets', label: 'Create New Ticket' },
                { label: 'View My Tickets', onClick: () => document.getElementById('active-tickets')?.scrollIntoView({ behavior: 'smooth' }) },
                { to: '/dashboard/knowledge-base', label: 'Search Knowledge Base' },
                topPriority?.customerEmail
                    ? { label: 'Contact Customer', onClick: () => { window.location.href = `mailto:${topPriority.customerEmail}`; } }
                    : { to: '/dashboard/tickets', label: 'Contact Customer' },
            ]} />

            <div id="priority-tickets">
                <Card title="Needs Your Attention" style={{ marginBottom: 24 }}>
                    {(overview?.priorityTickets || []).length ? overview.priorityTickets.map((t) => (
                        <div key={t.id} style={{ padding: 14, marginBottom: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `0.5px solid ${t.slaBreached ? theme.error : theme.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                <div>
                                    <StatusBadge status={priorityBadgeStatus(t.priority)} label={priorityLabel(t.priority)} />
                                    <span style={{ color: theme.accent, fontSize: 12, margin: '0 8px' }}>{t.ticketNumber}</span>
                                    <strong style={{ color: theme.text }}>{t.subject}</strong>
                                </div>
                                {t.slaEscalated && <StatusBadge status="error" label="Escalated" />}
                            </div>
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 4 }}>
                                {t.customerName || t.customerEmail || 'Customer'}
                            </div>
                            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>
                                {t.slaRemaining}
                                {t.openedAt ? ` · Opened ${t.openedAt}` : ''}
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 4 }}>
                                <div style={{ width: `${t.slaPercent}%`, height: '100%', background: t.slaBreached ? theme.error : theme.warning, borderRadius: 4 }} />
                            </div>
                            <TransferActions
                                ticketId={t.id}
                                transferringId={transferringId}
                                transferMode={transferMode}
                                transferNote={transferNote}
                                transferAgentId={transferAgentId}
                                agents={agents}
                                onStartSales={(id) => { setTransferringId(id); setTransferMode('sales'); }}
                                onStartAgent={(id) => { setTransferringId(id); setTransferMode('agent'); }}
                                onNoteChange={setTransferNote}
                                onAgentChange={setTransferAgentId}
                                onConfirmSales={transferToSales}
                                onConfirmAgent={transferToAgent}
                                onCancel={resetTransfer}
                            />
                        </div>
                    )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No priority tickets right now.</p>}
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 320px)', gap: 20 }}>
                <div>
                    <div id="active-tickets">
                        <Card
                            title={(
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                    <span>My Active Tickets</span>
                                    <Link to="/dashboard/tickets" style={{ fontSize: 12, color: theme.accent, textDecoration: 'none' }}>View All →</Link>
                                </div>
                            )}
                            style={{ marginBottom: 24 }}
                        >
                            <DataTable
                                columns={[
                                    { key: 'ticketNumber', label: '#' },
                                    { key: 'subject', label: 'Subject' },
                                    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={priorityBadgeStatus(r.priority)} label={priorityLabel(r.priority)} /> },
                                    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status === 'resolved' ? 'success' : 'info'} label={(r.status || '').replace('_', ' ')} /> },
                                    { key: 'slaPercent', label: 'SLA', render: (r) => (
                                        <div style={{ minWidth: 80 }}>
                                            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                                <div style={{ width: `${r.slaPercent}%`, height: '100%', background: r.slaBreached ? theme.error : theme.accent, borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontSize: 10, color: theme.textDim }}>{r.slaRemaining}</span>
                                        </div>
                                    )},
                                    { key: 'lastUpdate', label: 'Updated' },
                                    { key: 'actions', label: '', render: (r) => (
                                        <Link to={`/dashboard/tickets?ticket=${r.id}`} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: theme.primary, color: '#fff', textDecoration: 'none' }}>Quick Reply</Link>
                                    )},
                                ]}
                                rows={overview?.activeTickets || []}
                            />
                        </Card>
                    </div>

                    <Card title="Recent Activity">
                        <ActivityTimeline items={(overview?.recentActivity || []).map((a) => ({ title: a.title, time: a.time }))} />
                    </Card>
                </div>

                <div>
                    <Card title="Today's Performance" style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>
                            Target vs Achieved · {performance.achieved ?? 0} / {performance.target ?? 8}
                        </div>
                        <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }}>
                            <div style={{ width: `${performance.percent ?? 0}%`, height: '100%', background: `linear-gradient(90deg, ${theme.primary}, ${theme.success})`, borderRadius: 6 }} />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: theme.text, marginTop: 12 }}>{performance.percent ?? 0}%</div>
                        {performance.statusMessage && (
                            <div style={{ fontSize: 13, color: theme.success, marginTop: 8 }}>{performance.statusMessage} 🎯</div>
                        )}
                        {performance.estimatedCompletion && (
                            <div style={{ fontSize: 12, color: theme.textDim, marginTop: 6 }}>
                                Est. completion: {performance.estimatedCompletion}
                            </div>
                        )}
                    </Card>

                    <Card title="Recent Feedback" style={{ marginBottom: 20 }}>
                        {(overview?.recentFeedback || []).length ? overview.recentFeedback.map((f, i) => (
                            <div key={i} style={{ padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: 13, color: theme.text }}>{f.customerName}</strong>
                                    <StarRating rating={f.rating} />
                                </div>
                                {f.companyName && <div style={{ fontSize: 11, color: theme.textDim }}>{f.companyName}</div>}
                                <p style={{ fontSize: 12, color: theme.textMuted, margin: '6px 0 0' }}>{f.comment}</p>
                                {f.ticketId && (
                                    <Link to={`/dashboard/tickets?ticket=${f.ticketId}`} style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>
                                        View Ticket {f.ticketNumber ? `#${f.ticketNumber}` : ''}
                                    </Link>
                                )}
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No feedback yet.</p>}
                    </Card>

                    <Card title="Suggested Articles" style={{ marginBottom: 20 }}>
                        {(overview?.suggestedArticles || []).map((a) => (
                            <Link key={a.id} to="/dashboard/knowledge-base" style={{ display: 'block', padding: '10px 0', borderBottom: `0.5px solid ${theme.border}`, textDecoration: 'none' }}>
                                <div style={{ color: theme.text, fontSize: 13, marginBottom: 4 }}>{a.title}</div>
                                <div style={{ fontSize: 11, color: theme.textDim }}>{a.category}{a.views != null ? ` · ${a.views} views` : ''}</div>
                            </Link>
                        ))}
                    </Card>

                    <Card title="Team Availability">
                        {(overview?.teamAvailability || []).map((m) => (
                            <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: theme.accent,
                                        flexShrink: 0,
                                    }}>
                                        {initials(m.name)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, color: theme.text }}>{m.name}</div>
                                        <div style={{ fontSize: 11, color: teamStatusColor(m.status) }}>{(m.status || 'offline').replace('_', ' ')}</div>
                                    </div>
                                </div>
                                {m.userId !== auth.userId && (
                                    <Link to="/dashboard/tickets" style={{ fontSize: 11, color: theme.accent, textDecoration: 'none', flexShrink: 0 }}>
                                        Hand off
                                    </Link>
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
