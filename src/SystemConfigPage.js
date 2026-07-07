import { useEffect, useState } from 'react';
import { PageHeader, Card, PrimaryButton, Alert } from './components/ui';
import { adminApi } from './utils/apiClient';
import { inputStyle } from './styles/theme';

const labelStyle = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 };

export default function SystemConfigPage() {
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        appName: 'CyForce CRM',
        supportEmail: 'support@cyforce.com',
        supportPhone: '+234 800 CYFORCE',
        liveChatHours: 'Available 9 AM – 6 PM (WAT)',
        slaUrgent: '2–4 hours',
        slaHigh: '8–12 hours',
        slaMedium: '24 hours',
        slaLow: '48 hours',
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        maintenanceMode: false,
        emailNotifications: true,
    });

    useEffect(() => {
        adminApi.getSystemConfig()
            .then((data) => {
                setConfig({
                    appName: data.appName || 'CyForce CRM',
                    supportEmail: data.supportEmail || '',
                    supportPhone: data.supportPhone || '',
                    liveChatHours: data.liveChatHours || '',
                    slaUrgent: data.slaUrgent || '',
                    slaHigh: data.slaHigh || '',
                    slaMedium: data.slaMedium || '',
                    slaLow: data.slaLow || '',
                    sessionTimeout: String(data.sessionTimeoutMinutes ?? 30),
                    maxLoginAttempts: String(data.maxLoginAttempts ?? 5),
                    maintenanceMode: !!data.maintenanceMode,
                    emailNotifications: data.emailNotifications !== false,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setConfig((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        setError('');
        try {
            await adminApi.updateSystemConfig({
                appName: config.appName,
                supportEmail: config.supportEmail,
                supportPhone: config.supportPhone,
                liveChatHours: config.liveChatHours,
                slaUrgent: config.slaUrgent,
                slaHigh: config.slaHigh,
                slaMedium: config.slaMedium,
                slaLow: config.slaLow,
                sessionTimeout: Number(config.sessionTimeout),
                maxLoginAttempts: Number(config.maxLoginAttempts),
                maintenanceMode: config.maintenanceMode,
                emailNotifications: config.emailNotifications,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <>
                            <PageHeader title="System Configuration" subtitle="Loading settings…" />
            </>
        );
    }

    return (
    <>
                    <PageHeader title="System Configuration" subtitle="Global application settings and support contact details" />

            {error && <Alert type="error">{error}</Alert>}
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
                            <label style={labelStyle}>Support Phone</label>
                            <input value={config.supportPhone} onChange={handleChange('supportPhone')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Live Chat Hours</label>
                            <input value={config.liveChatHours} onChange={handleChange('liveChatHours')} style={inputStyle} />
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

                <Card title="Support SLAs">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Urgent response time</label>
                            <input value={config.slaUrgent} onChange={handleChange('slaUrgent')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>High response time</label>
                            <input value={config.slaHigh} onChange={handleChange('slaHigh')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Medium response time</label>
                            <input value={config.slaMedium} onChange={handleChange('slaMedium')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Low response time</label>
                            <input value={config.slaLow} onChange={handleChange('slaLow')} style={inputStyle} />
                        </div>
                    </div>
                </Card>

                <Card title="Feature Toggles">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { key: 'maintenanceMode', label: 'Maintenance Mode' },
                            { key: 'emailNotifications', label: 'Email Notifications' },
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
    </>
    );
}