import { useMemo } from 'react';
import { getSession, clearSession } from '../utils/apiClient';
import { loadRememberedLogin } from '../utils/authFlow';

export function useAuth() {
    return useMemo(() => {
        const session = getSession();
        const role = (session.role || 'CUSTOMER').toUpperCase();

        return {
            ...session,
            role,
            isAuthenticated: Boolean(session.userId && session.token),
            isAdmin: role === 'ADMIN',
            isSupervisor: role === 'SUPERVISOR',
            isStaff: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'].includes(role),
            logout: () => {
                clearSession({ keepRememberedLogin: Boolean(loadRememberedLogin()) });
                window.location.href = '/login';
            },
        };
    }, []);
}
