import { useEffect, useState } from 'react';
import { contentApi, getSession } from '../utils/apiClient';
import { sanitizeDisplayMessage } from '../utils/sensitiveContent';
import { theme } from '../styles/theme';

const messageCache = new Map();

export function MotivationalBanner({ role }) {
    const [message, setMessage] = useState(() => sanitizeDisplayMessage(messageCache.get(role) || '', { placeholder: '' }));
    const session = getSession();

    useEffect(() => {
        if (session.showMotivationalMessages === false) {
            setMessage('');
            return;
        }

        const apply = (raw) => {
            const next = sanitizeDisplayMessage(raw || '', { placeholder: '' });
            messageCache.set(role, next);
            setMessage(next);
        };

        if (messageCache.has(role)) {
            setMessage(sanitizeDisplayMessage(messageCache.get(role)));
            return;
        }

        contentApi.motivational(role)
            .then((data) => {
                if (data?.enabled === false) {
                    apply('');
                    return;
                }
                apply(data?.message || '');
            })
            .catch(() => apply(''));
    }, [role, session.showMotivationalMessages]);

    if (!message) return null;

    return (
        <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 6,
            background: 'rgba(0,45,114,0.08)',
            border: `1px solid ${theme.border}`,
            borderLeft: `3px solid ${theme.primary}`,
        }}>
            <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{message}</p>
        </div>
    );
}
