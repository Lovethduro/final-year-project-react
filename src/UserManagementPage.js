import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, FilterSelect, PrimaryButton, Alert, Select } from './components/ui';
import { adminApi, userApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { inputStyle } from './styles/theme';

const ROLE_OPTIONS = ['All', 'ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Pending'];
const CREATE_ROLE_OPTIONS = [
    { value: 'customer', label: 'Customer' },
    { value: 'sales_agent', label: 'Sales Agent' },
    { value: 'support_agent', label: 'Support Agent' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Administrator' },
];

function formatRole(role) {
    if (!role) return 'Unknown';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const emptyCreateForm = {
    fullName: '',
    email: '',
    phone: '',
    role: 'customer',
    companyName: '',
    customerType: 'individual',
};

export default function UserManagementPage() {
    const auth = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [creating, setCreating] = useState(false);

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

    const handleCreateChange = (field) => (e) => {
        setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        setSuccess('');
        try {
            await adminApi.createUser({
                fullName: createForm.fullName.trim(),
                email: createForm.email.trim().toLowerCase(),
                phone: createForm.phone.trim(),
                role: createForm.role,
                companyName: createForm.companyName.trim(),
                customerType: createForm.customerType,
            });
            setSuccess(`User created. A temporary password was emailed to ${createForm.email.trim().toLowerCase()}.`);
            setCreateForm(emptyCreateForm);
            setShowCreate(false);
            loadUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="User Management"
                subtitle="Manage system users, roles, and account status"
                action={(
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {auth.isAdmin && (
                            <PrimaryButton onClick={() => { setShowCreate(true); setSuccess(''); setError(''); }}>
                                Add User
                            </PrimaryButton>
                        )}
                        <PrimaryButton onClick={loadUsers}>Refresh</PrimaryButton>
                    </div>
                )}
            />

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            {showCreate && auth.isAdmin && (
                <Card title="Create User" style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
                        A secure temporary password will be generated and emailed to the user. They must change it on first login.
                    </p>
                    <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Full name</label>
                            <input value={createForm.fullName} onChange={handleCreateChange('fullName')} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Email</label>
                            <input type="email" value={createForm.email} onChange={handleCreateChange('email')} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Phone</label>
                            <input value={createForm.phone} onChange={handleCreateChange('phone')} style={inputStyle} placeholder="+234..." />
                    </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Role</label>
                            <Select value={createForm.role} onChange={handleCreateChange('role')}>
                                {CREATE_ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Company</label>
                            <input value={createForm.companyName} onChange={handleCreateChange('companyName')} style={inputStyle} />
                            </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Customer type</label>
                            <Select value={createForm.customerType} onChange={handleCreateChange('customerType')}>
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                                <option value="enterprise">Enterprise</option>
                            </Select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <PrimaryButton type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Create & Email Password'}
                            </PrimaryButton>
                                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                style={{
                                    padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                                }}
                            >
                                Cancel
                                            </button>
                                        </div>
                    </form>
                </Card>
            )}

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
