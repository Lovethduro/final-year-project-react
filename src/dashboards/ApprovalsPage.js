import { useEffect, useState } from 'react';
import { PageHeader, Card, DataTable, Alert, ReviewNoteDialog } from '../components/ui';
import { supervisorApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';

export default function ApprovalsPage() {
    const auth = useAuth();
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionId, setActionId] = useState(null);
    const [reviewDialog, setReviewDialog] = useState(null);

    const load = () => {
        supervisorApi.approvals().then(setItems).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);

    const executeReview = async (id, approve, note) => {
        setActionId(id);
        setError('');
        try {
            await supervisorApi.reviewApproval(id, approve, note);
            setSuccess(approve ? 'Request approved.' : 'Request rejected.');
            setReviewDialog(null);
            load();
            window.dispatchEvent(new Event('cyforce:notifications-refresh'));
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    const startReview = (id, approve) => {
        const item = items.find((row) => row.id === id);
        const isLeave = item?.type === 'Leave request' || item?.payload?.leaveRequestId;
        if (isLeave) {
            setReviewDialog({ id, approve });
            return;
        }
        executeReview(id, approve, '');
    };

    const submitReview = (note) => {
        if (!reviewDialog) return;
        executeReview(reviewDialog.id, reviewDialog.approve, note);
    };

    return (
        <>
                    <PageHeader title="Approvals & Requests" subtitle="Review leave, lead assignments, and other pending items" />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <Card>
                <DataTable
                    columns={[
                        { key: 'type', label: 'Type' },
                        { key: 'name', label: 'Requested by' },
                        { key: 'email', label: 'Details' },
                        { key: 'createdAt', label: 'Submitted', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '-' },
                        { key: 'actions', label: 'Actions', render: (r) => (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" disabled={actionId === r.id} onClick={() => startReview(r.id, true)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                <button type="button" disabled={actionId === r.id} onClick={() => startReview(r.id, false)} style={{ padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Deny</button>
                            </div>
                        )},
                    ]}
                    rows={items}
                    emptyMessage="No pending approvals."
                />
            </Card>
            {auth.role === 'SUPERVISOR' && (
                <p style={{ fontSize: 12, color: theme.textDim, marginTop: 12 }}>
                    Lead assignment exceptions (same agent twice in a month) require admin approval.
                </p>
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
        </>
    );
}