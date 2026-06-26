import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { Alert, DataTable, Select } from './components/ui';
import { DonutChart, MetricCard, StarRating } from './components/dashboard/DashboardWidgets';
import { adminApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme, dashboardCardStyle } from './styles/theme';

const STORAGE_CHART_PALETTE = [
    '#6366F1',
    '#7C3AED',
    '#8B5CF6',
    '#A855F7',
    '#06B6D4',
    '#14B8A6',
    '#3B82F6',
    '#64748B',
    '#475569',
];

const STORAGE_COLORS = {
    'Users & accounts': STORAGE_CHART_PALETTE[0],
    'Tickets & support': STORAGE_CHART_PALETTE[1],
    'Sales & messaging': STORAGE_CHART_PALETTE[2],
    'Knowledge base': STORAGE_CHART_PALETTE[3],
    'Billing & payments': STORAGE_CHART_PALETTE[4],
    'Products & deals': STORAGE_CHART_PALETTE[5],
    'System & audit': STORAGE_CHART_PALETTE[7],
    'Uploaded files': STORAGE_CHART_PALETTE[6],
    Database: STORAGE_CHART_PALETTE[8],
};

const QUICK_LINKS = [
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/system-config', label: 'Settings' },
    { to: '/dashboard/security', label: 'Audit log' },
    { to: '/dashboard/roles', label: 'Roles' },
];

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
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function Panel({ title, action, children, style }) {
    return (
        <section style={{ ...dashboardCardStyle, padding: '16px 18px', ...style }}>
            {(title || action) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    {title && (
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: theme.fontHeading }}>
                            {title}
                        </h3>
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

function BarChart({ data }) {
    if (!data?.length) return <p style={{ color: theme.textDim, fontSize: 13, margin: 0 }}>No registration activity yet.</p>;
    const max = Math.max(...data.map((d) => Math.max(d.registrations, d.logins)), 1);
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 132 }}>
                {data.map((item) => (
                    <div key={item.day} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center', height: 108 }}>
                            <div
                                title={`Registrations: ${item.registrations}`}
                                style={{
                                    width: '42%',
                                    height: `${(item.registrations / max) * 100}%`,
                                    background: `linear-gradient(180deg, ${theme.primary}, ${theme.accent})`,
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: item.registrations > 0 ? 4 : 2,
                                    opacity: 0.95,
                                }}
                            />
                            <div
                                title={`Logins: ${item.logins}`}
                                style={{
                                    width: '42%',
                                    height: `${(item.logins / max) * 100}%`,
                                    background: `linear-gradient(180deg, #10B981, ${theme.success})`,
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: item.logins > 0 ? 4 : 2,
                                    opacity: 0.9,
                                }}
                            />
                        </div>
                        <span style={{ fontSize: 10, color: theme.textDim, display: 'block', marginTop: 6 }}>{item.day}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: theme.textDim, marginTop: 10 }}>
                <span><span style={{ color: theme.primary }}>■</span> Registrations</span>
                <span><span style={{ color: theme.success }}>■</span> Logins</span>
            </div>
        </div>
    );
}

function HealthRow({ name, status, detail }) {
    const online = status === 'online';
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 10,
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: `1px solid ${theme.border}`,
        }}>
            <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: online ? theme.success : theme.error,
                boxShadow: online ? `0 0 8px ${theme.success}55` : 'none',
            }} />
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</div>
            </div>
            <span style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: online ? theme.success : theme.error,
            }}>
                {status}
            </span>
        </div>
    );
}

function actionBadgeStyle(action) {
    const a = (action || '').toUpperCase();
    if (a.includes('ROLE')) return { bg: 'rgba(167,139,250,0.18)', color: '#A78BFA' };
    if (a.includes('CONFIG')) return { bg: 'rgba(251,191,36,0.18)', color: '#FBBF24' };
    if (a.includes('USER')) return { bg: 'rgba(56,189,248,0.18)', color: '#38BDF8' };
    return { bg: 'rgba(52,211,153,0.18)', color: '#34D399' };
}

