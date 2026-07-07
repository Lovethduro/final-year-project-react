import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Card, StatCard, PrimaryButton, GhostButton, Alert } from './components/ui';
import { adminApi } from './utils/apiClient';
import { theme, inputStyle } from './styles/theme';

export default function DataManagementPage() {
    const [overview, setOverview] = useState(null);
    const [retentionDays, setRetentionDays] = useState(90);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [exporting, setExporting] = useState('');
    const [savingRetention, setSavingRetention] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        adminApi.dataManagementOverview()
            .then((data) => {
                setOverview(data);
                setRetentionDays(data?.retentionDays ?? 90);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const runBackup = async () => {
        setBackingUp(true);
        setError('');
        setSuccess('');
        try {
            const result = await adminApi.runDataBackup();
            setSuccess(result.message || 'Backup completed successfully.');
            setOverview((prev) => ({ ...prev, ...result }));
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBackingUp(false);
        }
    };

    const exportData = async (format) => {
        setExporting(format);
        setError('');
        setSuccess('');
        try {
            await adminApi.exportData(format);
            setSuccess(`Data exported as ${format.toUpperCase()}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setExporting('');
        }
    };

    const saveRetention = async () => {
        setSavingRetention(true);
        setError('');
        setSuccess('');
        try {
            const data = await adminApi.updateDataRetention(Number(retentionDays));
            setOverview(data);
            setSuccess('Retention policy updated.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingRetention(false);
        }
    };

    return (
        <>
                    <PageHeader title="Data Management" subtitle="Backups, exports, and retention policies" />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            {loading ? (
                <p style={{ color: theme.textDim }}>Loading data management status…</p>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                        <StatCard title="Database Size" value={overview?.databaseSize ?? '—'} icon="ðŸ—„ï¸" status="info" />
                        <StatCard title="Last Backup" value={overview?.lastBackupAgo ?? 'Never'} icon="ðŸ’¾" status="success" />
                        <StatCard title="Retention" value={`${overview?.retentionDays ?? retentionDays} days`} icon="ðŸ“…" status="info" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Backup">
                            <p style={{ color: theme.textMuted, marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
                                {overview?.lastBackupSummary
                                    || 'No backup has been run yet. Backups are saved as JSON snapshots of users, tickets, and leads.'}
                            </p>
                            {overview?.lastBackupSize && (
                                <p style={{ color: theme.textDim, fontSize: 13, marginBottom: 16 }}>
                                    Last backup size: {overview.lastBackupSize}
                                    {overview.backupCount ? ` · ${overview.backupCount} backup file(s) on disk` : ''}
                                </p>
                            )}
                            <PrimaryButton onClick={runBackup} disabled={backingUp}>
                                {backingUp ? 'Running backup…' : 'Run Backup Now'}
                            </PrimaryButton>
                        </Card>

                        <Card title="Export Data">
                            <p style={{ color: theme.textMuted, marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
                                Export users, tickets, and customer lead data. Passwords and secrets are never included.
                            </p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <GhostButton onClick={() => exportData('csv')} disabled={!!exporting}>
                                    {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
                                </GhostButton>
                                <GhostButton onClick={() => exportData('pdf')} disabled={!!exporting}>
                                    {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
                                </GhostButton>
                            </div>
                        </Card>
                    </div>

                    <Card title="Retention policy">
                        <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>
                            Backup files older than the retention period are removed automatically when a new backup runs or when you save this policy.
                        </p>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: 13, color: theme.textDim }}>Keep backups for</label>
                            <input
                                type="number"
                                min={7}
                                max={365}
                                value={retentionDays}
                                onChange={(e) => setRetentionDays(e.target.value)}
                                style={{ ...inputStyle, width: 100, marginBottom: 0 }}
                            />
                            <span style={{ fontSize: 13, color: theme.textDim }}>days</span>
                            <PrimaryButton onClick={saveRetention} disabled={savingRetention}>
                                {savingRetention ? 'Saving…' : 'Save policy'}
                            </PrimaryButton>
                        </div>
                    </Card>
                </>
            )}
        </>
    );
}