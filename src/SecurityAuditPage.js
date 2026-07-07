import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, Alert, PrimaryButton, GhostButton } from './components/ui';
import { adminApi } from './utils/apiClient';

const ACTION_LABELS = {
    LOGIN_FAILED: 'Failed login attempt',
    LOGIN_SUCCESS: 'Successful login',
    LOGOUT: 'Signed out',
    AUTH_ROLE_MISMATCH: 'Role mismatch at login',
    PASSWORD_RESET_REQUESTED: 'Password reset requested',
    PASSWORD_RESET: 'Password reset completed',
    PASSWORD_CHANGED: 'Password changed',
    MFA_ENABLED: 'MFA enabled',
    MFA_DISABLED: 'MFA disabled',
};

const ACTION_SEVERITY = {
    LOGIN_FAILED: 'warning',
    LOGIN_SUCCESS: 'success',
    LOGOUT: 'info',
    AUTH_ROLE_MISMATCH: 'error',
    PASSWORD_RESET_REQUESTED: 'info',
    PASSWORD_RESET: 'info',
    PASSWORD_CHANGED: 'info',
    MFA_ENABLED: 'info',
    MFA_DISABLED: 'warning',
};

function formatRelativeTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatTimestamp(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
}

function mapLogEntry(log) {
    const action = (log.action || '').toUpperCase();
    const label = ACTION_LABELS[action] || log.action || 'Security event';
    const severity = ACTION_SEVERITY[action] || 'info';
    const details = log.details ? ` — ${log.details}` : '';
    return {
        id: log.id,
        event: `${label}${details}`,
        user: log.userEmail || 'unknown',
        ip: log.clientIp || '—',
        time: formatRelativeTime(log.createdAt),
        timestamp: formatTimestamp(log.createdAt),
        severity,
        createdAt: log.createdAt,
    };
}

function availabilityBadge(status) {
    const normalized = (status || 'unavailable').toLowerCase();
    if (normalized === 'available' || normalized === 'online') return { status: 'success', label: normalized.replace('_', ' ') };
    if (normalized === 'busy') return { status: 'error', label: 'busy' };
    if (normalized === 'unavailable' || normalized === 'offline') return { status: 'error', label: 'unavailable' };
    return { status: 'warning', label: normalized.replace('_', ' ') };
}

export default function SecurityAuditPage() {
    const [search, setSearch] = useState('');
    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [downloadingFormat, setDownloadingFormat] = useState('');
    const [error, setError] = useState('');
    const [reportMessage, setReportMessage] = useState('');

    const loadEvents = useCallback(() => {
        setLoading(true);
        setError('');
        adminApi.securityAudit()
            .then((data) => setEvents((data || []).map(mapLogEntry)))
            .catch((err) => setError(err.message || 'Failed to load security audit log'))
            .finally(() => setLoading(false));
    }, []);

    const loadSessions = useCallback(() => {
        setSessionsLoading(true);
        adminApi.sessions()
            .then((data) => setSessions(data || []))
            .catch((err) => setError((prev) => prev || err.message || 'Failed to load sessions'))
            .finally(() => setSessionsLoading(false));
    }, []);

    useEffect(() => {
        loadEvents();
        const timer = setTimeout(loadSessions, 300);
        return () => clearTimeout(timer);
    }, [loadEvents, loadSessions]);

    const handleDownloadReport = async (format) => {
        setDownloadingFormat(format);
        setReportMessage('');
        setError('');
        try {
            await adminApi.securityAuditReport(format);
            setReportMessage(`Security audit report downloaded as ${format.toUpperCase()}.`);
        } catch (err) {
            setError(err.message || 'Failed to generate report');
        } finally {
            setDownloadingFormat('');
        }
    };

    const filtered = events.filter((e) => [e.event, e.user, e.ip, e.timestamp].join(' ').toLowerCase().includes(search.toLowerCase()));
    const downloading = Boolean(downloadingFormat);

    return (
        <>
                    <PageHeader
                title="Security Audit"
                subtitle="Monitor login attempts, security events, and suspicious activity"
                action={(
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <GhostButton onClick={() => handleDownloadReport('csv')} disabled={downloading || loading}>
                            {downloadingFormat === 'csv' ? 'Generating CSV…' : 'Download CSV'}
                        </GhostButton>
                        <PrimaryButton onClick={() => handleDownloadReport('pdf')} disabled={downloading || loading}>
                            {downloadingFormat === 'pdf' ? 'Generating PDF…' : 'Download PDF'}
                        </PrimaryButton>
                    </div>
                )}
            />
            {error && <Alert type="error">{error}</Alert>}
            {reportMessage && <Alert type="success">{reportMessage}</Alert>}

            <Card style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: 16 }}>Active sessions</h3>
                        <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                            Users are marked unavailable when they sign out. Active count: {sessions.filter((s) => s.active).length}
                        </p>
                    </div>
                    <GhostButton onClick={loadSessions} disabled={sessionsLoading}>Refresh</GhostButton>
                </div>
                {sessionsLoading ? (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading sessions…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'fullName', label: 'User', render: (row) => row.fullName || row.userEmail || '—' },
                            { key: 'role', label: 'Role', render: (row) => (row.role || '—').replace(/_/g, ' ') },
                            { key: 'clientIp', label: 'IP' },
                            {
                                key: 'active',
                                label: 'Session',
                                render: (row) => <StatusBadge status={row.active ? 'success' : 'info'} label={row.active ? 'Active' : 'Ended'} />,
                            },
                            {
                                key: 'availability',
                                label: 'Availability',
                                render: (row) => {
                                    const badge = availabilityBadge(row.availability);
                                    return <StatusBadge status={badge.status} label={badge.label} />;
                                },
                            },
                            { key: 'startedAt', label: 'Started', render: (row) => formatTimestamp(row.startedAt) },
                            { key: 'endedAt', label: 'Ended', render: (row) => formatTimestamp(row.endedAt) },
                        ]}
                        rows={sessions}
                        emptyMessage="No sessions recorded yet."
                    />
                )}
            </Card>

            <Card>
                <div style={{ marginBottom: 20, maxWidth: 360 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search events, users, or IP addresses..." />
                </div>
                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading security events…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'event', label: 'Event' },
                            { key: 'user', label: 'User' },
                            { key: 'ip', label: 'IP Address' },
                            { key: 'timestamp', label: 'Timestamp' },
                            { key: 'time', label: 'When' },
                            { key: 'severity', label: 'Severity', render: (row) => <StatusBadge status={row.severity} /> },
                        ]}
                        rows={filtered}
                        emptyMessage={search ? 'No events match your search.' : 'No security events recorded yet.'}
                    />
                )}
            </Card>
        </>
    );
}