import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LuUsers,
    LuTicket,
    LuUserCheck,
    LuActivity,
    LuCircleCheck,
    LuTriangleAlert,
    LuCircleX,
    LuCheck,
    LuX,
    LuMegaphone,
    LuSend,
    LuSettings,
    LuShield,
    LuLock,
    LuChartColumn,
    LuHeartPulse,
    LuHardDrive,
    LuMailCheck,
    LuMessageSquareText,
} from 'react-icons/lu';
import { Alert, Card, DataTable, PrimaryButton, Select, GhostButton } from './components/ui';
import {
    WelcomeBanner,
    QuickActions,
    DonutChart,
    MetricCard,
    StarRating,
    ActivityTimeline,
} from './components/dashboard/DashboardWidgets';
import { adminApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme, inputStyle } from './styles/theme';

const STORAGE_CHART_PALETTE = [
    '#002D72',
    '#1A4A9E',
    '#3B6BB5',
    '#5B8AC9',
    '#0F766E',
    '#148F85',
    '#64748B',
    '#B45309',
    '#94A3B8',
];

const STORAGE_COLORS = {
    'Users & accounts': STORAGE_CHART_PALETTE[0],
    'Tickets & support': STORAGE_CHART_PALETTE[1],
    'Sales & messaging': STORAGE_CHART_PALETTE[2],
    'Knowledge base': STORAGE_CHART_PALETTE[3],
    'Billing & payments': STORAGE_CHART_PALETTE[4],
    'Products & deals': STORAGE_CHART_PALETTE[5],
    'System & audit': STORAGE_CHART_PALETTE[6],
    'Uploaded files': STORAGE_CHART_PALETTE[7],
    Database: STORAGE_CHART_PALETTE[8],
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
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function formatDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function BarChart({ data }) {
    if (!data?.length) {
        return <p style={{ color: theme.textDim, fontSize: 13, margin: 0 }}>No registration activity yet.</p>;
    }
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
                                }}
                            />
                            <div
                                title={`Logins: ${item.logins}`}
                                style={{
                                    width: '42%',
                                    height: `${(item.logins / max) * 100}%`,
                                    background: `linear-gradient(180deg, #148F85, ${theme.success})`,
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: item.logins > 0 ? 4 : 2,
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
    const Icon = online ? LuCircleCheck : LuCircleX;
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 10,
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: `1px solid ${theme.border}`,
        }}>
            <Icon size={16} color={online ? theme.success : theme.error} aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{name}</div>
                <div style={{
                    fontSize: 11,
                    color: theme.textDim,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {detail}
                </div>
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
    if (a.includes('ROLE')) return { bg: 'rgba(0,45,114,0.1)', color: theme.primary };
    if (a.includes('CONFIG')) return { bg: 'rgba(180,83,9,0.12)', color: theme.warning };
    if (a.includes('USER')) return { bg: 'rgba(26,74,158,0.12)', color: theme.accent };
    return { bg: 'rgba(15,118,110,0.12)', color: theme.success };
}

function alertTone(type) {
    if (type === 'Critical') return theme.error;
    if (type === 'Warning') return theme.warning;
    return theme.accent;
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
    const overviewRef = useRef(null);

    const load = useCallback(() => {
        const hasOverview = overviewRef.current != null;
        if (!hasOverview) setLoading(true);
        adminApi.overview()
            .then((overviewData) => {
                overviewRef.current = overviewData;
                setOverview(overviewData);
                setError('');
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        adminApi.feedback()
            .then((feedbackData) => setFeedback(feedbackData || []))
            .catch(() => setFeedback([]));
    }, []);

    useEffect(() => {
        load();
        const refreshId = setInterval(load, 300000);
        return () => clearInterval(refreshId);
    }, [load]);

    const stats = overview?.stats;
    const pendingUsers = overview?.pendingApprovalUsers || [];
    const pendingCount = stats?.pendingApprovals ?? pendingUsers.length;
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
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (userId) => {
        setActionId(userId);
        try {
            await adminApi.deleteUser(userId);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const handleAnnouncement = async () => {
        if (!announcement.trim()) return;
        setAnnouncementSending(true);
        setAnnouncementSuccess('');
        try {
            const result = await adminApi.sendAnnouncement(announcement.trim(), audience);
            setAnnouncementSuccess(`Sent to ${result.recipients} recipient(s).`);
            setAnnouncement('');
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setAnnouncementSending(false);
        }
    };

    const activityItems = (overview?.recentActivity || []).slice(0, 5).map((a) => ({
        title: `${a.action} · ${a.module}`,
        time: `${a.userEmail || 'System'} · ${formatRelativeTime(a.createdAt)}`,
    }));

    return (
        <>
            <WelcomeBanner
                title={`Welcome back, ${auth.fullName || 'Admin'}`}
                subtitle={formatDate()}
                badge={pendingCount > 0 ? `${pendingCount} pending verification${pendingCount === 1 ? '' : 's'}` : undefined}
            />

            {error && <Alert type="error">{error}</Alert>}
            {announcementSuccess && <Alert type="success">{announcementSuccess}</Alert>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                <MetricCard
                    label="Active users"
                    value={loading ? '…' : String(stats?.activeUsers ?? 0)}
                    trend={overview?.userGrowthPercent != null ? Math.round(overview.userGrowthPercent) : undefined}
                    accent={theme.primary}
                    icon={LuUsers}
                />
                <MetricCard
                    label="Open tickets"
                    value={loading ? '…' : String(overview?.openTickets ?? 0)}
                    detail={`${overview?.totalLeads ?? 0} leads in pipeline`}
                    accent={theme.warning}
                    icon={LuTicket}
                />
                <MetricCard
                    label="Pending verification"
                    value={loading ? '…' : String(pendingCount)}
                    accent={theme.accent}
                    icon={LuUserCheck}
                />
                <MetricCard
                    label="Active sessions"
                    value={loading ? '…' : String(overview?.activeSessions ?? 0)}
                    detail="Currently signed in"
                    accent={theme.success}
                    icon={LuActivity}
                />
            </div>

            <QuickActions actions={[
                { to: '/dashboard/users', label: 'Users', icon: LuUsers },
                { to: '/dashboard/system-config', label: 'Settings', icon: LuSettings },
                { to: '/dashboard/security', label: 'Audit log', icon: LuShield },
                { to: '/dashboard/roles', label: 'Roles', icon: LuLock },
            ]} />

            <div
                className="admin-dash-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 0.9fr)',
                    gap: 20,
                    alignItems: 'start',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                    <Card title="Registration activity" icon={LuChartColumn}>
                        <BarChart data={overview?.registrationActivity || []} />
                    </Card>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                        <Card title="System health" icon={LuHeartPulse}>
                            {(overview?.systemHealth || []).length ? (
                                (overview.systemHealth || []).map((s) => (
                                    <HealthRow key={s.name} name={s.name} status={s.status} detail={s.uptime} />
                                ))
                            ) : (
                                <p style={{ margin: 0, color: theme.textDim, fontSize: 13 }}>No health data yet.</p>
                            )}
                        </Card>
                        <Card title="Security alerts" icon={LuTriangleAlert}>
                            {(overview?.anomalyAlerts || []).length ? overview.anomalyAlerts.slice(0, 4).map((a) => (
                                <div key={a.id} style={{
                                    display: 'flex',
                                    gap: 10,
                                    padding: '10px 0',
                                    borderBottom: `1px solid ${theme.border}`,
                                }}>
                                    <LuTriangleAlert
                                        size={16}
                                        color={alertTone(a.type)}
                                        style={{ flexShrink: 0, marginTop: 2 }}
                                        aria-hidden="true"
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            color: alertTone(a.type),
                                        }}>
                                            {a.type}
                                        </div>
                                        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, lineHeight: 1.4 }}>
                                            {a.message}
                                        </div>
                                        <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>
                                            {formatRelativeTime(a.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ margin: 0, color: theme.textDim, fontSize: 13 }}>No alerts right now.</p>
                            )}
                        </Card>
                    </div>

                    <Card
                        title="Recent audit log"
                        icon={LuShield}
                        action={(
                            <Link to="/dashboard/security" style={{ fontSize: 12, color: theme.accent, textDecoration: 'none', fontWeight: 500 }}>
                                View all
                            </Link>
                        )}
                    >
                        <DataTable
                            columns={[
                                { key: 'userEmail', label: 'User' },
                                {
                                    key: 'action',
                                    label: 'Action',
                                    render: (r) => {
                                        const s = actionBadgeStyle(r.action);
                                        return (
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                fontSize: 10,
                                                fontWeight: 600,
                                                background: s.bg,
                                                color: s.color,
                                            }}>
                                                {r.action}
                                            </span>
                                        );
                                    },
                                },
                                { key: 'createdAt', label: 'When', render: (r) => formatRelativeTime(r.createdAt) },
                            ]}
                            rows={(overview?.recentAuditLogs || []).slice(0, 5)}
                            emptyMessage="No audit entries yet."
                        />
                    </Card>
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                    <Card title="Storage" icon={LuHardDrive}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: theme.textDim }}>Database usage</span>
                            <span style={{ fontSize: 18, fontWeight: 600, color: theme.text }}>
                                {overview?.storageUsagePercent ?? 0}%
                            </span>
                        </div>
                        <DonutChart slices={storageSlices} />
                    </Card>

                    <Card
                        title="Email verification"
                        icon={LuMailCheck}
                        action={pendingUsers.length > 0 ? (
                            <Link to="/dashboard/users" style={{ fontSize: 12, color: theme.accent, textDecoration: 'none', fontWeight: 500 }}>
                                Manage
                            </Link>
                        ) : null}
                    >
                        {pendingUsers.length ? pendingUsers.slice(0, 3).map((p) => (
                            <div key={p.id} style={{ padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{p.fullName}</div>
                                        <div style={{
                                            fontSize: 11,
                                            color: theme.textDim,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {p.email}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: theme.warning,
                                        background: 'rgba(180,83,9,0.1)',
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {p.role}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <PrimaryButton
                                        disabled={actionId === p.id}
                                        onClick={() => handleApprove(p.id)}
                                        style={{
                                            flex: 1,
                                            padding: '7px 10px',
                                            fontSize: 12,
                                            background: theme.success,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <LuCheck size={14} aria-hidden="true" />
                                        Verify
                                    </PrimaryButton>
                                    <GhostButton
                                        disabled={actionId === p.id}
                                        onClick={() => handleReject(p.id)}
                                        style={{
                                            padding: '7px 10px',
                                            fontSize: 12,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <LuX size={14} aria-hidden="true" />
                                        Deny
                                    </GhostButton>
                                </div>
                            </div>
                        )) : (
                            <p style={{ margin: 0, fontSize: 13, color: theme.textDim, lineHeight: 1.5 }}>
                                No accounts awaiting verification.
                            </p>
                        )}
                    </Card>

                    <Card title="Recent activity" icon={LuActivity}>
                        <ActivityTimeline items={activityItems} />
                    </Card>

                    <Card title="Broadcast" icon={LuMegaphone}>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: theme.textMuted }}>Send a message to selected users</span>
                        </div>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Message to users…"
                            rows={3}
                            style={{
                                ...inputStyle,
                                minHeight: 88,
                                resize: 'vertical',
                                marginBottom: 10,
                            }}
                        />
                        <Select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            style={{ width: '100%', marginBottom: 10, fontSize: 13 }}
                        >
                            {AUDIENCE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Select>
                        <PrimaryButton
                            onClick={handleAnnouncement}
                            disabled={announcementSending || !announcement.trim()}
                            style={{
                                width: '100%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            <LuSend size={15} aria-hidden="true" />
                            {announcementSending ? 'Sending…' : 'Send announcement'}
                        </PrimaryButton>
                    </Card>
                </aside>
            </div>

            {feedback.length > 0 && (
                <Card title="Customer feedback" icon={LuMessageSquareText} style={{ marginTop: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {feedback.slice(0, 6).map((f) => (
                            <div
                                key={f.id}
                                style={{
                                    padding: 14,
                                    borderRadius: 8,
                                    border: `1px solid ${theme.border}`,
                                    background: theme.bgCard,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.customerName}</span>
                                    <StarRating rating={f.rating} />
                                </div>
                                {f.comment && (
                                    <p style={{ margin: '0 0 6px', fontSize: 12, color: theme.textMuted, lineHeight: 1.45 }}>
                                        {f.comment}
                                    </p>
                                )}
                                <div style={{ fontSize: 10, color: theme.textDim }}>{formatRelativeTime(f.createdAt)}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <style>{`
                @media (max-width: 960px) {
                    .admin-dash-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </>
    );
}
