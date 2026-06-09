import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge } from './components/ui';

const agents = [
    { id: '1', name: 'Jane Smith', role: 'Support Agent', ticketsResolved: 48, avgResponse: '1.8h', rating: 4.9 },
    { id: '2', name: 'David Park', role: 'Support Agent', ticketsResolved: 42, avgResponse: '2.1h', rating: 4.7 },
    { id: '3', name: 'Mike Sales', role: 'Sales Agent', ticketsResolved: 35, avgResponse: '2.4h', rating: 4.6 },
    { id: '4', name: 'Emily Support', role: 'Support Agent', ticketsResolved: 51, avgResponse: '1.6h', rating: 4.8 },
];

export default function PerformancePage() {
    return (
        <DashboardLayout>
            <PageHeader title="Agent Performance" subtitle="Leaderboard and team productivity metrics" />
            <Card title="Leaderboard">
                <DataTable
                    columns={[
                        { key: 'name', label: 'Agent' },
                        { key: 'role', label: 'Role' },
                        { key: 'ticketsResolved', label: 'Resolved' },
                        { key: 'avgResponse', label: 'Avg Response' },
                        { key: 'rating', label: 'Rating', render: (row) => <StatusBadge status="success" label={`${row.rating}/5`} /> },
                    ]}
                    rows={agents}
                />
            </Card>
        </DashboardLayout>
    );
}
