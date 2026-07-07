export function parseChatDate(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function formatChatDateTime(value) {
    const d = parseChatDate(value);
    if (!d) return '';
    return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatChatExpiry(value) {
    const d = parseChatDate(value);
    if (!d) return null;
    if (d.getTime() <= Date.now()) return 'Expired';
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function isChatExpired(value) {
    const d = parseChatDate(value);
    return d ? d.getTime() <= Date.now() : false;
}
