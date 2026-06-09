import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, DataTable, StatusBadge, Alert } from '../components/ui';
import { WelcomeBanner, QuickActions, DonutChart, LineChart, GaugeChart, HorizontalBarChart, StarRating } from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { supervisorApi } from '../utils/apiClient';
import { theme, cardStyle } from '../styles/theme';

const TEAM_OPTIONS = [
    { value: 'all', label: 'All Teams' },
    { value: 'sales', label: 'Sales Team' },
    { value: 'support', label: 'Support Team' },
];

const STATUS_COLORS = { Open: '#38BDF8', 'In Progress': '#FBBF24', Resolved: '#34D399', Closed: '#94A3B8' };
const TREND_TABS = ['total', 'resolved', 'open'];

function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function KpiCard({ title, value, icon, status = 'info' }) {
    const colors = { success: theme.success, warning: theme.warning, error: theme.error, info: theme.accent };
    return (
        <div style={{ ...cardStyle, padding: 20 }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>{value}</div>
            <div style={{ fontSize: 13, color: colors[status] }}>{title}</div>
        </div>
    );
}

function medalIcon(medal) {
    if (medal === 'gold') return '🥇';
    if (medal === 'silver') return '🥈';
    if (medal === 'bronze') return '🥉';
    return `#${''}`;
}

export default function SupervisorDashboard() {
    const auth = useAuth();
    const [team, setTeam] = useState('all');
    const [overview, setOverview] = useState(null);
    const [trendTab, setTrendTab] = useState('total');
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    const load = () => {
        supervisorApi.overview(team).then(setOverview).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, [team]);

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
        <DashboardLayout>
            <WelcomeBanner
                title={`Supervisor Dashboard`}
                subtitle={`Team overview for ${formatDate()}`}
            >
                <select value={team} onChange={(e) => setTeam(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: '8px 12px', color: theme.text, fontFamily: theme.fontBody }}>
                    {TEAM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </WelcomeBanner>

            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24 }}>
                <KpiCard title="Open Tickets" value={stats.openTickets ?? 0} icon="🎫" status="warning" />
                <KpiCard title="Avg Response Time" value={stats.avgResponseTime || '—'} icon="⏱️" status="info" />
                <KpiCard title="Avg Resolution Time" value={stats.avgResolutionTime || '—'} icon="📋" status="info" />
                <KpiCard title="Customer Satisfaction" value={stats.customerSatisfaction ? `${stats.customerSatisfaction}/5` : '—'} icon="⭐" status="success" />
                <KpiCard title="Sales Target" value={`${stats.salesAchieved ?? 0}/${stats.salesTarget ?? 20}`} icon="🎯" status="success" />
                <KpiCard title="Open Escalations" value={stats.openEscalations ?? 0} icon="🚨" status="error" />
            </div>

            <QuickActions actions={[
                { to: '/dashboard/tickets', icon: '🎫', label: 'View All Tickets' },
                { to: '/dashboard/performance', icon: '📊', label: 'Team Performance' },
                { to: '/dashboard/analytics', icon: '📢', label: 'Broadcast Message' },
                { to: '/dashboard/tickets', icon: '⚠️', label: 'View Escalations' },
                { to: '/dashboard/analytics', icon: '📄', label: 'Generate Report' },
            ]} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div>
                    <Card title="Ticket Volume Trend (14 days)" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {TREND_TABS.map((tab) => (
                                <button key={tab} type="button" onClick={() => setTrendTab(tab)} style={{
                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: trendTab === tab ? theme.primary : 'rgba(255,255,255,0.05)',
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
                                    { key: 'actions', label: '', render: (r) => (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button type="button" disabled={actionId === r.id} onClick={() => handleApprove(r.id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                            <button type="button" disabled={actionId === r.id} onClick={() => handleReject(r.id)} style={{ padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )},
                                ]}
                                rows={overview.pendingApprovals}
                            />
                        ) : <p style={{ color: theme.textDim, fontSize: 13 }}>No pending approvals.</p>}
                    </Card>

                    <Card title="Recent Customer Feedback">
                        {(overview?.recentFeedback || []).length ? overview.recentFeedback.map((f, i) => (
                            <div key={i} style={{ padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ color: theme.text }}>{f.companyName}</strong>
                                    <StarRating rating={f.rating} />
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>{f.customerName}</div>
                                <p style={{ fontSize: 13, color: theme.textMuted, margin: '6px 0 0' }}>{f.comment}</p>
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No feedback yet.</p>}
                    </Card>
                </div>

                <div>
                    <Card title="Team Performance Leaderboard" style={{ marginBottom: 20 }}>
                        {(overview?.teamLeaderboard || []).map((agent) => (
                            <div key={agent.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <span style={{ fontSize: 18 }}>{agent.medal ? medalIcon(agent.medal) : `#${agent.rank}`}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{agent.name}</div>
                                    <div style={{ fontSize: 11, color: theme.textDim }}>{agent.ticketsResolved} resolved · {agent.avgResponse}</div>
                                </div>
                                <span style={{ fontSize: 12, color: theme.warning }}>★ {agent.rating}</span>
                            </div>
                        ))}
                    </Card>

                    <Card title="SLA Compliance" style={{ marginBottom: 20 }}>
                        <GaugeChart percent={overview?.slaCompliancePercent ?? 0} label="Compliance" />
                    </Card>

                    <Card title="Recent Alerts" style={{ marginBottom: 20 }}>
                        {(overview?.recentAlerts || []).map((a) => (
                            <div key={a.id} style={{ padding: 10, marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${a.priority === 'critical' ? theme.error : theme.warning}` }}>
                                <div style={{ fontSize: 11, color: a.priority === 'critical' ? theme.error : theme.warning }}>{a.type}</div>
                                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{a.message}</div>
                            </div>
                        ))}
                    </Card>

                    <Card title="Team Availability Status" style={{ marginBottom: 20 }}>
                        {(overview?.teamAvailability || []).map((m) => (
                            <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <span style={{ fontSize: 13, color: theme.text }}>{m.name}</span>
                                <StatusBadge status={m.status === 'available' ? 'success' : m.status === 'busy' ? 'error' : 'warning'} label={m.status?.replace('_', ' ')} />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <Card title="Tickets by Status" style={{ marginTop: 24 }}>
                <DonutChart slices={statusSlices} />
            </Card>
        </DashboardLayout>
    );
}
