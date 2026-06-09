import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../images/CYFORCE 2-1.jpg';
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { assetUrl, getProfileImageUrl, userApi } from '../utils/apiClient';

const NAV_SECTIONS = [
    {
        title: 'Overview',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'],
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN'] },
            { path: '/supervisor/dashboard', label: 'Dashboard', icon: '📊', roles: ['SUPERVISOR'] },
            { path: '/customer/dashboard', label: 'Dashboard', icon: '📊', roles: ['CUSTOMER'] },
            { path: '/sales/dashboard', label: 'Dashboard', icon: '📊', roles: ['SALES_AGENT'] },
            { path: '/support/dashboard', label: 'Dashboard', icon: '📊', roles: ['SUPPORT_AGENT'] },
            { path: '/dashboard/sales', label: 'Sales', icon: '💰', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT'] },
            { path: '/dashboard/customers', label: 'Customers', icon: '👥', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/dashboard/leads', label: 'Leads', icon: '🎯', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT'] },
            { path: '/dashboard/tickets', label: 'Tickets', icon: '🎫', roles: ['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'] },
            { path: '/customer/tickets', label: 'My Tickets', icon: '🎫', roles: ['CUSTOMER'] },
            { path: '/customer/messages', label: 'Message Sales', icon: '💬', roles: ['CUSTOMER'] },
            { path: '/dashboard/billing', label: 'Billing', icon: '💳', roles: ['CUSTOMER'] },
            { path: '/customer/products', label: 'Products', icon: '🛍️', roles: ['CUSTOMER'] },
            { path: '/sales/messages', label: 'Customer Messages', icon: '💬', roles: ['SALES_AGENT'] },
            { path: '/dashboard/products', label: 'Products', icon: '🛍️', roles: ['ADMIN'] },
        ],
    },
    {
        title: 'Insights',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'],
        items: [
            { path: '/dashboard/analytics', label: 'Analytics', icon: '📈', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/performance', label: 'Performance', icon: '🏆', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/knowledge-base', label: 'Knowledge Base', icon: '📚', roles: ['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'] },
        ],
    },
    {
        title: 'Administration',
        roles: ['ADMIN', 'SUPERVISOR'],
        items: [
            { path: '/dashboard/users', label: 'User Management', icon: '🧑‍💼', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/roles', label: 'Roles & Permissions', icon: '🛡️', roles: ['ADMIN'] },
            { path: '/dashboard/billing', label: 'Billing', icon: '💳', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/compliance', label: 'Compliance', icon: '📋', roles: ['ADMIN'] },
            { path: '/dashboard/data', label: 'Data Management', icon: '🗄️', roles: ['ADMIN'] },
            { path: '/dashboard/modules', label: 'Modules', icon: '⚙️', roles: ['ADMIN'] },
            { path: '/dashboard/security', label: 'Security Audit', icon: '🔒', roles: ['ADMIN'] },
            { path: '/dashboard/system-config', label: 'System Config', icon: '🔧', roles: ['ADMIN'] },
            { path: '/dashboard/system-health', label: 'System Health', icon: '💚', roles: ['ADMIN', 'SUPERVISOR'] },
        ],
    },
    {
        title: 'Account',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'],
        items: [
            { path: '/profile', label: 'Profile', icon: '👤', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'] },
        ],
    },
];

function canSee(role, allowedRoles) {
    return allowedRoles.includes(role);
}

export function DashboardLayout({ children }) {
    const location = useLocation();
    const auth = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileImage, setProfileImage] = useState(auth.avatarUrl || null);

    useEffect(() => {
        if (auth.avatarUrl) {
            setProfileImage(auth.avatarUrl);
            return;
        }
        if (!auth.isAuthenticated) return;
        userApi.getProfile()
            .then((profile) => setProfileImage(getProfileImageUrl(profile)))
            .catch(() => {});
    }, [auth.avatarUrl, auth.isAuthenticated]);

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: theme.fontBody, display: 'flex' }}>
            <aside style={{
                width: sidebarOpen ? 260 : 0,
                minWidth: sidebarOpen ? 260 : 0,
                background: theme.bgDark,
                borderRight: `0.5px solid ${theme.border}`,
                transition: 'all 0.25s ease',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 300,
            }}>
                <div style={{ padding: '24px 20px', borderBottom: `0.5px solid ${theme.border}` }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <img src={logo} alt="CyForce" style={{ height: 32, objectFit: 'contain' }} />
                        <div>
                            <div style={{ fontFamily: theme.fontHeading, fontWeight: 800, fontSize: 14, color: theme.text }}>CyForce CRM</div>
                            <div style={{ fontSize: 10, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{auth.role}</div>
                        </div>
                    </Link>
                </div>

                <nav style={{ padding: '16px 12px', overflowY: 'auto', height: 'calc(100vh - 90px)' }}>
                    {NAV_SECTIONS.filter((section) => canSee(auth.role, section.roles)).map((section) => (
                        <div key={section.title} style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.textDim, padding: '0 10px', marginBottom: 8 }}>
                                {section.title}
                            </div>
                            {section.items.filter((item) => canSee(auth.role, item.roles)).map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '10px 12px',
                                            marginBottom: 4,
                                            borderRadius: 10,
                                            textDecoration: 'none',
                                            color: active ? theme.accent : 'rgba(255,255,255,0.65)',
                                            background: active ? 'rgba(43,92,230,0.15)' : 'transparent',
                                            border: active ? `0.5px solid ${theme.borderHover}` : '0.5px solid transparent',
                                            fontSize: 14,
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>

            <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: 'margin-left 0.25s ease', minWidth: 0 }}>
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 200,
                    background: 'rgba(6,11,26,0.94)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: `0.5px solid ${theme.border}`,
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: `0.5px solid ${theme.border}`,
                            color: theme.text,
                            borderRadius: 8,
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontFamily: theme.fontBody,
                        }}
                    >
                        ☰ Menu
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <NotificationBell />
                        <UserMenu auth={auth} profileImage={profileImage} onLogout={auth.logout} />
                    </div>
                </header>

                <main style={{ padding: '28px 24px 48px' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
