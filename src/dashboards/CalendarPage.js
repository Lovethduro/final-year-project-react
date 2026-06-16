import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert, Select } from '../components/ui';
import { calendarApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';

function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarPage() {
    const auth = useAuth();
    const [month, setMonth] = useState(monthKey());
    const [events, setEvents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', eventType: 'personal', taggedUserIds: [] });
    const canManageCompany = ['ADMIN', 'SUPERVISOR'].includes(auth.role);

    const load = () => {
        calendarApi.events(month).then(setEvents).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, [month]);
    useEffect(() => {
        if (canManageCompany) {
            calendarApi.staff().then(setStaff).catch(() => setStaff([]));
        }
    }, [canManageCompany]);

    const createEvent = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await calendarApi.createEvent(form);
            setForm({ title: '', description: '', startAt: '', endAt: '', eventType: 'personal', taggedUserIds: [] });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleTag = (id) => {
        setForm((prev) => ({
            ...prev,
            taggedUserIds: prev.taggedUserIds.includes(id)
                ? prev.taggedUserIds.filter((x) => x !== id)
                : [...prev.taggedUserIds, id],
        }));
    };

    return (
        <DashboardLayout>
            <PageHeader title="Calendar" subtitle="Company events, leave, and your personal reminders" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
                <Card title={`Events — ${month}`}>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, width: 'auto', marginBottom: 16 }} />
                    {events.length ? events.map((ev) => (
                        <div key={ev.id} style={{ padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <strong style={{ color: theme.text }}>{ev.title}</strong>
                                <span style={{ fontSize: 11, color: theme.accent, textTransform: 'capitalize' }}>{ev.eventType}</span>
                            </div>
                            <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
                                {ev.startAt ? new Date(ev.startAt).toLocaleString() : '—'}
                                {ev.endAt ? ` → ${new Date(ev.endAt).toLocaleString()}` : ''}
                            </div>
                            {ev.description && <p style={{ fontSize: 13, color: theme.textMuted, margin: '6px 0 0' }}>{ev.description}</p>}
                        </div>
                    )) : <p style={{ color: theme.textDim }}>No events this month.</p>}
                </Card>

                <Card title="Add event">
                    <form onSubmit={createEvent}>
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" style={{ ...inputStyle, marginBottom: 10 }} />
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} style={{ ...inputStyle, marginBottom: 10 }} />
                        <input required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
                        <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
                        <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} style={{ marginBottom: 10 }}>
                            <option value="personal">Personal</option>
                            {canManageCompany && <option value="company">Company (tag staff)</option>}
                        </Select>
                        {form.eventType === 'company' && staff.length > 0 && (
                            <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 10 }}>
                                {staff.map((s) => (
                                    <label key={s.id} style={{ display: 'flex', gap: 8, fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                                        <input type="checkbox" checked={form.taggedUserIds.includes(s.id)} onChange={() => toggleTag(s.id)} />
                                        {s.name} ({s.role})
                                    </label>
                                ))}
                            </div>
                        )}
                        <PrimaryButton type="submit">Save event</PrimaryButton>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
