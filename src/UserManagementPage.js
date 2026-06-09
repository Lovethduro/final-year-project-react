import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, PrimaryButton, Alert } from './components/ui';
import { userApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';

const ROLE_OPTIONS = ['All', 'ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];

function formatRole(role) {
    if (!role) return 'Unknown';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UserManagementPage() {
    const auth = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadUsers = () => {
        setLoading(true);
        userApi.listUsers()
            .then(setUsers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadUsers(); }, []);

    const filtered = users.filter((user) => {
        const matchesSearch = [user.fullName, user.email].join(' ').toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        const status = !user.emailVerified ? 'Pending' : user.active ? 'Active' : 'Inactive';
        const matchesStatus = statusFilter === 'All' || status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const toggleStatus = async (user) => {
        try {
            const updated = await userApi.updateUserStatus(user.id, !user.active);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="User Management"
                subtitle="Manage system users, roles, and account status"
                action={<PrimaryButton onClick={loadUsers}>Refresh</PrimaryButton>}
            />

            {error && <Alert type="error">{error}</Alert>}

            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search name or email..." />
                    <FilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} />
                    <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
                </div>

                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading users...</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'fullName', label: 'Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'role', label: 'Role', render: (row) => formatRole(row.role) },
                            { key: 'status', label: 'Status', render: (row) => {
                                if (!row.emailVerified) return <StatusBadge status="pending" label="Pending" />;
                                return <StatusBadge status={row.active ? 'active' : 'inactive'} label={row.active ? 'Active' : 'Inactive'} />;
                            }},
                            { key: 'mfaEnabled', label: 'MFA', render: (row) => (
                                <StatusBadge status={row.mfaEnabled ? 'success' : 'inactive'} label={row.mfaEnabled ? 'On' : 'Off'} />
                            )},
                            { key: 'lastLoginAt', label: 'Last Login' },
                            { key: 'actions', label: 'Actions', render: (row) => auth.isAdmin ? (
                                <button
                                    onClick={() => toggleStatus(row)}
                                    style={{
                                        background: 'rgba(43,92,230,0.15)',
                                        color: '#38BDF8',
                                        border: '0.5px solid rgba(56,189,248,0.3)',
                                        borderRadius: 8,
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                    }}
                                >
                                    {row.active ? 'Deactivate' : 'Activate'}
                                </button>
                            ) : '—' },
                        ]}
                        rows={filtered}
                        emptyMessage="No users match your filters."
                    />
                )}
            </Card>
        </DashboardLayout>
    );
}
