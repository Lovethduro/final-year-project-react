import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, PrimaryButton } from './components/ui';
import { theme } from './styles/theme';

const modules = [
    { id: 1, name: 'Customer Management', icon: '👥', enabled: true },
    { id: 2, name: 'Ticketing System', icon: '🎫', enabled: true },
    { id: 3, name: 'Sales Management', icon: '💰', enabled: true },
    { id: 4, name: 'Lead Management', icon: '📈', enabled: true },
    { id: 5, name: 'Knowledge Base', icon: '📚', enabled: true },
    { id: 6, name: 'Feedback System', icon: '💬', enabled: false },
];

export default function ModuleConfigPage() {
    const [items, setItems] = useState(modules);

    const toggle = (id) => {
        setItems((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
    };

    return (
        <DashboardLayout>
            <PageHeader title="Module Configuration" subtitle="Enable or disable CRM modules and features" />
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((mod) => (
                        <div key={mod.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                            border: `0.5px solid ${theme.border}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 22 }}>{mod.icon}</span>
                                <span style={{ color: theme.text, fontWeight: 500 }}>{mod.name}</span>
                            </div>
                            <button onClick={() => toggle(mod.id)} style={{
                                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                background: mod.enabled ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                                color: mod.enabled ? '#34D399' : 'rgba(255,255,255,0.4)',
                                fontSize: 12,
                            }}>
                                {mod.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 20 }}>
                    <PrimaryButton onClick={() => alert('Module settings saved.')}>Save Changes</PrimaryButton>
                </div>
            </Card>
        </DashboardLayout>
    );
}
