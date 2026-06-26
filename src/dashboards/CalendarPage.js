import { useCallback, useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert, Select } from '../components/ui';
import { calendarApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';

const ROLE_OPTIONS = [
    { id: 'SALES_AGENT', label: 'Sales agents' },
    { id: 'SUPPORT_AGENT', label: 'Support agents' },
    { id: 'SUPERVISOR', label: 'Supervisors' },
    { id: 'ADMIN', label: 'Administrators' },
];

const EMPTY_FORM = {
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    eventType: 'personal',
    taggedUserIds: [],
    targetRoles: [],
};

function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseApiDate(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function toDatetimeLocalValue(value) {
    const d = parseApiDate(value);
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function eventMonthKey(value) {
    const d = parseApiDate(value);
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatEventDate(value) {
    const d = parseApiDate(value);
    return d ? d.toLocaleString() : '—';
}

function sortEvents(list) {
    return [...list].sort((a, b) => {
        const aTime = parseApiDate(a.startAt)?.getTime() ?? 0;
        const bTime = parseApiDate(b.startAt)?.getTime() ?? 0;
        return aTime - bTime;
    });
}

function canEditEvent(ev, auth) {
    if (ev?.eventType === 'leave') return false;
    return ev?.createdByUserId === auth.userId;
}

export default function CalendarPage() {
    const auth = useAuth();
    const [month, setMonth] = useState(monthKey());
    const [events, setEvents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const canManageCompany = ['ADMIN', 'SUPERVISOR'].includes(auth.role);

    const load = useCallback(async (targetMonth = month) => {
        setLoading(true);
        try {
            const data = await calendarApi.events(targetMonth);
            setEvents(sortEvents(Array.isArray(data) ? data : []));
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => { load(month); }, [month, load]);

    useEffect(() => {
        if (canManageCompany) {
            calendarApi.staff().then(setStaff).catch(() => setStaff([]));
        }
    }, [canManageCompany]);

    const resetForm = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const startEdit = (ev) => {
        if (!canEditEvent(ev, auth)) return;
        setEditingId(ev.id);
        setForm({
            title: ev.title || '',
            description: ev.description || '',
            startAt: toDatetimeLocalValue(ev.startAt),
            endAt: toDatetimeLocalValue(ev.endAt),
            eventType: ev.eventType === 'company' ? 'company' : 'personal',
            taggedUserIds: Array.isArray(ev.taggedUserIds) ? [...ev.taggedUserIds] : [],
            targetRoles: Array.isArray(ev.targetRoles) ? [...ev.targetRoles] : [],
        });
        setError('');
        setSuccess('');
    };

    const buildPayload = () => {
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            startAt: form.startAt,
            eventType: form.eventType,
            taggedUserIds: form.eventType === 'company' ? form.taggedUserIds : [],
            targetRoles: form.eventType === 'company' ? form.targetRoles : [],
        };
        if (form.endAt) payload.endAt = form.endAt;
        return payload;
    };

    const refreshAfterSave = async (saved) => {
        const targetMonth = eventMonthKey(saved?.startAt) || month;
        const refreshed = await calendarApi.events(targetMonth);
        setEvents(sortEvents(Array.isArray(refreshed) ? refreshed : []));
        if (targetMonth !== month) {
            setMonth(targetMonth);
        }
    };

    const saveEvent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const isEdit = !!editingId;
            const eventType = form.eventType;
            const payload = buildPayload();
            const saved = isEdit
                ? await calendarApi.updateEvent(editingId, payload)
                : await calendarApi.createEvent(payload);

            resetForm();
            await refreshAfterSave(saved);

            setSuccess(
                isEdit
                    ? 'Event updated. Everyone on the calendar has been notified.'
                    : eventType === 'company'
                        ? 'Event saved. It will appear on the calendar for everyone who was notified.'
                        : 'Event saved to your calendar.'
            );
            window.dispatchEvent(new Event('cyforce:notifications-refresh'));
        } catch (err) {
            setError(err.message || 'Could not save event. Check the date/time and try again.');
        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async () => {
        if (!editingId) return;
        if (!window.confirm('Delete this event? This cannot be undone.')) return;
        setError('');
        setSaving(true);
        try {
            await calendarApi.deleteEvent(editingId);
            resetForm();
            await load(month);
            setSuccess('Event deleted.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
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

    const toggleRole = (roleId) => {
        setForm((prev) => ({
            ...prev,
            targetRoles: prev.targetRoles.includes(roleId)
                ? prev.targetRoles.filter((x) => x !== roleId)
                : [...prev.targetRoles, roleId],
        }));
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Calendar"
                subtitle="Events are saved to your account and sync when you sign in on any device"
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <Card title={`Events — ${month}`}>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, width: 'auto', marginBottom: 16 }} />
                    {loading ? (
                        <p style={{ color: theme.textDim }}>Loading events…</p>
                    ) : events.length ? events.map((ev) => {
                        const editable = canEditEvent(ev, auth);
                        const active = editingId === ev.id;
                        return (
                            <div
                                key={ev.id}
                                style={{
                                    padding: '12px 10px',
                                    borderBottom: `0.5px solid ${theme.border}`,
                                    borderRadius: active ? 8 : 0,
                                    background: active ? 'rgba(43,92,230,0.08)' : 'transparent',
                                    border: active ? `1px solid ${theme.primary}` : 'none',
                                    marginBottom: active ? 4 : 0,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                                    <strong style={{ color: theme.text }}>{ev.title}</strong>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: theme.accent, textTransform: 'capitalize' }}>{ev.eventType}</span>
                                        {editable && (
                                            <button
                                                type="button"
                                                onClick={() => startEdit(ev)}
                                                style={{
                                                    fontSize: 11,
                                                    padding: '3px 8px',
                                                    borderRadius: 6,
                                                    border: `1px solid ${theme.border}`,
                                                    background: 'transparent',
                                                    color: theme.accent,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
                                    {formatEventDate(ev.startAt)}
                                    {ev.endAt ? ` → ${formatEventDate(ev.endAt)}` : ''}
                                </div>
                                {ev.createdByName && (
                                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                                        Created by {ev.createdByName}
                                    </div>
                                )}
                                {ev.description && <p style={{ fontSize: 13, color: theme.textMuted, margin: '6px 0 0' }}>{ev.description}</p>}
                                {ev.eventType === 'leave' && (
                                    <p style={{ fontSize: 11, color: theme.textDim, margin: '6px 0 0' }}>Managed via Leave — edit the leave request instead.</p>
                                )}
                            </div>
                        );
                    }) : <p style={{ color: theme.textDim }}>No events this month.</p>}
                </Card>

                <Card title={editingId ? 'Edit event' : 'Add event'}>
                    <form onSubmit={saveEvent}>
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" style={{ ...inputStyle, marginBottom: 10 }} />
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} style={{ ...inputStyle, marginBottom: 10 }} />
                        <input required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
                        <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} placeholder="End (optional)" style={{ ...inputStyle, marginBottom: 10 }} />
                        <Select
                            value={form.eventType}
                            onChange={(e) => setForm({ ...form, eventType: e.target.value, taggedUserIds: [], targetRoles: [] })}
                            style={{ marginBottom: 10 }}
                            disabled={!!editingId && form.eventType === 'company' && !canManageCompany}
                        >
                            <option value="personal">Personal</option>
                            {canManageCompany && <option value="company">Company (notify staff / roles)</option>}
                        </Select>
                        {form.eventType === 'company' && (
                            <>
                                <p style={{ fontSize: 12, color: theme.textDim, margin: '0 0 8px' }}>
                                    Notify specific people, whole roles, or leave both empty to alert all staff.
                                </p>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>Notify roles</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {ROLE_OPTIONS.map((role) => (
                                            <label key={role.id} style={{ display: 'flex', gap: 6, fontSize: 12, color: theme.textMuted }}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.targetRoles.includes(role.id)}
                                                    onChange={() => toggleRole(role.id)}
                                                />
                                                {role.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {staff.length > 0 && (
                                    <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>Tag specific staff</div>
                                        {staff.map((s) => (
                                            <label key={s.id} style={{ display: 'flex', gap: 8, fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                                                <input type="checkbox" checked={form.taggedUserIds.includes(s.id)} onChange={() => toggleTag(s.id)} />
                                                {s.name} ({s.role})
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <PrimaryButton type="submit" disabled={saving}>
                                {saving ? 'Saving…' : editingId ? 'Update event' : 'Save event'}
                            </PrimaryButton>
                            {editingId && (
                                <>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            border: `1px solid ${theme.border}`,
                                            background: 'transparent',
                                            color: theme.textMuted,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deleteEvent}
                                        disabled={saving}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            border: `1px solid ${theme.error}55`,
                                            background: 'rgba(239,68,68,0.08)',
                                            color: theme.error,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                        }}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
