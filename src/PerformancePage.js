import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, DataTable, StatusBadge, Alert } from './components/ui';
import { HorizontalBarChart, StarRating } from './components/dashboard/DashboardWidgets';
import { analyticsApi } from './utils/apiClient';
import { theme } from './styles/theme';

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

    const chartItems = agents.map((agent) => ({
        label: agent.name,
        value: Number(agent.ticketsResolved || 0) + Number(agent.leadsConverted || 0),
    }));

    return (
        <>
                    <PageHeader
                title="Agent Performance"
                subtitle="Live leaderboard from tickets and leads"
            />
            {error && <Alert type="error">{error}</Alert>}
            <p style={{ fontSize: 13, color: theme.textDim, marginBottom: 20 }}>
                For full charts and CRM insights, open the{' '}
                <Link to="/dashboard/analytics" style={{ color: theme.accent }}>Analytics</Link> page.
            </p>

            {loading ? <p>Loading…</p> : (
                <>
                    <Card title="Performance overview" style={{ marginBottom: 20 }}>
                        {chartItems.length ? (
                            <HorizontalBarChart items={chartItems} />
                        ) : (
                            <p style={{ color: theme.textDim, fontSize: 13 }}>No agent performance data yet.</p>
                        )}
                    </Card>

                    <Card title="Leaderboard">
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Agent' },
                                { key: 'role', label: 'Role' },
                                { key: 'ticketsResolved', label: 'Tickets Resolved' },
                                { key: 'openTickets', label: 'Open' },
                                { key: 'leadsOwned', label: 'Leads Owned' },
                                { key: 'leadsConverted', label: 'Converted' },
                                { key: 'avgResponse', label: 'Avg Response' },
                                {
                                    key: 'rating',
                                    label: 'Rating',
                                    render: (row) => (
                                        typeof row.rating === 'number'
                                            ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <StatusBadge status="success" label={`${row.rating}/5`} />
                                                    <StarRating rating={row.rating} />
                                                </span>
                                            )
                                            : row.rating
                                    ),
                                },
                            ]}
                            rows={agents}
                            emptyMessage="No agent performance data yet."
                        />
                    </Card>
                </>
            )}
        </>
    );
}