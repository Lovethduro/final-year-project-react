import { useState } from 'react';
import { PageHeader, Card, PrimaryButton, Alert, Select } from '../components/ui';
import { supervisorApi, adminApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { inputStyle } from '../styles/theme';

const AUDIENCE_OPTIONS = [
    { value: 'all', label: 'All Users' },
    { value: 'sales', label: 'Sales Team' },
    { value: 'support', label: 'Support Team' },
    { value: 'customers', label: 'Customers' },
];

export default function BroadcastPage() {
    const auth = useAuth();
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sending, setSending] = useState(false);

    const send = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSending(true);
        setError('');
        setSuccess('');
        try {
            const result = auth.role === 'ADMIN'
                ? await adminApi.sendAnnouncement(message.trim(), audience)
                : await supervisorApi.broadcast(message.trim(), audience);
            setSuccess(`Broadcast sent${result.recipients != null ? ` to ${result.recipients} users` : ''}.`);
            setMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
                    <PageHeader title="Broadcast Message" subtitle="Send an announcement to your team or customers" />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <Card>
                <form onSubmit={send}>
                    <Select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ marginBottom: 12, maxWidth: 280 }}>
                        {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your announcement..."
                        rows={6}
                        required
                        style={{ ...inputStyle, marginBottom: 12 }}
                    />
                    <PrimaryButton type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send broadcast'}</PrimaryButton>
                </form>
            </Card>
        </>
    );
}