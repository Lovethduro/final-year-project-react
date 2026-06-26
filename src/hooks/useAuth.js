import { getSession, clearSession, authApi } from '../utils/apiClient';
import { hasRememberedEmail } from '../utils/authFlow';

export function useAuth() {
    return {
        ...buildAuthState(),
        logout: async () => {
            const session = getSession();
            try {
                if (session.userId) {
                    await authApi.logout(session.sessionId);
                }
            } catch {
                // Still clear local session if the network call fails.
            }
            clearSession({ keepRememberedLogin: hasRememberedEmail() });
            window.location.href = '/login';
        },
    };
}

function buildAuthState() {
    const session = getSession();
    const role = (session.role || 'CUSTOMER').toUpperCase();

    return {
        ...session,
        role,
        isAuthenticated: Boolean(session.userId && session.token),
        isAdmin: role === 'ADMIN',
        isSupervisor: role === 'SUPERVISOR',
        isStaff: ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'].includes(role),
    };
}
