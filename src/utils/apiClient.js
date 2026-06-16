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
        mfaEnabled: storage.getItem('mfaEnabled') === 'true',
        emailVerified: storage.getItem('emailVerified') === 'true',
        avatarUrl: storage.getItem('userAvatarUrl'),
        preferredPaymentMethod: storage.getItem('userPaymentMethod'),
        memberSince: storage.getItem('userMemberSince'),
        rememberMe: isSessionPersistent(),
        mustChangePassword: storage.getItem('mustChangePassword') === 'true',
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

async function request(path, options = {}) {
    const session = getSession();
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

    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};

export const notificationApi = {
    list: () => api.get('/api/notifications'),
    unreadCount: () => api.get('/api/notifications/unread-count'),
    markRead: (id) => api.patch(`/api/notifications/${id}/read`, {}),
    markAllRead: () => api.patch('/api/notifications/read-all', {}),
    delete: (id) => api.delete(`/api/notifications/${id}`),
};

export const quoteApi = {
    request: (body) => api.post('/api/quotes/request', body),
    getPortal: (token) => api.get(`/api/quotes/portal/${token}`),
    sendPortalMessage: (token, message) => api.post(`/api/quotes/portal/${token}/messages`, { message }),
};

export const adminApi = {
    overview: () => api.get('/api/admin/dashboard/stats'),
    feedback: () => api.get('/api/admin/feedback'),
    users: () => api.get('/api/admin/users'),
    createUser: (body) => api.post('/api/admin/users', body),
    updateUser: (id, body) => api.put(`/api/admin/users/${id}`, body),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    tickets: () => api.get('/api/admin/tickets'),
    leads: () => api.get('/api/admin/leads'),
    auditLogs: () => api.get('/api/admin/audit-logs'),
    sendAnnouncement: (message, audience = 'all') => api.post('/api/admin/announcements', { message, audience }),
};

export const customerApi = {
    stats: () => api.get('/api/customer/dashboard/stats'),
    tickets: () => api.get('/api/customer/tickets'),
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
    myTickets: () => api.get('/api/support/tickets'),
    allOpen: () => api.get('/api/support/tickets/all'),
    assign: (id) => api.put(`/api/support/tickets/${id}/assign`, {}),
    updateTicketStatus: (id, status) => api.put(`/api/support/tickets/${id}/status`, { status }),
    respond: (id, message, internalNote) => api.post(`/api/support/tickets/${id}/response`, { message, internalNote }),
    transferToSales: (id, note) => api.post(`/api/support/tickets/${id}/transfer-to-sales`, { note }),
};

export const salesApi = {
    overview: () => api.get('/api/sales/dashboard/overview'),
    bonuses: () => api.get('/api/sales/dashboard/bonuses'),
    stats: () => api.get('/api/sales/dashboard/stats'),
    customers: () => api.get('/api/sales/customers'),
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
    performance: () => api.get('/api/supervisor/agents/performance'),
    approve: (id) => api.post(`/api/supervisor/approvals/${id}/approve`, {}),
    reject: (id) => api.post(`/api/supervisor/approvals/${id}/reject`, {}),
};

export const paymentApi = {
    initPaystack: (body) => api.post('/api/payments/paystack/initialize', body),
    initFlutterwave: (body) => api.post('/api/payments/flutterwave/initialize', body),
    verifyPaystack: (reference) => api.get(`/api/payments/paystack/verify/${reference}`),
    verifyFlutterwave: (reference) => api.get(`/api/payments/flutterwave/verify/${reference}`),
    sandboxComplete: (reference) => api.post(`/api/payments/sandbox/complete/${reference}`, {}),
    transactions: () => api.get('/api/payments/transactions'),
};

export const authApi = {
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
    changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }),
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
    motivational: (role) => api.get(`/api/content/motivational${role ? `?role=${encodeURIComponent(role)}` : ''}`),
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
    list: () => api.get('/api/products'),
    adminList: () => api.get('/api/admin/products'),
    create: (fields, imageFile) => uploadRequest('/api/admin/products', buildProductFormData(fields, imageFile)),
    update: (id, fields, imageFile) => uploadRequest(`/api/admin/products/${id}`, buildProductFormData(fields, imageFile), 'PUT'),
    delete: (id) => api.delete(`/api/admin/products/${id}`),
};
