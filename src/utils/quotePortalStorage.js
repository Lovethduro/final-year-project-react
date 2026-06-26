const STORAGE_KEY = 'cyforce_quote_portal';

export function saveQuotePortalSession({ token, agentName, subject }) {
    if (!token) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            token,
            agentName: agentName || '',
            subject: subject || '',
            savedAt: Date.now(),
        }));
    } catch {
        // ignore quota / private mode
    }
}

export function getQuotePortalSession() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.token ? parsed : null;
    } catch {
        return null;
    }
}

export function clearQuotePortalSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}
