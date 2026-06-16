import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, DataTable, Alert } from '../components/ui';
import { supervisorApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';

export default function ApprovalsPage() {
    const auth = useAuth();
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    const load = () => {
        supervisorApi.approvals().then(setItems).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);

    const review = async (id, approve) => {
        setActionId(id);
        setError('');
        try {
            await supervisorApi.reviewApproval(id, approve);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionId(null);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader title="Approvals & Requests" subtitle="Review leave, lead assignments, and other pending items" />
            {error && <Alert type="error">{error}</Alert>}
            <Card>
                <DataTable
                    columns={[
                        { key: 'type', label: 'Type' },
                        { key: 'name', label: 'Requested by' },
                        { key: 'email', label: 'Details' },
                        { key: 'createdAt', label: 'Submitted', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' },
                        { key: 'actions', label: 'Actions', render: (r) => (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" disabled={actionId === r.id} onClick={() => review(r.id, true)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.success, color: '#fff', fontSize: 11, cursor: 'pointer' }}>Approve</button>
                                <button type="button" disabled={actionId === r.id} onClick={() => review(r.id, false)} style={{ padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 11, cursor: 'pointer' }}>Deny</button>
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
        </DashboardLayout>
    );
}
