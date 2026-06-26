export const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth`;

/** Set to true to require MFA setup and verification after login. */
export const LOGIN_MFA_ENABLED = false;

export const SESSION_KEYS = [
    'userId', 'userEmail', 'userName', 'userPhone', 'authToken', 'userRole', 'sessionId',
    'mfaEnabled', 'emailVerified', 'userAvatarUrl', 'userPaymentMethod', 'userMemberSince',
    'mustChangePassword', 'showMotivationalMessages', 'profileComplete',
];

const REMEMBER_EMAIL_KEY = 'cyforce_remember_email';
const LEGACY_REMEMBER_KEY = 'cyforce_remember_login';
const PERSISTENCE_KEY = 'authPersistence';

export function getDashboardPath(role) {
    const r = (role || 'CUSTOMER').toUpperCase();
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'SUPERVISOR') return '/supervisor/dashboard';
    if (r === 'SALES_AGENT') return '/sales/dashboard';
    if (r === 'SUPPORT_AGENT') return '/support/dashboard';
    return '/customer/dashboard';
}

/** @returns {boolean} Whether the active session was stored with "Remember me". */
export function isSessionPersistent() {
    return localStorage.getItem(PERSISTENCE_KEY) !== 'session';
}

/**
 * Store authenticated session.
 * Remember me checked → localStorage (survives browser restart).
 * Remember me unchecked → sessionStorage (cleared when the tab/browser session ends).
 */
export function storeAuthSession(data, rememberMe = false) {
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
    if (data.sessionId) storage.setItem('sessionId', data.sessionId);
    storage.setItem('mfaEnabled', String(Boolean(data.mfaEnabled)));
    storage.setItem('emailVerified', String(Boolean(data.emailVerified)));
    storage.setItem('mustChangePassword', String(Boolean(data.mustChangePassword)));
    storage.setItem('profileComplete', String(data.profileComplete !== false));
    storage.setItem('showMotivationalMessages', String(data.showMotivationalMessages !== false));
    if (data.avatarUrl) storage.setItem('userAvatarUrl', data.avatarUrl);
    if (data.preferredPaymentMethod) storage.setItem('userPaymentMethod', data.preferredPaymentMethod);
    if (data.createdAt) storage.setItem('userMemberSince', data.createdAt);
}

/** Saved email/role/method for login form convenience only — never stores a password. */
export function loadRememberedLogin() {
    migrateLegacyRememberedLogin();
    try {
        const raw = localStorage.getItem(REMEMBER_EMAIL_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data?.email && data?.loginMethod !== 'google' && data?.loginMethod !== 'microsoft') {
            return null;
        }
        return {
            email: data.email || '',
            role: data.role || '',
            loginMethod: data.loginMethod || 'password',
        };
    } catch {
        return null;
    }
}

export function hasRememberedEmail() {
    return Boolean(loadRememberedLogin()?.email);
}

/** Save or clear remembered email/role/method after a successful login. */
export function saveRememberedLogin({ email, role, remember, loginMethod = 'password' }) {
    const method = loginMethod || 'password';
    const normalizedEmail = email?.trim().toLowerCase() || '';

    if (remember && (normalizedEmail || method === 'google' || method === 'microsoft')) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, JSON.stringify({
            email: normalizedEmail,
            role: role || '',
            loginMethod: method,
        }));
    } else {
        clearRememberedEmail();
    }
}

export function isOAuthLoginMethod(method) {
    return method === 'google' || method === 'microsoft';
}

export function clearRememberedEmail() {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.removeItem(LEGACY_REMEMBER_KEY);
}

function migrateLegacyRememberedLogin() {
    try {
        const raw = localStorage.getItem(LEGACY_REMEMBER_KEY);
        if (!raw) return;
        const legacy = JSON.parse(raw);
        if (legacy?.email && !localStorage.getItem(REMEMBER_EMAIL_KEY)) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, JSON.stringify({
                email: legacy.email,
                role: legacy.role || '',
            }));
        }
        localStorage.removeItem(LEGACY_REMEMBER_KEY);
    } catch {
        localStorage.removeItem(LEGACY_REMEMBER_KEY);
    }
}

export function needsProfileCompletion(data) {
    const role = (data?.role || '').toUpperCase();
    return role === 'CUSTOMER' && data?.profileComplete === false;
}

export function getPostAuthPath(data) {
    if (!data.emailVerified) return '/verify-email';
    if (data.mustChangePassword) return '/change-password';
    if (LOGIN_MFA_ENABLED && !data.mfaEnabled) return '/mfa-setup';
    if (needsProfileCompletion(data)) return '/complete-profile';
    return getDashboardPath(data.role);
}
