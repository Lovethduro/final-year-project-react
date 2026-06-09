import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, StatCard, PrimaryButton, GhostButton } from './components/ui';

export default function DataManagementPage() {
    return (
        <DashboardLayout>
            <PageHeader title="Data Management" subtitle="Backups, exports, and retention policies" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Database Size" value="2.4 GB" icon="🗄️" status="info" />
                <StatCard title="Last Backup" value="6h ago" icon="💾" status="success" />
                <StatCard title="Retention" value="90 days" icon="📅" status="info" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <Card title="Backup">
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontSize: 14 }}>Last successful backup completed at 4:00 PM today.</p>
                    <PrimaryButton>Run Backup Now</PrimaryButton>
                </Card>
                <Card title="Export Data">
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontSize: 14 }}>Export users, tickets, and customer data as CSV or JSON.</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <GhostButton>Export CSV</GhostButton>
                        <GhostButton>Export JSON</GhostButton>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
