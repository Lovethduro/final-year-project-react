import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, StatCard } from './components/ui';

const pipeline = [
    { id: '1', deal: 'Enterprise Security Package', customer: 'NNPC', stage: 'negotiation', amount: '₦4.5M' },
    { id: '2', deal: 'Solar Installation - 50kW', customer: 'Stallion Suites', stage: 'proposal', amount: '₦2.8M' },
    { id: '3', deal: 'ICT Support Contract', customer: 'Bethel Hotel', stage: 'closed_won', amount: '₦1.2M' },
    { id: '4', deal: 'CCTV & Access Control', customer: 'FUT Wukari', stage: 'discovery', amount: '₦950K' },
];

export default function SalesPage() {
    return (
        <DashboardLayout>
            <PageHeader title="Sales Pipeline" subtitle="Monitor deals and revenue opportunities" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Pipeline Value" value="₦9.45M" icon="💰" status="info" />
                <StatCard title="Active Deals" value={pipeline.filter((d) => d.stage !== 'closed_won').length} icon="📈" status="warning" />
                <StatCard title="Won This Month" value="₦1.2M" icon="✅" status="success" />
            </div>
            <Card title="Deals">
                <DataTable
                    columns={[
                        { key: 'deal', label: 'Deal' },
                        { key: 'customer', label: 'Customer' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'stage', label: 'Stage', render: (row) => <StatusBadge status={row.stage === 'closed_won' ? 'success' : 'info'} label={row.stage.replace('_', ' ')} /> },
                    ]}
                    rows={pipeline}
                />
            </Card>
        </DashboardLayout>
    );
}
