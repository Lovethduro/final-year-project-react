import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, PrimaryButton, Alert, DataTable, StatusBadge, ConfirmDialog, ReviewNoteDialog } from '../components/ui';
import { leaveApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';

function statusTone(status) {
    if (status === 'approved') return 'success';
    if (status === 'rejected' || status === 'cancelled') return 'error';
    if (status === 'pending') return 'warning';
    return 'info';
}

function formatRole(role) {
    if (!role) return '—';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LeavePage() {
    const auth = useAuth();
    const isAdmin = auth.role === 'ADMIN';
    const isSupervisor = auth.role === 'SUPERVISOR';
    const isReviewer = isAdmin || isSupervisor;
    const canRequestLeave = !isAdmin;

    const [requests, setRequests] = useState([]);
    const [pending, setPending] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionId, setActionId] = useState(null);
    const [reviewDialog, setReviewDialog] = useState(null);
    const [cancelDialogId, setCancelDialogId] = useState(null);

    const load = () => {
        if (isAdmin) {
            leaveApi.all().then(setAllRequests).catch(() => setAllRequests([]));
            leaveApi.pending().then(setPending).catch(() => setPending([]));
        } else {
            leaveApi.myRequests().then(setRequests).catch(() => setRequests([]));
            if (isReviewer) {
                leaveApi.pending().then(setPending).catch(() => setPending([]));
            }
        }
    };

    useEffect(() => { load(); }, [isAdmin, isReviewer]);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await leaveApi.request(form);
            setSuccess('Leave request submitted.');
            setForm({ startDate: '', endDate: '', reason: '' });
            load();
            window.dispatchEvent(new Event('cyforce:notifications-refresh'));
        } catch (err) {
            setError(err.message);
        }
    };

    const submitReview = async (note) => {
        if (!reviewDialog) return;
        const { id, approve } = reviewDialog;
        setError('');
        setActionId(id);
        try {
            if (approve) await leaveApi.approve(id, note);
            else await leaveApi.reject(id, note);
            setSuccess(approve ? 'Leave approved and added to the team calendar.' : 'Leave request rejected.');
            setReviewDialog(null);
            load();
            window.dispatchEvent(new Event('cyforce:notifications-refresh'));
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const confirmCancel = async () => {
        if (!cancelDialogId) return;
        const id = cancelDialogId;
        setError('');
        setActionId(id);
        try {
            await leaveApi.cancel(id);
            setSuccess('Leave request cancelled.');
            setCancelDialogId(null);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const reviewActions = (r, onlySupervisor = false) => {
        if (r.status !== 'pending') return null;
        if (onlySupervisor && r.userRole !== 'SUPERVISOR') return null;
        return (
            <>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    type="button"
                    disabled={actionId === r.id}
                    onClick={() => setReviewDialog({ id: r.id, approve: true })}
                    style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}
                >
                    Approve
                </button>
                <button
                    type="button"
                    disabled={actionId === r.id}
                    onClick={() => setReviewDialog({ id: r.id, approve: false })}
                    style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}
                >
                    Reject
                </button>
            </div>
            </>
        );
    };

    return (
    <>
                    <PageHeader
                title="Leave"
                subtitle={
                    isAdmin
                        ? 'View all leave requests and approve or reject supervisor leave'
                        : 'Request time off and track your leave history'
                }
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            {isAdmin ? (
                <Card title="All leave requests">
                    <p style={{ fontSize: 12, color: theme.textDim, margin: '0 0 12px' }}>
                        You can approve or reject pending requests from supervisors only. Sales and support leave is handled by supervisors.
                    </p>
                    <DataTable
                        columns={[
                            { key: 'userName', label: 'Employee' },
                            { key: 'userRole', label: 'Role', render: (r) => formatRole(r.userRole) },
                            { key: 'startDate', label: 'Start' },
                            { key: 'endDate', label: 'End' },
                            { key: 'daysRequested', label: 'Days' },
                            { key: 'reason', label: 'Reason', render: (r) => r.reason || '—' },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (r) => <StatusBadge status={statusTone(r.status)} label={r.status} />,
                            },
                            {
                                key: 'actions',
                                label: '',
                                render: (r) => reviewActions(r, true),
                            },
                        ]}
                        rows={allRequests}
                        emptyMessage="No leave requests yet."
                    />
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {canRequestLeave && (
                        <Card title="Request leave">
                            <form onSubmit={submit}>
                                <label style={{ fontSize: 12, color: theme.textDim }}>Start date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    style={{ ...inputStyle, marginBottom: 10 }}
                                />
                                <label style={{ fontSize: 12, color: theme.textDim }}>End date</label>
                                <input
                                    type="date"
                                    required
                                    min={form.startDate || new Date().toISOString().slice(0, 10)}
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    style={{ ...inputStyle, marginBottom: 10 }}
                                />
                                <textarea
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Reason (optional)"
                                    rows={3}
                                    style={{ ...inputStyle, marginBottom: 10 }}
                                />
                                <PrimaryButton type="submit">Submit request</PrimaryButton>
                            </form>
                            <p style={{ fontSize: 12, color: theme.textDim, marginTop: 12 }}>
                                Approved leave is added to the <Link to="/dashboard/calendar" style={{ color: theme.accent }}>team calendar</Link> automatically.
                            </p>
                        </Card>
                    )}

                    <Card title="My requests">
                        <DataTable
                            columns={[
                                { key: 'startDate', label: 'From' },
                                { key: 'endDate', label: 'To' },
                                { key: 'daysRequested', label: 'Days' },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (r) => <StatusBadge status={statusTone(r.status)} label={r.status} />,
                                },
                                {
                                    key: 'actions',
                                    label: '',
                                    render: (r) => (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {r.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    disabled={actionId === r.id}
                                                    onClick={() => setCancelDialogId(r.id)}
                                                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {r.status === 'approved' && (
                                                <Link to="/dashboard/calendar" style={{ fontSize: 11, color: theme.accent }}>View calendar</Link>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                            rows={requests}
                            emptyMessage="No leave requests yet."
                        />
                    </Card>
                </div>
            )}

            {isReviewer && !isAdmin && (
                <Card title="Pending leave approvals" style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 12, color: theme.textDim, margin: '0 0 12px' }}>
                        You can also review leave from the <Link to="/dashboard/approvals" style={{ color: theme.accent }}>Approvals</Link> page.
                    </p>
                    <DataTable
                        columns={[
                            { key: 'userName', label: 'Employee' },
                            { key: 'startDate', label: 'Start' },
                            { key: 'endDate', label: 'End' },
                            { key: 'daysRequested', label: 'Days' },
                            { key: 'reason', label: 'Reason', render: (r) => r.reason || '—' },
                            {
                                key: 'actions',
                                label: '',
                                render: (r) => reviewActions(r),
                            },
                        ]}
                        rows={pending}
                        emptyMessage="No pending leave requests."
                    />
                </Card>
            )}

            <ReviewNoteDialog
                open={!!reviewDialog}
                title={reviewDialog?.approve ? 'Approve leave request' : 'Reject leave request'}
                message={
                    reviewDialog?.approve
                        ? 'Add an optional note for the employee.'
                        : 'Add an optional reason. You can leave this blank and reject without a note.'
                }
                noteLabel={reviewDialog?.approve ? 'Approval note (optional)' : 'Reason for rejection (optional)'}
                confirmLabel={reviewDialog?.approve ? 'Approve' : 'Reject'}
                danger={!reviewDialog?.approve}
                loading={!!reviewDialog && actionId === reviewDialog.id}
                onConfirm={submitReview}
                onCancel={() => setReviewDialog(null)}
            />

            <ConfirmDialog
                open={!!cancelDialogId}
                title="Cancel leave request?"
                message="This pending leave request will be withdrawn."
                confirmLabel="Cancel request"
                danger
                loading={!!cancelDialogId && actionId === cancelDialogId}
                onConfirm={confirmCancel}
                onCancel={() => setCancelDialogId(null)}
            />
    </>
    );
}