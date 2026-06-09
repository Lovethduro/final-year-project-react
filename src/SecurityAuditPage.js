import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput } from './components/ui';

const events = [
    { id: '1', event: 'Failed login attempt', user: 'unknown@example.com', ip: '192.168.1.45', time: '5 min ago', severity: 'warning' },
    { id: '2', event: 'MFA enabled', user: 'john@cyforce.com', ip: '10.0.0.12', time: '1 hour ago', severity: 'info' },
    { id: '3', event: 'Password changed', user: 'sarah@cyforce.com', ip: '10.0.0.8', time: '3 hours ago', severity: 'info' },
    { id: '4', event: 'Multiple failed logins', user: 'attacker@test.com', ip: '203.0.113.5', time: '6 hours ago', severity: 'error' },
];

export default function SecurityAuditPage() {
    const [search, setSearch] = useState('');
    const filtered = events.filter((e) => [e.event, e.user, e.ip].join(' ').toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout>
            <PageHeader title="Security Audit" subtitle="Monitor login attempts, security events, and suspicious activity" />
            <Card>
                <div style={{ marginBottom: 20, maxWidth: 360 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
                </div>
                <DataTable
                    columns={[
                        { key: 'event', label: 'Event' },
                        { key: 'user', label: 'User' },
                        { key: 'ip', label: 'IP Address' },
                        { key: 'time', label: 'Time' },
                        { key: 'severity', label: 'Severity', render: (row) => <StatusBadge status={row.severity} /> },
                    ]}
                    rows={filtered}
                />
            </Card>
        </DashboardLayout>
    );
}
