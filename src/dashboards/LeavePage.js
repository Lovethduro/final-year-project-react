import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert, Select, DataTable } from '../components/ui';
import { leaveApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';

export default function LeavePage() {
    const auth = useAuth();
    const [eligibility, setEligibility] = useState(null);
    const [requests, setRequests] = useState([]);
    const [pending, setPending] = useState([]);
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const isReviewer = ['ADMIN', 'SUPERVISOR'].includes(auth.role);

    const load = () => {
        leaveApi.eligibility().then(setEligibility).catch(() => {});
        leaveApi.myRequests().then(setRequests).catch(() => setRequests([]));
        if (isReviewer) {
            leaveApi.pending().then(setPending).catch(() => setPending([]));
        }
    };

    useEffect(() => { load(); }, [isReviewer]);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await leaveApi.request(form);
            setSuccess('Leave request submitted for approval.');
            setForm({ startDate: '', endDate: '', reason: '' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const review = async (id, approve) => {
        setError('');
        try {
            if (approve) await leaveApi.approve(id);
            else await leaveApi.reject(id);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader title="Leave" subtitle="30 paid days per year after 12 months of continuous service" />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            {eligibility && (
                <Card title="Your leave balance" style={{ marginBottom: 20 }}>
                    <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>{eligibility.message}</p>
                    <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13 }}>
                        <span>Service: <strong>{eligibility.monthsOfService} months</strong></span>
                        <span>Used: <strong>{eligibility.usedDaysThisYear} days</strong></span>
                        <span>Remaining: <strong>{eligibility.remainingDays} days</strong></span>
                    </div>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card title="Request leave">
                    <form onSubmit={submit}>
                        <label style={{ fontSize: 12, color: theme.textDim }}>Start date</label>
                        <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
                        <label style={{ fontSize: 12, color: theme.textDim }}>End date</label>
                        <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
                        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason (optional)" rows={3} style={{ ...inputStyle, marginBottom: 10 }} />
                        <PrimaryButton type="submit" disabled={!eligibility?.eligible}>Submit request</PrimaryButton>
                    </form>
                    <p style={{ fontSize: 12, color: theme.textDim, marginTop: 12 }}>
                        Approved leave appears on your calendar automatically with start and end reminders.
                    </p>
                </Card>

                <Card title="My requests">
                    <DataTable
                        columns={[
                            { key: 'startDate', label: 'From' },
                            { key: 'endDate', label: 'To' },
                            { key: 'daysRequested', label: 'Days' },
                            { key: 'status', label: 'Status' },
                        ]}
                        rows={requests}
                        emptyMessage="No leave requests yet."
                    />
                </Card>
            </div>

            {isReviewer && (
                <Card title="Pending leave approvals" style={{ marginTop: 20 }}>
                    <DataTable
                        columns={[
                            { key: 'userName', label: 'Employee' },
                            { key: 'startDate', label: 'Start' },
                            { key: 'endDate', label: 'End' },
                            { key: 'daysRequested', label: 'Days' },
                            { key: 'actions', label: '', render: (r) => (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" onClick={() => review(r.id, true)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                    <button type="button" onClick={() => review(r.id, false)} style={{ padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Reject</button>
                                </div>
                            )},
                        ]}
                        rows={pending}
                        emptyMessage="No pending leave requests."
                    />
                </Card>
            )}
        </DashboardLayout>
    );
}
