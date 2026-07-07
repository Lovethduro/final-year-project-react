import { SESSION_KEYS, clearRememberedEmail, isSessionPersistent } from './authFlow';

const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function assetUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_ROOT}${path}`;
}

function getStorageForSession() {
    const mode = localStorage.getItem('authPersistence');
    if (mode === 'session' && sessionStorage.getItem('userId')) return sessionStorage;
    if (localStorage.getItem('userId')) return localStorage;
    if (sessionStorage.getItem('userId')) return sessionStorage;
    return localStorage;
}

export function getSession() {
    const storage = getStorageForSession();
    return {
        userId: storage.getItem('userId'),
        email: storage.getItem('userEmail'),
        fullName: storage.getItem('userName'),
        phone: storage.getItem('userPhone'),
        token: storage.getItem('authToken'),
        role: storage.getItem('userRole'),
        sessionId: storage.getItem('sessionId'),
        mfaEnabled: storage.getItem('mfaEnabled') === 'true',
        emailVerified: storage.getItem('emailVerified') === 'true',
        avatarUrl: storage.getItem('userAvatarUrl'),
        preferredPaymentMethod: storage.getItem('userPaymentMethod'),
        memberSince: storage.getItem('userMemberSince'),
        rememberMe: isSessionPersistent(),
        mustChangePassword: storage.getItem('mustChangePassword') === 'true',
        profileComplete: storage.getItem('profileComplete') !== 'false',
        showMotivationalMessages: storage.getItem('showMotivationalMessages') !== 'false',
    };
}

export function formatPaymentMethod(method) {
    if (!method) return 'Not on file';
    if (method === 'paystack') return 'Paystack';
    if (method === 'flutterwave') return 'Flutterwave';
    return method.charAt(0).toUpperCase() + method.slice(1);
}

export function getProfileImageUrl(profile) {
    return profile?.profileImageUrl || profile?.avatarUrl || profile?.logoUrl || null;
}

export function clearSession({ keepRememberedLogin = false } = {}) {
    SESSION_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.removeItem('authPersistence');
    if (!keepRememberedLogin) {
        clearRememberedEmail();
    }
}

const GET_CACHE_MS = 120_000;
const GET_STALE_MS = 600_000;
const getResponseCache = new Map();
const inflightRefresh = new Set();

function storeCacheEntry(cacheKey, data) {
    getResponseCache.set(cacheKey, { data, at: Date.now() });
}

async function refreshCacheEntry(path, options, cacheKey) {
    if (inflightRefresh.has(cacheKey)) return;
    inflightRefresh.add(cacheKey);
    try {
        const data = await request(path, { ...options, noCache: true, _skipStale: true });
        storeCacheEntry(cacheKey, data);
    } catch {
        // Stale-while-revalidate: keep serving cached data if background refresh fails.
    } finally {
        inflightRefresh.delete(cacheKey);
    }
}

function requestCacheKey(method, path, userId) {
    return `${method}:${userId || 'anon'}:${path}`;
}

function invalidateGetCache(path) {
    const base = path.split('?')[0];
    const parts = base.split('/').filter(Boolean);
    const areaPrefix = parts.length >= 2 ? `/${parts[0]}/${parts[1]}` : base;
    for (const key of [...getResponseCache.keys()]) {
        if (key.includes(base) || key.includes(areaPrefix)) {
            getResponseCache.delete(key);
        }
    }
}

export function clearApiCache() {
    getResponseCache.clear();
}

async function request(path, options = {}) {
    const session = getSession();
    const method = (options.method || 'GET').toUpperCase();
    const cacheMs = options.noCache ? 0 : (options.cacheMs ?? (method === 'GET' ? GET_CACHE_MS : 0));
    const cacheKey = requestCacheKey(method, path, session.userId);

    if (method === 'GET' && cacheMs > 0 && !options._skipStale) {
        const hit = getResponseCache.get(cacheKey);
        if (hit) {
            const age = Date.now() - hit.at;
            if (age < cacheMs) {
                return hit.data;
            }
            if (age < GET_STALE_MS) {
                refreshCacheEntry(path, options, cacheKey);
                return hit.data;
            }
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (session.userId) {
        headers['X-User-Id'] = session.userId;
    }
    if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_ROOT}${path}`, {
        ...options,
        headers,
    });

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { error: text || 'Request failed' };
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Request failed');
    }

    if (method === 'GET' && cacheMs > 0) {
        storeCacheEntry(cacheKey, data);
    } else if (method !== 'GET') {
        invalidateGetCache(path);
    }

    return data;
}

