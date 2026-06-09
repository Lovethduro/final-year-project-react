import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert } from './components/ui';
import { inputStyle } from './styles/theme';

const labelStyle = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 };

export default function SystemConfigPage() {
    const [saved, setSaved] = useState(false);
    const [config, setConfig] = useState({
        appName: 'CyForce CRM',
        supportEmail: 'info@cyforcetech.com',
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: true,
    });

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setConfig((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <DashboardLayout>
            <PageHeader title="System Configuration" subtitle="Global application settings and policies" />

            {saved && <Alert type="success">Configuration saved successfully.</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <Card title="General Settings">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Application Name</label>
                            <input value={config.appName} onChange={handleChange('appName')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Support Email</label>
                            <input value={config.supportEmail} onChange={handleChange('supportEmail')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Session Timeout (minutes)</label>
                            <input type="number" value={config.sessionTimeout} onChange={handleChange('sessionTimeout')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Max Login Attempts</label>
                            <input type="number" value={config.maxLoginAttempts} onChange={handleChange('maxLoginAttempts')} style={inputStyle} />
                        </div>
                    </div>
                </Card>

                <Card title="Feature Toggles">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { key: 'maintenanceMode', label: 'Maintenance Mode' },
                            { key: 'emailNotifications', label: 'Email Notifications' },
                            { key: 'smsNotifications', label: 'SMS Notifications' },
                        ].map((item) => (
                            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                                <input type="checkbox" checked={config[item.key]} onChange={handleChange(item.key)} />
                                {item.label}
                            </label>
                        ))}
                        <PrimaryButton onClick={handleSave}>Save Configuration</PrimaryButton>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
