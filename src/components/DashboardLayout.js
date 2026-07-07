import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import logo from '../images/CYFORCE 2-1.jpg';
import { theme, formatRoleLabel } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/useMediaQuery';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { MotivationalBanner } from './MotivationalBanner';
import { NavIcon } from './dashboard/NavIcons';
import { getProfileImageUrl, userApi } from '../utils/apiClient';

const NAV_SECTIONS = [
    {
        title: 'Overview',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'],
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN'] },
            { path: '/supervisor/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['SUPERVISOR'] },
            { path: '/customer/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['CUSTOMER'] },
            { path: '/sales/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['SALES_AGENT'] },
            { path: '/support/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['SUPPORT_AGENT'] },
            { path: '/dashboard/sales', label: 'Sales', icon: 'sales', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT'] },
            { path: '/dashboard/customers', label: 'Customers', icon: 'customers', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/dashboard/leads', label: 'Leads', icon: 'leads', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT'] },
            { path: '/dashboard/tickets', label: 'Tickets & Chat', icon: 'tickets', roles: ['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'] },
            { path: '/dashboard/conversations', label: 'Sales Conversations', icon: 'messages', roles: ['ADMIN'] },
            { path: '/customer/tickets', label: 'My Tickets', icon: 'tickets', roles: ['CUSTOMER'] },
            { path: '/customer/support', label: 'Contact Support', icon: 'support', roles: ['CUSTOMER'] },
            { path: '/customer/messages', label: 'Message Sales', icon: 'messages', roles: ['CUSTOMER'] },
            { path: '/dashboard/billing', label: 'Billing', icon: 'billing', roles: ['CUSTOMER', 'ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/customer/products', label: 'Products', icon: 'products', roles: ['CUSTOMER'] },
            { path: '/customer/hot-deals', label: 'Hot Deals', icon: 'deals', roles: ['CUSTOMER'] },
            { path: '/dashboard/knowledge-base', label: 'Help Center', icon: 'knowledge', roles: ['CUSTOMER'] },
            { path: '/sales/messages', label: 'Customer Messages', icon: 'messages', roles: ['SALES_AGENT'] },
            { path: '/sales/messages', label: 'Escalated Chats', icon: 'messages', roles: ['SUPERVISOR'] },
            { path: '/dashboard/calendar', label: 'Calendar', icon: 'analytics', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/dashboard/leave', label: 'Leave', icon: 'profile', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/dashboard/broadcast', label: 'Broadcast', icon: 'messages', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/approvals', label: 'Approvals', icon: 'compliance', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/sales/playbook', label: 'Sales Playbook', icon: 'playbook', roles: ['SALES_AGENT', 'ADMIN', 'SUPERVISOR'] },
            { path: '/staff/shop', label: 'Staff Store', icon: 'products', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'] },
            { path: '/dashboard/products', label: 'Products', icon: 'products', roles: ['ADMIN'] },
            { path: '/dashboard/hot-deals', label: 'Hot Deals', icon: 'deals', roles: ['ADMIN', 'SUPERVISOR'] },
        ],
    },
    {
        title: 'Insights',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'],
        items: [
            { path: '/dashboard/analytics', label: 'Analytics', icon: 'analytics', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/sales/insights', label: 'Sales Insights', icon: 'analytics', roles: ['SALES_AGENT'] },
            { path: '/dashboard/feedback', label: 'Feedback & CSAT', icon: 'feedback', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/performance', label: 'Performance', icon: 'performance', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/knowledge-base', label: 'Knowledge Base', icon: 'knowledge', roles: ['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT', 'CUSTOMER'] },
        ],
    },
    {
        title: 'Administration',
        roles: ['ADMIN', 'SUPERVISOR'],
        items: [
            { path: '/dashboard/users', label: 'User Management', icon: 'users', roles: ['ADMIN', 'SUPERVISOR'] },
            { path: '/dashboard/roles', label: 'Roles Overview', icon: 'roles', roles: ['ADMIN'] },
            { path: '/dashboard/compliance', label: 'Compliance', icon: 'compliance', roles: ['ADMIN'] },
            { path: '/dashboard/data', label: 'Data Management', icon: 'data', roles: ['ADMIN'] },
            { path: '/dashboard/security', label: 'Security Audit', icon: 'security', roles: ['ADMIN'] },
            { path: '/dashboard/system-config', label: 'System Config', icon: 'config', roles: ['ADMIN'] },
            { path: '/dashboard/system-health', label: 'System Health', icon: 'health', roles: ['ADMIN', 'SUPERVISOR'] },
        ],
    },
    {
        title: 'Account',
        roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'],
        items: [
            { path: '/profile', label: 'Profile', icon: 'profile', roles: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT', 'CUSTOMER'] },
        ],
    },
];

function roleCanAccess(role, allowedRoles) {
    return allowedRoles.includes(role);
}

export function DashboardLayout({ children }) {
    const location = useLocation();
    const auth = useAuth();
    const isMobile = useIsMobile(900);
    const [sidebarOpen, setSidebarOpen] = useState(() => (
        typeof window !== 'undefined' ? window.innerWidth >= 900 : true
    ));
    const [profileImage, setProfileImage] = useState(auth.avatarUrl || null);

    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [isMobile]);

    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname, isMobile]);

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

    const currentPage = NAV_SECTIONS
        .flatMap((s) => s.items)
        .find((item) => item.path === location.pathname);

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: theme.fontBody, display: 'flex' }}>
            {isMobile && sidebarOpen && (
                <button
                    type="button"
                    className="cyforce-dashboard-backdrop"
                    aria-label="Close navigation menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside
                className="cyforce-dashboard-sidebar"
                style={{
                width: isMobile ? 240 : (sidebarOpen ? 240 : 0),
                minWidth: isMobile ? 240 : (sidebarOpen ? 240 : 0),
                background: theme.bgDark,
                borderRight: `1px solid ${theme.border}`,
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 300,
                transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
            }}>
                <div style={{ padding: '20px 16px', borderBottom: `1px solid ${theme.border}` }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <img src={logo} alt="CyForce" style={{ height: 28, objectFit: 'contain' }} />
                        <div>
                            <div style={{ fontFamily: theme.fontHeading, fontWeight: 700, fontSize: 14, color: theme.text }}>CyForce CRM</div>
                            <div style={{ fontSize: 11, color: theme.textDim }}>{formatRoleLabel(auth.role)}</div>
                        </div>
                    </Link>
                </div>

                <nav style={{ padding: '12px 8px', overflowY: 'auto', height: 'calc(100vh - 76px)' }}>
                    {NAV_SECTIONS
                        .filter((section) => roleCanAccess(auth.role, section.roles))
                        .map((section) => {
                            const items = section.items.filter((item) => roleCanAccess(auth.role, item.roles));
                            if (!items.length) return null;
                            return (
                        <div key={section.title} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textDim, padding: '0 12px', marginBottom: 4, fontWeight: 600 }}>
                                {section.title}
                            </div>
                            {items.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 900 && setSidebarOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 12px',
                                            marginBottom: 2,
                                            borderRadius: 6,
                                            textDecoration: 'none',
                                            color: active ? theme.text : theme.textMuted,
                                            background: active ? 'rgba(43,92,230,0.12)' : 'transparent',
                                            borderLeft: active ? `2px solid ${theme.primary}` : '2px solid transparent',
                                            fontSize: 13,
                                            fontWeight: active ? 500 : 400,
                                        }}
                                    >
                                        <span style={{ color: active ? theme.accent : theme.textDim, display: 'flex', flexShrink: 0 }}>
                                            <NavIcon name={item.icon} />
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                            );
                        })}
                </nav>
            </aside>

            <div
                className="cyforce-dashboard-content"
                style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 0) }}
            >
                <header
                    className="cyforce-dashboard-header"
                    style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 200,
                    background: theme.bgDark,
                    borderBottom: `1px solid ${theme.border}`,
                    padding: '0 24px',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                            style={{
                                background: 'transparent',
                                border: `1px solid ${theme.border}`,
                                color: theme.textMuted,
                                borderRadius: 6,
                                width: 36,
                                height: 36,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: theme.fontBody,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        {currentPage && (
                            <span className="cyforce-dashboard-page-title" style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{currentPage.label}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <NotificationBell />
                        <UserMenu auth={auth} profileImage={profileImage} onLogout={auth.logout} />
                    </div>
                </header>

                <main className="cyforce-dashboard-main" style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
                    <MotivationalBanner role={auth.role} />
                    {children}
                </main>
            </div>
        </div>
    );
}
