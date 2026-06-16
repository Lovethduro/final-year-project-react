import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { Alert, DataTable, StatCard, Select } from './components/ui';
import { WelcomeBanner, QuickActions, DonutChart, StarRating } from './components/dashboard/DashboardWidgets';
import { adminApi } from './utils/apiClient';
import { theme, cardStyle } from './styles/theme';

const STORAGE_COLORS = {
    'Customer Data': '#38BDF8',
    Documents: '#A78BFA',
    Tickets: '#34D399',
    'Knowledge Base': '#FBBF24',
    Other: '#F472B6',
};

const AUDIENCE_OPTIONS = [
    { value: 'all', label: 'All Users' },
    { value: 'admins', label: 'Admins Only' },
    { value: 'sales', label: 'Sales Team' },
    { value: 'support', label: 'Support Team' },
    { value: 'customers', label: 'Customers' },
];

function formatRelativeTime(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) === 1 ? '' : 's'} ago`;
}

function BarChart({ data }) {
    if (!data?.length) return <p style={{ color: theme.textDim, fontSize: 13 }}>No registration activity yet.</p>;
    const max = Math.max(...data.map((d) => Math.max(d.registrations, d.logins)), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
            {data.map((item) => (
                <div key={item.day} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', justifyContent: 'center', height: 150 }}>
                        <div style={{ width: '40%', height: `${(item.registrations / max) * 100}%`, background: 'linear-gradient(135deg,#2B5CE6,#38BDF8)', borderRadius: 4, minHeight: 4 }} />
                        <div style={{ width: '40%', height: `${(item.logins / max) * 100}%`, background: 'linear-gradient(135deg,#34D399,#10B981)', borderRadius: 4, minHeight: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: theme.textDim }}>{item.day}</span>
                </div>
            ))}
        </div>
    );
}

function actionBadgeStyle(action) {
    const a = (action || '').toUpperCase();
    if (a.includes('ROLE')) return { bg: 'rgba(167,139,250,0.2)', color: '#A78BFA' };
    if (a.includes('CONFIG')) return { bg: 'rgba(251,191,36,0.2)', color: '#FBBF24' };
    if (a.includes('USER')) return { bg: 'rgba(56,189,248,0.2)', color: '#38BDF8' };
    return { bg: 'rgba(52,211,153,0.2)', color: '#34D399' };
}

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [announcement, setAnnouncement] = useState('');
    const [audience, setAudience] = useState('all');
    const [time, setTime] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [announcementSending, setAnnouncementSending] = useState(false);
    const [announcementSuccess, setAnnouncementSuccess] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        Promise.all([
            adminApi.overview(),
            adminApi.feedback().catch(() => []),
        ])
            .then(([overviewData, feedbackData]) => {
                setOverview(overviewData);
                setFeedback(feedbackData || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
        const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        tick();
        const clockId = setInterval(tick, 1000);
        const refreshId = setInterval(load, 60000);
        return () => { clearInterval(clockId); clearInterval(refreshId); };
    }, [load]);

    const stats = overview?.stats;
    const pendingUsers = overview?.pendingApprovalUsers || [];
    const storageSlices = (overview?.storageBreakdown || []).map((item) => ({
        label: item.name,
        value: item.value,
        color: STORAGE_COLORS[item.name] || theme.accent,
    }));

    const handleApprove = async (userId) => {
        setActionId(userId);
        try {
            await adminApi.updateUser(userId, { active: 'true', emailVerified: 'true' });
            load();
        } catch (err) { setError(err.message); } finally { setActionId(null); }
    };

    const handleReject = async (userId) => {
        setActionId(userId);
        try {
            await adminApi.deleteUser(userId);
            load();
        } catch (err) { setError(err.message); } finally { setActionId(null); }
    };

    const handleAnnouncement = async () => {
        if (!announcement.trim()) return;
        setAnnouncementSending(true);
        try {
            const result = await adminApi.sendAnnouncement(announcement.trim(), audience);
            setAnnouncementSuccess(`Announcement sent to ${result.recipients} user(s) (${result.audience || audience}).`);
            setAnnouncement('');
            load();
        } catch (err) { setError(err.message); } finally { setAnnouncementSending(false); }
    };

    return (
        <DashboardLayout>
            <WelcomeBanner
                title="Admin Dashboard"
                subtitle={`System overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
            >
                <span style={{ color: theme.textMuted, fontSize: 14, fontFamily: 'monospace' }}>{time}</span>
            </WelcomeBanner>

            {error && <Alert type="error">{error}</Alert>}
            {announcementSuccess && <Alert type="success">{announcementSuccess}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard
                    title="Total Active Users"
                    value={loading ? '…' : (stats?.activeUsers ?? 0)}
                    trend={overview?.userGrowthPercent != null ? { value: Math.abs(overview.userGrowthPercent), isPositive: overview.userGrowthPercent >= 0 } : undefined}
                    status="success"
                />
                <StatCard title="Storage Usage" value={loading ? '…' : `${overview?.storageUsagePercent ?? 0}%`} status="warning" />
                <StatCard title="Pending Approvals" value={loading ? '…' : (stats?.pendingApprovals ?? pendingUsers.length)} status="warning" />
                <StatCard title="Active Sessions" value={loading ? '…' : (overview?.activeSessions ?? 0)} status="info" />
                <StatCard title="Anomaly Alerts" value={loading ? '…' : (overview?.anomalyAlertCount ?? 0)} status="error" />
            </div>

            <QuickActions actions={[
                { to: '/dashboard/users', label: 'Add New User' },
                { to: '/dashboard/system-config', label: 'Configure System' },
                { to: '/dashboard/security', label: 'View Audit Log' },
                { to: '/dashboard/roles', label: 'Manage Permissions' },
            ]} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div>
                    <div style={{ ...cardStyle, marginBottom: 24 }}>
                        <h3 style={{ color: theme.text, marginBottom: 8 }}>User Registration Activity</h3>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: theme.textDim, marginBottom: 12 }}>
                            <span><span style={{ color: theme.primary }}>■</span> New Registrations</span>
                            <span><span style={{ color: theme.success }}>■</span> Total Logins</span>
                        </div>
                        <BarChart data={overview?.registrationActivity || []} />
                </div>

                    <div style={{ ...cardStyle, marginBottom: 24 }}>
                        <h3 style={{ color: theme.text, marginBottom: 16 }}>System Health Status</h3>
                        {(overview?.systemHealth || []).map((s) => (
                            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div>
                                    <div style={{ color: theme.text, fontWeight: 500 }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: theme.textDim }}>{s.uptime}</div>
                                </div>
                                <span style={{ color: s.status === 'online' ? theme.success : theme.error, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{s.status}</span>
                            </div>
                        ))}
            </div>

                    <div style={cardStyle}>
                        <h3 style={{ color: theme.text, marginBottom: 12 }}>Recent Anomaly Alerts</h3>
                        {(overview?.anomalyAlerts || []).length ? overview.anomalyAlerts.map((a) => (
                            <div key={a.id} style={{ padding: 10, marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div style={{ fontSize: 11, color: a.type === 'Critical' ? theme.error : a.type === 'Warning' ? theme.warning : theme.accent }}>{a.type}</div>
                                <div style={{ fontSize: 12, color: theme.textMuted, margin: '4px 0' }}>{a.message}</div>
                                <div style={{ fontSize: 11, color: theme.textDim }}>{formatRelativeTime(a.createdAt)}</div>
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No anomaly alerts.</p>}
                    </div>
                </div>

                                    <div>
                    <div style={{ ...cardStyle, marginBottom: 20 }}>
                        <h3 style={{ color: theme.text, marginBottom: 12 }}>Pending Approvals</h3>
                        {pendingUsers.length ? pendingUsers.map((p) => (
                            <div key={p.id} style={{ padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ color: theme.text, fontWeight: 500 }}>{p.fullName}</div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>{p.email}</div>
                                <div style={{ fontSize: 11, color: theme.warning, marginBottom: 8 }}>{p.role}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" disabled={actionId === p.id} onClick={() => handleApprove(p.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                    <button type="button" disabled={actionId === p.id} onClick={() => handleReject(p.id)} style={{ padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Reject</button>
                                </div>
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No pending approvals.</p>}
            </div>

                    <div style={{ ...cardStyle, marginBottom: 20 }}>
                        <h3 style={{ color: theme.text, marginBottom: 12 }}>Recent User Activity</h3>
                        {(overview?.recentActivity || []).slice(0, 4).map((a, i) => (
                            <div key={i} style={{ padding: '8px 0', borderBottom: `0.5px solid ${theme.border}`, fontSize: 12 }}>
                                <div style={{ color: theme.accent }}>{a.userEmail}</div>
                                <div style={{ color: theme.textMuted }}>{a.action} · {a.module}</div>
                                <div style={{ color: theme.textDim, fontSize: 11 }}>{formatRelativeTime(a.createdAt)}</div>
                            </div>
                        ))}
                </div>

                    <div style={cardStyle}>
                        <h3 style={{ color: theme.text, marginBottom: 12 }}>Storage Breakdown</h3>
                        <DonutChart slices={storageSlices} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginTop: 24 }}>
                <div style={cardStyle}>
                    <h3 style={{ color: theme.text, marginBottom: 12 }}>Broadcast System Announcement</h3>
                    <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Type your announcement message..." rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 10, padding: 12, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 }} />
                    <Select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: '100%', marginBottom: 12 }}>
                        {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <button type="button" onClick={handleAnnouncement} disabled={announcementSending || !announcement.trim()} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', opacity: announcementSending || !announcement.trim() ? 0.6 : 1 }}>
                        {announcementSending ? 'Sending…' : 'Send Announcement'}
                            </button>
                </div>
                    </div>

            <div style={{ ...cardStyle, marginTop: 24 }}>
                <h3 style={{ color: theme.text, marginBottom: 16 }}>Customer Reviews & Surveys</h3>
                {feedback.length ? feedback.slice(0, 12).map((f) => (
                    <div key={f.id} style={{ padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.customerName}</div>
                                <div style={{ fontSize: 11, color: theme.textDim }}>
                                    {f.type} · {f.agentName || 'No agent'} {f.agentRole ? `(${f.agentRole})` : ''}
                                </div>
                            </div>
                            <StarRating rating={f.rating} />
                        </div>
                        {f.comment && <p style={{ fontSize: 13, color: theme.textMuted, margin: '6px 0 0' }}>{f.comment}</p>}
                        {f.createdAt && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>{formatRelativeTime(f.createdAt)}</div>}
                    </div>
                )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No customer feedback yet.</p>}
            </div>

            <div style={{ ...cardStyle, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ color: theme.text }}>Recent Audit Log Entries</h3>
                    <Link to="/dashboard/security" style={{ fontSize: 12, color: theme.accent }}>View All</Link>
                </div>
                <DataTable
                    columns={[
                        { key: 'userEmail', label: 'User' },
                        { key: 'action', label: 'Action', render: (r) => {
                            const s = actionBadgeStyle(r.action);
                            return <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: s.bg, color: s.color }}>{r.action}</span>;
                        }},
                        { key: 'module', label: 'Module' },
                        { key: 'createdAt', label: 'Timestamp', render: (r) => formatRelativeTime(r.createdAt) },
                    ]}
                    rows={overview?.recentAuditLogs || []}
                />
            </div>
        </DashboardLayout>
    );
}
