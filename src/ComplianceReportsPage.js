import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, PrimaryButton, GhostButton, Alert } from './components/ui';
import { adminApi } from './utils/apiClient';

const REPORTS = [
    {
        id: 'security-audit',
        name: 'Security Audit Log',
        type: 'Security',
        description: 'Login attempts, MFA changes, password events, and IP addresses',
        download: (format) => adminApi.securityAuditReport(format),
    },
    {
        id: 'full-audit',
        name: 'Full Audit Log',
        type: 'Compliance',
        description: 'All system audit events including user management and admin actions',
        download: (format) => adminApi.auditLogsReport(format),
    },
];

export default function ComplianceReportsPage() {
    const [generatingKey, setGeneratingKey] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedAt, setGeneratedAt] = useState({});

    const handleGenerate = async (report, format) => {
        const key = `${report.id}-${format}`;
        setGeneratingKey(key);
        setError('');
        setSuccess('');
        try {
            await report.download(format);
            const now = new Date().toLocaleString();
            setGeneratedAt((prev) => ({ ...prev, [report.id]: now }));
            setSuccess(`${report.name} downloaded as ${format.toUpperCase()}.`);
        } catch (err) {
            setError(err.message || 'Failed to generate report');
        } finally {
            setGeneratingKey('');
        }
    };

    const rows = REPORTS.map((report) => ({
        ...report,
        generated: generatedAt[report.id] || 'Not generated yet',
        status: generatedAt[report.id] ? 'ready' : 'pending',
    }));

    return (
        <DashboardLayout>
            <PageHeader
                title="Compliance Reports"
                subtitle="Generate and download regulatory and audit reports"
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <Card>
                <DataTable
                    columns={[
                        { key: 'name', label: 'Report' },
                        { key: 'type', label: 'Type' },
                        {
                            key: 'description',
                            label: 'Contents',
                            render: (row) => <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{row.description}</span>,
                        },
                        { key: 'generated', label: 'Last Generated' },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (row) => (
                                <StatusBadge
                                    status={row.status === 'ready' ? 'success' : 'pending'}
                                    label={row.status === 'ready' ? 'ready' : 'available'}
                                />
                            ),
                        },
                        {
                            key: 'actions',
                            label: 'Download',
                            render: (row) => (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <GhostButton
                                        onClick={() => handleGenerate(row, 'csv')}
                                        disabled={generatingKey === `${row.id}-csv`}
                                        style={{ padding: '6px 12px', fontSize: 12 }}
                                    >
                                        {generatingKey === `${row.id}-csv` ? 'CSV…' : 'CSV'}
                                    </GhostButton>
                                    <PrimaryButton
                                        onClick={() => handleGenerate(row, 'pdf')}
                                        disabled={generatingKey === `${row.id}-pdf`}
                                        style={{ padding: '6px 12px', fontSize: 12 }}
                                    >
                                        {generatingKey === `${row.id}-pdf` ? 'PDF…' : 'PDF'}
                                    </PrimaryButton>
                                </div>
                            ),
                        },
                    ]}
                    rows={rows}
                />
            </Card>
        </DashboardLayout>
    );
}