async function downloadFile(path, filename) {
    const session = getSession();
    const headers = {};
    if (session.userId) headers['X-User-Id'] = session.userId;
    if (session.token) headers['Authorization'] = `Bearer ${session.token}`;

    const response = await fetch(`${API_ROOT}${path}`, { headers });
    if (!response.ok) {
        const text = await response.text();
        let message = 'Download failed';
        try {
            const data = JSON.parse(text);
            message = data?.error || data?.message || message;
        } catch {
            if (text) message = text;
        }
        throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export const api = {
    get: (path, options) => request(path, options),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export const notificationApi = {
    list: () => api.get('/api/notifications'),
    unreadCount: () => api.get('/api/notifications/unread-count'),
    markRead: (id) => api.patch(`/api/notifications/${id}/read`, {}),
    markAllRead: () => api.patch('/api/notifications/read-all', {}),
    delete: (id) => api.delete(`/api/notifications/${id}`),
    deleteAll: () => api.delete('/api/notifications'),
};

export const quoteApi = {
    request: (body) => api.post('/api/quotes/request', body),
    suggestBundle: (body) => api.post('/api/quotes/suggest-bundle', body),
    getPortal: (token) => api.get(`/api/quotes/portal/${token}`),
    sendPortalMessage: (token, message) => api.post(`/api/quotes/portal/${token}/messages`, { message }),
};

export const publicSupportApi = {
    config: () => api.get('/api/public/support/config'),
    estimatedResponse: (priority = 'medium') => api.get(`/api/public/support/estimated-response?priority=${encodeURIComponent(priority)}`),
    createTicket: (body) => api.post('/api/public/support/tickets', body),
    createTicketWithAttachment: (fields, attachment) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => { if (v) formData.append(k, v); });
        if (attachment) formData.append('attachment', attachment);
        return uploadRequest('/api/public/support/tickets/with-attachment', formData);
    },
    getPortal: (token) => api.get(`/api/public/support/tickets/portal/${token}`),
    replyToPortal: (token, message) => api.post(`/api/public/support/tickets/portal/${token}/reply`, { message }),
};

export const knowledgeBaseApi = {
    list: (q) => api.get(`/api/knowledge-base${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    get: (id) => api.get(`/api/knowledge-base/${id}`),
};

export const adminApi = {
    overview: () => api.get('/api/admin/dashboard/stats', { cacheMs: 180_000 }),
    feedback: () => api.get('/api/admin/feedback', { cacheMs: 300_000 }),
    users: () => api.get('/api/admin/users', { cacheMs: 120_000 }),
    createUser: (body) => api.post('/api/admin/users', body),
    updateUser: (id, body) => api.put(`/api/admin/users/${id}`, body),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    tickets: () => api.get('/api/admin/tickets', { cacheMs: 90_000 }),
    leads: () => api.get('/api/admin/leads', { cacheMs: 90_000 }),
    auditLogs: () => api.get('/api/admin/audit-logs', { cacheMs: 120_000 }),
    securityAudit: () => api.get('/api/admin/security-audit', { cacheMs: 120_000 }),
    sessions: () => api.get('/api/admin/sessions', { cacheMs: 120_000 }),
    securityAuditReport: (format = 'csv') => downloadFile(
        `/api/admin/security-audit/report?format=${encodeURIComponent(format)}`,
        `security-audit-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${format}`
    ),
    auditLogsReport: (format = 'csv') => downloadFile(
        `/api/admin/audit-logs/report?format=${encodeURIComponent(format)}`,
        `audit-log-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${format}`
    ),
    sendAnnouncement: (message, audience = 'all') => api.post('/api/admin/announcements', { message, audience }),
    getSystemConfig: () => api.get('/api/admin/system-config'),
    updateSystemConfig: (body) => api.put('/api/admin/system-config', body),
    knowledgeBase: () => api.get('/api/admin/knowledge-base'),
    createKnowledgeArticle: (body) => api.post('/api/admin/knowledge-base', body),
    updateKnowledgeArticle: (id, body) => api.put(`/api/admin/knowledge-base/${id}`, body),
    deleteKnowledgeArticle: (id) => api.delete(`/api/admin/knowledge-base/${id}`),
    dataManagementOverview: () => api.get('/api/admin/data-management/overview'),
    updateDataRetention: (retentionDays) => api.put('/api/admin/data-management/retention', { retentionDays }),
    runDataBackup: () => api.post('/api/admin/data-management/backup', {}),
    exportData: (format = 'csv') => downloadFile(
        `/api/admin/data-management/export?format=${encodeURIComponent(format)}`,
        `cyforce-data-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${format}`
    ),
};

export const customerApi = {
    stats: () => api.get('/api/customer/dashboard/stats'),
    tickets: () => api.get('/api/customer/tickets'),
    estimatedResponse: (priority = 'medium') => api.get(`/api/customer/tickets/estimated-response?priority=${encodeURIComponent(priority)}`),
    createTicket: (body) => api.post('/api/customer/tickets', body),
    createTicketWithAttachment: (fields, attachment) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => { if (v) formData.append(k, v); });
        if (attachment) formData.append('attachment', attachment);
        return uploadRequest('/api/customer/tickets/with-attachment', formData);
    },
    getTicket: (id) => api.get(`/api/customer/tickets/${id}`),
    replyToTicket: (id, message) => api.post(`/api/customer/tickets/${id}/reply`, { message }),
    conversations: () => api.get('/api/customer/conversations'),
    startConversation: (subject, message) => api.post('/api/customer/conversations', { subject, message }),
    getConversation: (id) => api.get(`/api/customer/conversations/${id}`),
    sendMessage: (id, message) => api.post(`/api/customer/conversations/${id}/messages`, { message }),
    rateConversation: (id, rating, comment) => api.post(`/api/customer/conversations/${id}/rating`, { rating, comment }),
    rateTicket: (id, rating, comment) => api.post(`/api/customer/tickets/${id}/rating`, { rating, comment }),
    invoices: () => api.get('/api/customer/invoices'),
    billingOverview: () => api.get('/api/customer/billing/overview'),
    checkout: (items, provider = 'paystack') => api.post('/api/customer/checkout', { items, provider }),
};

export const supportApi = {
    overview: () => api.get('/api/support/dashboard/overview'),
    stats: () => api.get('/api/support/dashboard/stats'),
    updateAgentStatus: (status) => api.put('/api/support/agent/status', { status }),
    macros: () => api.get('/api/support/macros', { cacheMs: 600_000 }),
    myTickets: () => api.get('/api/support/tickets'),
    allOpen: () => api.get('/api/support/tickets/all'),
    getTicket: (id) => api.get(`/api/support/tickets/${id}`),
    getTicketTimeline: (id) => api.get(`/api/support/tickets/${id}/timeline`),
    getDuplicates: (id) => api.get(`/api/support/tickets/${id}/duplicates`),
    mergeTicket: (primaryId, duplicateTicketId) => api.post(`/api/support/tickets/${primaryId}/merge`, { duplicateTicketId }),
    assign: (id) => api.put(`/api/support/tickets/${id}/assign`, {}),
    updateTicketStatus: (id, status) => api.put(`/api/support/tickets/${id}/status`, { status }),
    respond: (id, message, internalNote) => api.post(`/api/support/tickets/${id}/response`, { message, internalNote }),
    takeover: (id) => api.post(`/api/support/tickets/${id}/takeover`, {}),
    transferToSales: (id, note) => api.post(`/api/support/tickets/${id}/transfer-to-sales`, { note }),
    agents: () => api.get('/api/support/agents'),
    transferToAgent: (id, agentId, note) => api.post(`/api/support/tickets/${id}/transfer-to-agent`, { agentId, note }),
    copilotSummarize: (id) => api.post(`/api/support/tickets/${id}/copilot/summarize`, {}),
    copilotSuggestReply: (id) => api.post(`/api/support/tickets/${id}/copilot/suggest-reply`, {}),
    copilotAnalyze: (id) => api.post(`/api/support/tickets/${id}/copilot/analyze`, {}),
};

export const salesApi = {
    overview: () => api.get('/api/sales/dashboard/overview'),
    bonuses: () => api.get('/api/sales/dashboard/bonuses'),
    stats: () => api.get('/api/sales/dashboard/stats'),
    customers: () => api.get('/api/sales/customers'),
    customersReport: (format = 'csv') => downloadFile(
        `/api/sales/customers/report?format=${encodeURIComponent(format)}`,
        `customers-${new Date().toISOString().slice(0, 10)}.${format}`
    ),
    createCustomer: (body) => api.post('/api/sales/customers', body),
    leads: () => api.get('/api/sales/leads'),
    createLead: (body) => api.post('/api/sales/leads', body),
    updateLead: (id, body) => api.put(`/api/sales/leads/${id}`, body),
    sendLeadEmail: (id, body) => api.post(`/api/sales/leads/${id}/email`, body),
    quotes: () => api.get('/api/sales/quotes'),
    conversations: () => api.get('/api/sales/conversations'),
    conversationQueue: () => api.get('/api/sales/conversations/queue'),
    acceptConversation: (id) => api.post(`/api/sales/conversations/${id}/accept`, {}),
    getConversation: (id) => api.get(`/api/sales/conversations/${id}`),
    sendMessage: (id, message) => api.post(`/api/sales/conversations/${id}/messages`, { message }),
    sendInvoice: (id, body) => api.post(`/api/sales/conversations/${id}/invoice`, body),
    forwardConversation: (id, reason) => api.post(`/api/sales/conversations/${id}/forward`, { reason }),
    dealsComparison: () => api.get('/api/sales/dashboard/deals-comparison'),
    playbookCategories: () => api.get('/api/sales/playbook/categories'),
    playbookList: (category, q) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (q) params.set('q', q);
        const qs = params.toString();
        return api.get(`/api/sales/playbook${qs ? `?${qs}` : ''}`);
    },
    playbookGet: (id) => api.get(`/api/sales/playbook/${id}`),
    playbookManageList: () => api.get('/api/sales/playbook/manage'),
    playbookCreate: (body) => api.post('/api/sales/playbook', body),
    playbookUpdate: (id, body) => api.put(`/api/sales/playbook/${id}`, body),
    playbookDelete: (id) => api.delete(`/api/sales/playbook/${id}`),
};

export const feedbackApi = {
    overview: () => api.get('/api/feedback/overview'),
    listAdmin: () => api.get('/api/admin/feedback'),
    listSupervisor: () => api.get('/api/supervisor/feedback'),
    getPurchaseSurvey: (token) => api.get(`/api/feedback/purchase-survey/${token}`),
    submitPurchaseSurvey: (token, body) => api.post(`/api/feedback/purchase-survey/${token}`, body),
};

export const supervisorApi = {
    overview: (team = 'all') => api.get(`/api/supervisor/dashboard/overview?team=${team}`),
    feedback: () => api.get('/api/supervisor/feedback'),
    tickets: () => api.get('/api/supervisor/tickets'),
    leads: () => api.get('/api/supervisor/leads'),
    createLead: (body) => api.post('/api/supervisor/leads', body),
    assignLead: (leadId, body) => api.post(`/api/supervisor/leads/${leadId}/assign`, body),
    previewLeadAssignment: (leadId) => api.get(`/api/supervisor/leads/${leadId}/assign/preview`),
    salesAgents: () => api.get('/api/supervisor/sales-agents'),
    performance: () => api.get('/api/supervisor/agents/performance'),
    approvals: () => api.get('/api/supervisor/approvals'),
    reviewApproval: (id, approve, note) => api.post(`/api/supervisor/approvals/${id}/review`, { approve, note }),
    approve: (id) => api.post(`/api/supervisor/approvals/${id}/approve`, {}),
    reject: (id) => api.post(`/api/supervisor/approvals/${id}/reject`, {}),
    broadcast: (message, audience = 'all') => api.post('/api/supervisor/announcements', { message, audience }),
};

export const analyticsApi = {
    overview: () => api.get('/api/analytics/overview'),
    performance: () => api.get('/api/analytics/performance'),
};

export const calendarApi = {
    events: (month) => api.get(`/api/calendar/events${month ? `?month=${month}` : ''}`),
    createEvent: (body) => api.post('/api/calendar/events', body),
    updateEvent: (id, body) => api.put(`/api/calendar/events/${id}`, body),
    deleteEvent: (id) => api.delete(`/api/calendar/events/${id}`),
    staff: () => api.get('/api/calendar/staff'),
};

export const leaveApi = {
    eligibility: () => api.get('/api/leave/eligibility'),
    all: () => api.get('/api/leave/all'),
    myRequests: () => api.get('/api/leave/requests'),
    pending: () => api.get('/api/leave/pending'),
    request: (body) => api.post('/api/leave/requests', body),
    approve: (id, note) => api.post(`/api/leave/requests/${id}/approve`, { note }),
    reject: (id, note) => api.post(`/api/leave/requests/${id}/reject`, { note }),
    cancel: (id) => api.post(`/api/leave/requests/${id}/cancel`, {}),
};

export const referralApi = {
    mine: () => api.get('/api/referrals/me'),
};

export const paymentApi = {
    initPaystack: (body) => api.post('/api/payments/paystack/initialize', body),
    initFlutterwave: (body) => api.post('/api/payments/flutterwave/initialize', body),
    verifyPaystack: (reference) => api.get(`/api/payments/paystack/verify/${reference}`),
    verifyFlutterwave: (reference) => api.get(`/api/payments/flutterwave/verify/${reference}`),
    completeLocalPayment: (reference) => api.post(`/api/payments/complete-local/${reference}`, {}),
    transactions: () => api.get('/api/payments/transactions'),
};

export const authApi = {
    logout: (sessionId) => api.post('/api/auth/logout', sessionId ? { sessionId } : {}),
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
    changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }),
    completeProfile: (body) => api.post('/api/auth/complete-profile', body),
    verifyMfaLogin: (challengeToken, code) => api.post('/api/auth/mfa/login/verify', { challengeToken, code }),
    resendMfaLogin: (challengeToken) => api.post('/api/auth/mfa/login/resend', { challengeToken }),
};

export const userApi = {
    getProfile: () => api.get('/api/users/me'),
    updateProfile: (body) => api.patch('/api/users/me', body),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadRequest('/api/users/me/avatar', formData);
    },
    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadRequest('/api/users/me/logo', formData);
    },
    listUsers: () => api.get('/api/users'),
    updateUserStatus: (userId, active) => api.patch(`/api/users/${userId}/status`, { active }),
    disableMfa: (payload) => api.post('/api/users/me/mfa/disable', payload),
    prepareDisableMfa: () => api.post('/api/users/me/mfa/disable/prepare', {}),
};

export const dashboardApi = {
    getStats: () => api.get('/api/dashboard/stats'),
};

export const contentApi = {
    hotDeals: () => api.get('/api/content/hot-deals'),
    allHotDeals: () => api.get('/api/content/hot-deals/all'),
    createHotDeal: (fields, imageFile) => uploadRequest('/api/content/hot-deals', buildProductFormData(fields, imageFile)),
    updateHotDeal: (id, fields, imageFile) => uploadRequest(`/api/content/hot-deals/${id}`, buildProductFormData(fields, imageFile), 'PUT'),
    deleteHotDeal: (id) => api.delete(`/api/content/hot-deals/${id}`),
    motivational: (role) => api.get(`/api/content/motivational${role ? `?role=${encodeURIComponent(role)}` : ''}`, { cacheMs: 600_000 }),
    allMotivational: () => api.get('/api/content/motivational/all'),
    createMotivational: (body) => api.post('/api/content/motivational', body),
};

async function uploadRequest(path, formData, method = 'POST') {
    const session = getSession();
    const headers = {};
    if (session.userId) headers['X-User-Id'] = session.userId;
    if (session.token) headers.Authorization = `Bearer ${session.token}`;

    const response = await fetch(`${API_ROOT}${path}`, {
        method,
        headers,
        body: formData,
    });

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { error: text || 'Request failed' };
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Request failed');
    }

    return data;
}

function buildProductFormData(fields, imageFile) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });
    if (imageFile) {
        formData.append('image', imageFile);
    }
    return formData;
}

export const productApi = {
    list: () => api.get('/api/products', { cacheMs: 300_000 }),
    adminList: () => api.get('/api/admin/products'),
    create: (fields, imageFile) => uploadRequest('/api/admin/products', buildProductFormData(fields, imageFile)),
    update: (id, fields, imageFile) => uploadRequest(`/api/admin/products/${id}`, buildProductFormData(fields, imageFile), 'PUT'),
    delete: (id) => api.delete(`/api/admin/products/${id}`),
};
