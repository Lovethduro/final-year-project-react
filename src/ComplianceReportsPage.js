import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, PrimaryButton } from './components/ui';

const reports = [
    { id: '1', name: 'Q1 2026 Security Audit', type: 'Security', generated: '2026-03-01', status: 'ready' },
    { id: '2', name: 'User Access Review', type: 'Compliance', generated: '2026-02-15', status: 'ready' },
    { id: '3', name: 'Data Retention Report', type: 'GDPR', generated: '2026-02-01', status: 'processing' },
];

export default function ComplianceReportsPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Compliance Reports"
                subtitle="Generate and download regulatory and audit reports"
                action={<PrimaryButton>Generate Report</PrimaryButton>}
            />
            <Card>
                <DataTable
                    columns={[
                        { key: 'name', label: 'Report' },
                        { key: 'type', label: 'Type' },
                        { key: 'generated', label: 'Generated' },
                        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status === 'ready' ? 'success' : 'pending'} label={row.status} /> },
                    ]}
                    rows={reports}
                />
            </Card>
        </DashboardLayout>
    );
}
