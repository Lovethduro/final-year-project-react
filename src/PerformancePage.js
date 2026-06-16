import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, Alert } from './components/ui';
import { analyticsApi } from './utils/apiClient';

export default function PerformancePage() {
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsApi.performance()
            .then(setAgents)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <PageHeader title="Agent Performance" subtitle="Live leaderboard from tickets and leads" />
            {error && <Alert type="error">{error}</Alert>}
            <Card title="Leaderboard">
                {loading ? <p>Loading…</p> : (
                    <DataTable
                        columns={[
                            { key: 'name', label: 'Agent' },
                            { key: 'role', label: 'Role' },
                            { key: 'ticketsResolved', label: 'Tickets Resolved' },
                            { key: 'leadsOwned', label: 'Leads Owned' },
                            { key: 'avgResponse', label: 'Avg Response' },
                            { key: 'rating', label: 'Rating', render: (row) => (
                                typeof row.rating === 'number'
                                    ? <StatusBadge status="success" label={`${row.rating}/5`} />
                                    : row.rating
                            ) },
                        ]}
                        rows={agents}
                        emptyMessage="No agent performance data yet."
                    />
                )}
            </Card>
        </DashboardLayout>
    );
}