export default function AdminDashboard() {
    const auth = useAuth();
    const [overview, setOverview] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [announcement, setAnnouncement] = useState('');
    const [audience, setAudience] = useState('all');
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
        const refreshId = setInterval(load, 60000);
        return () => clearInterval(refreshId);
    }, [load]);

    const stats = overview?.stats;
    const pendingUsers = overview?.pendingApprovalUsers || [];
    const storageSlices = (overview?.storageBreakdown || []).map((item, index) => ({
        label: item.name,
        value: item.value,
        display: item.sizeLabel || `${item.value}%`,
        color: STORAGE_COLORS[item.name] || STORAGE_CHART_PALETTE[index % STORAGE_CHART_PALETTE.length],
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
            setAnnouncementSuccess(`Sent to ${result.recipients} recipient(s).`);
            setAnnouncement('');
            load();
        } catch (err) { setError(err.message); } finally { setAnnouncementSending(false); }
    };

    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <DashboardLayout>
            <header style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p style={{ margin: '0 0 4px', fontSize: 12, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Admin overview
                        </p>
                        <h1 style={{ margin: '0 0 4px', fontFamily: theme.fontHeading, fontSize: 22, fontWeight: 600, color: theme.text }}>
                            Welcome back, {auth.fullName || 'Admin'}
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: theme.textMuted }}>{dateLabel}</p>
                    </div>
                    <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    padding: '7px 12px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: theme.textMuted,
                                    textDecoration: 'none',
                                    border: `1px solid ${theme.border}`,
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {error && <Alert type="error">{error}</Alert>}
            {announcementSuccess && <Alert type="success">{announcementSuccess}</Alert>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                marginBottom: 16,
            }}>
                <MetricCard
                    label="Active users"
                    value={loading ? '…' : String(stats?.activeUsers ?? 0)}
                    trend={overview?.userGrowthPercent != null ? Math.round(overview.userGrowthPercent) : undefined}
                />
                <MetricCard
                    label="Open tickets"
                    value={loading ? '…' : String(overview?.openTickets ?? 0)}
                    detail={`${overview?.totalLeads ?? 0} leads in pipeline`}
                />
                <MetricCard
                    label="Pending verification"
                    value={loading ? '…' : String(stats?.pendingApprovals ?? pendingUsers.length)}
                />
                <MetricCard
                    label="Active sessions"
                    value={loading ? '…' : String(overview?.activeSessions ?? 0)}
                    detail="Currently signed in"
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 14,
                alignItems: 'start',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Panel title="Registration activity">
                        <BarChart data={overview?.registrationActivity || []} />
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                        <Panel title="System health">
                            {(overview?.systemHealth || []).map((s) => (
                                <HealthRow key={s.name} name={s.name} status={s.status} detail={s.uptime} />
                            ))}
                        </Panel>
                        <Panel title="Security alerts">
                            {(overview?.anomalyAlerts || []).length ? overview.anomalyAlerts.slice(0, 4).map((a) => (
                                <div key={a.id} style={{ padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: a.type === 'Critical' ? theme.error : a.type === 'Warning' ? theme.warning : theme.accent }}>
                                        {a.type}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, lineHeight: 1.4 }}>{a.message}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>{formatRelativeTime(a.createdAt)}</div>
                                </div>
                            )) : (
                                <p style={{ margin: 0, color: theme.textDim, fontSize: 13 }}>No alerts right now.</p>
                            )}
                        </Panel>
                    </div>

                    <Panel
                        title="Recent audit log"
                        action={<Link to="/dashboard/security" style={{ fontSize: 12, color: theme.accent, textDecoration: 'none' }}>View all</Link>}
                    >
                        <DataTable
                            columns={[
                                { key: 'userEmail', label: 'User' },
                                { key: 'action', label: 'Action', render: (r) => {
                                    const s = actionBadgeStyle(r.action);
                                    return <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, background: s.bg, color: s.color }}>{r.action}</span>;
                                }},
                                { key: 'createdAt', label: 'When', render: (r) => formatRelativeTime(r.createdAt) },
                            ]}
                            rows={(overview?.recentAuditLogs || []).slice(0, 5)}
                            emptyMessage="No audit entries yet."
                        />
                    </Panel>
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Panel title="Storage">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: theme.textDim }}>Database usage</span>
                            <span style={{ fontSize: 18, fontWeight: 600, color: theme.text }}>{overview?.storageUsagePercent ?? 0}%</span>
                        </div>
                        <DonutChart slices={storageSlices} />
                    </Panel>

                    <Panel
                        title="Email verification"
                        action={pendingUsers.length > 0 && (
                            <Link to="/dashboard/users" style={{ fontSize: 11, color: theme.accent, textDecoration: 'none' }}>Manage</Link>
                        )}
                    >
                        {pendingUsers.length ? pendingUsers.slice(0, 3).map((p) => (
                            <div key={p.id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{p.fullName}</div>
                                        <div style={{ fontSize: 11, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>
                                    </div>
                                    <span style={{ fontSize: 10, color: theme.warning, whiteSpace: 'nowrap' }}>{p.role}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                    <button type="button" disabled={actionId === p.id} onClick={() => handleApprove(p.id)} style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Verify</button>
                                    <button type="button" disabled={actionId === p.id} onClick={() => handleReject(p.id)} style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Deny</button>
                                </div>
                            </div>
                        )) : (
                            <p style={{ margin: 0, fontSize: 13, color: theme.textDim, lineHeight: 1.5 }}>
                                No accounts awaiting verification.
                            </p>
                        )}
                    </Panel>

                    <Panel title="Recent activity">
                        {(overview?.recentActivity || []).slice(0, 5).map((a, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, marginTop: 6, flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, color: theme.text }}>{a.action} <span style={{ color: theme.textDim }}>· {a.module}</span></div>
                                    <div style={{ fontSize: 11, color: theme.textMuted }}>{a.userEmail}</div>
                                    <div style={{ fontSize: 10, color: theme.textDim }}>{formatRelativeTime(a.createdAt)}</div>
                                </div>
                            </div>
                        ))}
                        {!(overview?.recentActivity || []).length && (
                            <p style={{ margin: 0, fontSize: 13, color: theme.textDim }}>No recent activity.</p>
                        )}
                    </Panel>

                    <Panel title="Broadcast">
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Message to users…"
                            rows={3}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${theme.border}`,
                                borderRadius: 8,
                                padding: 10,
                                color: theme.text,
                                fontFamily: theme.fontBody,
                                fontSize: 13,
                                marginBottom: 10,
                                resize: 'vertical',
                            }}
                        />
                        <Select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: '100%', marginBottom: 10, fontSize: 13 }}>
                            {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                        <button
                            type="button"
                            onClick={handleAnnouncement}
                            disabled={announcementSending || !announcement.trim()}
                            style={{
                                width: '100%',
                                background: theme.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '9px 14px',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                opacity: announcementSending || !announcement.trim() ? 0.55 : 1,
                            }}
                        >
                            {announcementSending ? 'Sending…' : 'Send announcement'}
                        </button>
                    </Panel>
                </aside>
            </div>

            {feedback.length > 0 && (
                <Panel title="Customer feedback" style={{ marginTop: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {feedback.slice(0, 6).map((f) => (
                            <div
                                key={f.id}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    border: `1px solid ${theme.border}`,
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.customerName}</span>
                                    <StarRating rating={f.rating} />
                                </div>
                                {f.comment && (
                                    <p style={{ margin: '0 0 6px', fontSize: 12, color: theme.textMuted, lineHeight: 1.45 }}>{f.comment}</p>
                                )}
                                <div style={{ fontSize: 10, color: theme.textDim }}>{formatRelativeTime(f.createdAt)}</div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
        </DashboardLayout>
    );
}
