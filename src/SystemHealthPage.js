import { PageHeader, Card, StatusBadge, StatCard } from './components/ui';

const services = [
    { name: 'API Server', status: 'online', uptime: '99.9%', latency: '45ms' },
    { name: 'MongoDB', status: 'online', uptime: '99.8%', latency: '12ms' },
    { name: 'Email Service', status: 'online', uptime: '99.5%', latency: '230ms' },
    { name: 'Authentication', status: 'online', uptime: '100%', latency: '38ms' },
];

export default function SystemHealthPage() {
    return (
        <>
                    <PageHeader title="System Health" subtitle="Service status and infrastructure monitoring" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Services Online" value={`${services.filter((s) => s.status === 'online').length}/${services.length}`} icon="ðŸ’š" status="success" />
                <StatCard title="Avg Uptime" value="99.7%" icon="ðŸ“ˆ" status="info" />
                <StatCard title="Alerts" value="0" icon="âš ï¸" status="success" />
            </div>
            <Card title="Service Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map((service) => (
                        <div key={service.name} style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, alignItems: 'center',
                            padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                        }}>
                            <span style={{ color: '#fff', fontWeight: 500 }}>{service.name}</span>
                            <StatusBadge status={service.status} label={service.status} />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{service.uptime}</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{service.latency}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
}