import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, StatCard, Alert } from './components/ui';
import { analyticsApi } from './utils/apiClient';
import { theme } from './styles/theme';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        analyticsApi.overview()
            .then(setData)
            .catch((err) => setError(err.message));
    }, []);

    const leadSources = data?.leadSources || [];

    return (
        <DashboardLayout>
            <PageHeader title="Analytics" subtitle="Real lead sources and acquisition data from your CRM" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Total Leads" value={data?.totalLeads ?? '…'} icon="📊" />
                <StatCard title="Total Tickets" value={data?.totalTickets ?? '…'} icon="🎫" />
                <StatCard title="Resolution Rate" value={data?.ticketResolutionRate ?? '…'} icon="✅" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <Card title="Lead Sources (from CRM data)">
                    {leadSources.length ? leadSources.map((item) => (
                        <div key={item.key || item.source} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: theme.textMuted }}>
                                <span>{item.source}</span>
                                <span>{item.pct}% ({item.count})</span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                <div style={{ width: `${item.pct}%`, height: '100%', background: theme.accent, borderRadius: 4 }} />
                            </div>
                        </div>
                    )) : <p style={{ color: theme.textDim }}>No lead source data yet. Sources are captured when leads are created or customers register.</p>}
                </Card>

                <Card title="How customers heard about us">
                    {(data?.hearAboutUsBreakdown || []).length ? (data.hearAboutUsBreakdown).map((item) => (
                        <div key={item.source} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: theme.textMuted }}>
                                <span>{item.source}</span>
                                <span>{item.pct}% ({item.count})</span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                <div style={{ width: `${item.pct}%`, height: '100%', background: theme.primary, borderRadius: 4 }} />
                            </div>
                        </div>
                    )) : <p style={{ color: theme.textDim }}>Registration “how did you hear about us” responses will appear here.</p>}
                </Card>
            </div>
        </DashboardLayout>
    );
}
