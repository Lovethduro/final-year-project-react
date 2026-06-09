import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, StatCard } from './components/ui';
import { theme } from './styles/theme';

const metrics = [
    { label: 'Ticket Resolution Rate', value: '94%', trend: '+3%' },
    { label: 'Avg Response Time', value: '2.4h', trend: '-12%' },
    { label: 'Customer Satisfaction', value: '4.7/5', trend: '+0.2' },
    { label: 'Monthly Revenue', value: '₦12.4M', trend: '+18%' },
];

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <PageHeader title="Analytics" subtitle="Performance metrics and business insights" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                {metrics.map((m) => (
                    <StatCard key={m.label} title={m.label} value={m.value} icon="📊" trend={{ value: m.trend.replace(/[^0-9.]/g, ''), isPositive: m.trend.startsWith('+') }} />
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <Card title="Ticket Trends">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
                        {[40, 55, 48, 62, 58, 70, 65].map((h, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: '100%', height: h * 2, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, borderRadius: 6 }} />
                                <span style={{ fontSize: 11, color: theme.textDim }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Lead Sources">
                    {[
                        { source: 'Website', pct: 42 },
                        { source: 'Referral', pct: 28 },
                        { source: 'LinkedIn', pct: 18 },
                        { source: 'Events', pct: 12 },
                    ].map((item) => (
                        <div key={item.source} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: theme.textMuted }}>
                                <span>{item.source}</span>
                                <span>{item.pct}%</span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                <div style={{ width: `${item.pct}%`, height: '100%', background: theme.accent, borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </DashboardLayout>
    );
}
