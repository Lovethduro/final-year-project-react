import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card } from './components/ui';
import { theme } from './styles/theme';

const roles = ['Administrator', 'Supervisor', 'Sales Agent', 'Support Agent', 'Customer'];
const modules = ['User Management', 'Customers', 'Tickets', 'Sales', 'Leads', 'Analytics', 'System Config'];
const permissions = ['view', 'create', 'edit', 'delete'];

export default function RolePermissionsPage() {
    const [selectedRole, setSelectedRole] = useState('Administrator');

    return (
        <DashboardLayout>
            <PageHeader title="Roles & Permissions" subtitle="Configure access control per role and module" />
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
                <Card title="Roles">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {roles.map((role) => (
                            <button key={role} onClick={() => setSelectedRole(role)} style={{
                                textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: selectedRole === role ? 'rgba(43,92,230,0.15)' : 'transparent',
                                color: selectedRole === role ? theme.accent : 'rgba(255,255,255,0.7)',
                                fontFamily: theme.fontBody,
                            }}>
                                {role}
                            </button>
                        ))}
                    </div>
                </Card>
                <Card title={`${selectedRole} Permissions`}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: theme.fontBody }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: 10, color: theme.textDim, fontSize: 11 }}>Module</th>
                                    {permissions.map((p) => (
                                        <th key={p} style={{ textAlign: 'center', padding: 10, color: theme.textDim, fontSize: 11, textTransform: 'uppercase' }}>{p}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((mod) => (
                                    <tr key={mod}>
                                        <td style={{ padding: 10, color: theme.text }}>{mod}</td>
                                        {permissions.map((p) => (
                                            <td key={p} style={{ textAlign: 'center', padding: 10 }}>
                                                <input type="checkbox" defaultChecked={selectedRole === 'Administrator' || (selectedRole !== 'Customer' && p === 'view')} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
