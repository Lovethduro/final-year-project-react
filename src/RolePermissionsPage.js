import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, PrimaryButton, Alert } from './components/ui';
import { ROLE_ACCESS, SYSTEM_ROLES } from './config/roleAccess';
import { theme } from './styles/theme';

export default function RolePermissionsPage() {
    const [selectedRoleId, setSelectedRoleId] = useState('ADMIN');
    const selectedRole = SYSTEM_ROLES.find((role) => role.id === selectedRoleId) || SYSTEM_ROLES[0];
    const access = ROLE_ACCESS[selectedRoleId];

    return (
        <>
                    <PageHeader
                title="Roles Overview"
                subtitle="Reference guide for what each role can access. Assign roles in User Management."
                action={(
                    <Link to="/dashboard/users" style={{ textDecoration: 'none' }}>
                        <PrimaryButton>Go to User Management</PrimaryButton>
                    </Link>
                )}
            />

            <Alert type="info">
                Access is controlled by <strong>role assignment</strong>, not per-module checkboxes.
                To change what someone can do, update their role in User Management.
            </Alert>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: 20 }}>
                <Card title="Roles">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {SYSTEM_ROLES.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setSelectedRoleId(role.id)}
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: selectedRoleId === role.id ? 'rgba(0,45,114,0.15)' : 'transparent',
                                    color: selectedRoleId === role.id ? theme.accent : theme.textMuted,
                                    fontFamily: theme.fontBody,
                                }}
                            >
                                <div style={{ fontWeight: 500 }}>{role.label}</div>
                                <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>{role.id}</div>
                            </button>
                        ))}
                    </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card title={selectedRole.label}>
                        <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                            {selectedRole.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {access.highlights.map((item) => (
                                <span
                                    key={item}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        background: 'rgba(0,45,114,0.12)',
                                        color: theme.accent,
                                        border: '0.5px solid rgba(0,45,114,0.25)',
                                    }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </Card>

                    <Card title="Module access">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: theme.fontBody }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: 10, color: theme.textDim, fontSize: 11 }}>Module</th>
                                        <th style={{ textAlign: 'left', padding: 10, color: theme.textDim, fontSize: 11 }}>Access level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {access.areas.map((area) => (
                                        <tr key={area.module} style={{ borderTop: `0.5px solid ${theme.border}` }}>
                                            <td style={{ padding: 12, color: theme.text, fontWeight: 500, verticalAlign: 'top' }}>
                                                {area.module}
                                            </td>
                                            <td style={{ padding: 12, color: theme.textMuted, fontSize: 13, lineHeight: 1.5 }}>
                                                {area.access}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}