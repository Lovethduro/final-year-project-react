import { useCallback, useEffect, useState } from 'react';
import { Card, DataTable, StatusBadge, Alert, Select } from '../components/ui';
import { WelcomeBanner, QuickActions, DonutChart, LineChart, GaugeChart, HorizontalBarChart, StarRating, MetricCard } from '../components/dashboard/DashboardWidgets';
import { supervisorApi } from '../utils/apiClient';
import { theme } from '../styles/theme';

const TEAM_OPTIONS = [
    { value: 'all', label: 'All Teams' },
    { value: 'sales', label: 'Sales Team' },
    { value: 'support', label: 'Support Team' },
];

const STATUS_COLORS = { Open: '#1A4A9E', 'In Progress': '#FBBF24', Resolved: '#34D399', Closed: '#94A3B8' };
const TREND_TABS = ['total', 'resolved', 'open'];

function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function medalLabel(medal, rank) {
    if (medal === 'gold') return '1st';
    if (medal === 'silver') return '2nd';
    if (medal === 'bronze') return '3rd';
    return `#${rank}`;
}

export default function SupervisorDashboard() {
    const [team, setTeam] = useState('all');
    const [overview, setOverview] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [trendTab, setTrendTab] = useState('total');
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    const load = useCallback(() => {
        Promise.all([
            supervisorApi.overview(team),
            supervisorApi.feedback().catch(() => []),
        ])
            .then(([overviewData, feedbackData]) => {
                setOverview(overviewData);
                setFeedback(feedbackData || []);
            })
            .catch((err) => setError(err.message));
    }, [team]);

    useEffect(() => { load(); }, [load]);

    const stats = overview?.stats || {};

    const handleApprove = async (id) => {
        setActionId(id);
        try {
            await supervisorApi.approve(id);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id) => {
        setActionId(id);
        try {
            await supervisorApi.reject(id);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const trendData = (overview?.ticketVolumeTrend || []).map((d) => ({
        label: d.label,
        total: d.total,
        resolved: d.resolved,
        open: d.open,
    }));

    const workloadItems = (overview?.agentWorkload || []).map((w) => ({
        label: w.agentName,
        value: w.openTickets,
        overloaded: w.overloaded,
    }));

    const statusSlices = (overview?.ticketsByStatus || []).map((s) => ({
        label: s.label,
        value: s.value,
        color: STATUS_COLORS[s.label] || theme.accent,
    }));

    return (
        <>
                    <WelcomeBanner
                title={`Supervisor Dashboard`}
                subtitle={`Team overview for ${formatDate()}`}
            >
                <Select value={team} onChange={(e) => setTeam(e.target.value)} style={{ width: 'auto' }}>
                    {TEAM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
            </WelcomeBanner>

            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24 }}>
                <MetricCard label="Open Tickets" value={stats.openTickets ?? 0} detail="Awaiting response" accent={theme.warning} />
                <MetricCard label="Avg Response Time" value={stats.avgResponseTime || '-'} accent={theme.accent} />
                <MetricCard label="Avg Resolution Time" value={stats.avgResolutionTime || '-'} accent={theme.accent} />
                <MetricCard label="Customer Satisfaction" value={stats.customerSatisfaction ? `${stats.customerSatisfaction}/5` : '-'} accent={theme.success} />
                <MetricCard label="Sales Target" value={`${stats.salesAchieved ?? 0}/${stats.salesTarget ?? 20}`} accent={theme.success} />
                <MetricCard label="Open Escalations" value={stats.openEscalations ?? 0} accent={theme.error} />
            </div>

            <QuickActions actions={[
                { to: '/dashboard/tickets', label: 'View All Tickets' },
                { to: '/dashboard/performance', label: 'Team Performance' },
                { to: '/dashboard/broadcast', label: 'Broadcast Message' },
                { to: '/dashboard/approvals', label: 'Approvals' },
            ]} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div>
                    <Card title="Ticket Volume Trend (14 days)" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {TREND_TABS.map((tab) => (
                                <button key={tab} type="button" onClick={() => setTrendTab(tab)} style={{
                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: trendTab === tab ? theme.primary : 'rgba(15,23,42,0.04)',
                                    color: trendTab === tab ? '#fff' : theme.textMuted, fontSize: 12, textTransform: 'capitalize',
                                }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <LineChart data={trendData} series={[trendTab]} height={160} />
                    </Card>

                    <Card title="Agent Workload Distribution" style={{ marginBottom: 24 }}>
                        <HorizontalBarChart items={workloadItems} />
                    </Card>

                    <Card title="Pending Approvals / Reviews" style={{ marginBottom: 24 }}>
                        {(overview?.pendingApprovals || []).length ? (
                            <DataTable
                                columns={[
                                    { key: 'name', label: 'Name' },
                                    { key: 'email', label: 'Email' },
                                    { key: 'role', label: 'Role' },
                                    { key: 'type', label: 'Type' },
                                    { key: 'actions', label: 'Actions', render: (r) => (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button type="button" disabled={actionId === (r.id || r.approvalId)} onClick={() => handleApprove(r.id || r.approvalId)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                            <button type="button" disabled={actionId === (r.id || r.approvalId)} onClick={() => handleReject(r.id || r.approvalId)} style={{ padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )},
                                ]}
                                rows={overview.pendingApprovals}
                            />
                        ) : <p style={{ color: theme.textDim, fontSize: 13 }}>No pending approvals.</p>}
                    </Card>

                    <Card title="Recent Customer Feedback">
                        {(feedback.length ? feedback : overview?.recentFeedback || []).slice(0, 8).map((f, i) => (
                            <div key={f.id || i} style={{ padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ color: theme.text }}>{f.customerName || f.companyName}</strong>
                                    <StarRating rating={f.rating} />
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>
                                    {f.type || 'feedback'} · {f.agentName || '-'}
                                </div>
                                <p style={{ fontSize: 13, color: theme.textMuted, margin: '6px 0 0' }}>{f.comment}</p>
                            </div>
                        ))}
                        {!feedback.length && !(overview?.recentFeedback || []).length && (
                            <p style={{ color: theme.textDim, fontSize: 13 }}>No feedback yet.</p>
                        )}
                    </Card>
                </div>

                <div>
                    <Card title="Team Performance Leaderboard" style={{ marginBottom: 20 }}>
                        {(overview?.teamLeaderboard || []).map((agent) => (
                            <div key={agent.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: theme.accent }}>{agent.medal ? medalLabel(agent.medal, agent.rank) : `#${agent.rank}`}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{agent.name}</div>
                                    <div style={{ fontSize: 11, color: theme.textDim }}>{agent.ticketsResolved} resolved · {agent.avgResponse}</div>
                                </div>
                                <span style={{ fontSize: 12, color: theme.warning }}>â˜… {agent.rating}</span>
                            </div>
                        ))}
                    </Card>

                    <Card title="SLA Compliance" style={{ marginBottom: 20 }}>
                        <GaugeChart percent={overview?.slaCompliancePercent ?? 0} label="Compliance" />
                    </Card>

                    <Card title="Recent Alerts" style={{ marginBottom: 20 }}>
                        {(overview?.recentAlerts || []).map((a) => (
                            <div key={a.id} style={{ padding: 10, marginBottom: 8, background: 'rgba(15,23,42,0.03)', borderRadius: 8, borderLeft: `3px solid ${a.priority === 'critical' ? theme.error : theme.warning}` }}>
                                <div style={{ fontSize: 11, color: a.priority === 'critical' ? theme.error : theme.warning }}>{a.type}</div>
                                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{a.message}</div>
                            </div>
                        ))}
                    </Card>

                    <Card title="Team Availability Status" style={{ marginBottom: 20 }}>
                        {(overview?.teamAvailability || []).map((m) => (
                            <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <span style={{ fontSize: 13, color: theme.text }}>{m.name}</span>
                                <StatusBadge status={
                                    m.status === 'available' || m.status === 'online' ? 'success'
                                        : m.status === 'busy' || m.status === 'unavailable' || m.status === 'offline' ? 'error'
                                            : 'warning'
                                } label={m.status?.replace('_', ' ')} />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <Card title="Tickets by Status" style={{ marginTop: 24 }}>
                <DonutChart slices={statusSlices} />
            </Card>
        </>
    );
}