import { useEffect, useState } from 'react';
import { PageHeader, Card, DataTable, StatusBadge, StatCard, Alert } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { salesApi, supervisorApi, adminApi } from './utils/apiClient';

function formatNaira(amount) {
    if (!amount) return '₦0';
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
    return `₦${amount.toLocaleString()}`;
}

function stageLabel(status, score) {
    if (status === 'converted') return 'closed_won';
    if (status === 'lost') return 'closed_lost';
    if (status === 'qualified' && score >= 85) return 'negotiation';
    if (status === 'qualified' && score >= 70) return 'proposal';
    if (status === 'qualified') return 'qualified';
    if (status === 'contacted') return 'discovery';
    return 'new';
}

function stageBadgeStatus(stage) {
    if (stage === 'closed_won') return 'success';
    if (stage === 'closed_lost') return 'error';
    return 'info';
}

export default function SalesPage() {
    const auth = useAuth();
    const [leads, setLeads] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError('');
        const request = auth.role === 'SALES_AGENT'
            ? salesApi.leads()
            : auth.role === 'SUPERVISOR'
                ? supervisorApi.leads()
                : adminApi.leads();

        request
            .then(setLeads)
            .catch((err) => {
                setError(err.message);
                setLeads([]);
            })
            .finally(() => setLoading(false));
    }, [auth.role]);

    const deals = leads.map((lead) => {
        const value = (lead.score || 50) * 10000;
        const stage = stageLabel(lead.status, lead.score);
        return {
            id: lead.id,
            deal: lead.company ? `${lead.company} — ${lead.name}` : lead.name,
            customer: lead.name,
            stage,
            amount: formatNaira(value),
            rawValue: value,
            status: lead.status,
        };
    });

    const activeDeals = deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
    const wonValue = deals.filter((d) => d.stage === 'closed_won').reduce((s, d) => s + d.rawValue, 0);
    const pipelineValue = activeDeals.reduce((s, d) => s + d.rawValue, 0);

    return (
        <>
                    <PageHeader title="Sales Pipeline" subtitle="Monitor deals and revenue opportunities from your leads" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Pipeline Value" value={loading ? '…' : formatNaira(pipelineValue)} status="info" />
                <StatCard title="Active Deals" value={loading ? '…' : activeDeals.length} status="warning" />
                <StatCard title="Won (Total)" value={loading ? '…' : formatNaira(wonValue)} status="success" />
            </div>

            <Card title="Deals">
                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.45)' }}>Loading deals…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'deal', label: 'Deal' },
                            { key: 'customer', label: 'Customer' },
                            { key: 'amount', label: 'Amount' },
                            { key: 'stage', label: 'Stage', render: (row) => <StatusBadge status={stageBadgeStatus(row.stage)} label={row.stage.replace('_', ' ')} /> },
                        ]}
                        rows={deals}
                        emptyMessage="No deals yet. Add leads to start building your pipeline."
                    />
                )}
            </Card>
        </>
    );
}