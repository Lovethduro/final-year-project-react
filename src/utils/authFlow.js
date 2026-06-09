export const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth`;

const SESSION_KEYS = ['userId', 'userEmail', 'userName', 'userPhone', 'authToken', 'userRole', 'mfaEnabled', 'emailVerified', 'userAvatarUrl', 'userPaymentMethod', 'userMemberSince'];
const REMEMBER_KEY = 'cyforce_remember_login';
const PERSISTENCE_KEY = 'authPersistence';

export function getDashboardPath(role) {
    const r = (role || 'CUSTOMER').toUpperCase();
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'SUPERVISOR') return '/supervisor/dashboard';
    if (r === 'SALES_AGENT') return '/sales/dashboard';
    if (r === 'SUPPORT_AGENT') return '/support/dashboard';
    return '/customer/dashboard';
}

export function storeAuthSession(data, rememberMe = true) {
    SESSION_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.setItem(PERSISTENCE_KEY, rememberMe ? 'local' : 'session');

    if (data.userId) storage.setItem('userId', data.userId);
    if (data.email) storage.setItem('userEmail', data.email);
    if (data.fullName) storage.setItem('userName', data.fullName);
    if (data.phone) storage.setItem('userPhone', data.phone);
    if (data.token) storage.setItem('authToken', data.token);
    if (data.role) storage.setItem('userRole', data.role);
    storage.setItem('mfaEnabled', String(Boolean(data.mfaEnabled)));
    storage.setItem('emailVerified', String(Boolean(data.emailVerified)));
    if (data.avatarUrl) storage.setItem('userAvatarUrl', data.avatarUrl);
    if (data.preferredPaymentMethod) storage.setItem('userPaymentMethod', data.preferredPaymentMethod);
    if (data.createdAt) storage.setItem('userMemberSince', data.createdAt);
}

export function loadRememberedLogin() {
    try {
        const raw = localStorage.getItem(REMEMBER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveRememberedLogin({ email, password, role, remember }) {
    if (remember && email) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
            email,
            password: password || '',
            role: role || '',
        }));
    } else {
        localStorage.removeItem(REMEMBER_KEY);
    }
}

export function getPostAuthPath(data) {
    if (!data.emailVerified) return '/verify-email';
    if (!data.mfaEnabled) return '/mfa-setup';
    return getDashboardPath(data.role);
}
