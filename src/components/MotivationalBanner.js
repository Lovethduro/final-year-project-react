import { useEffect, useState } from 'react';
import { contentApi, getSession } from '../utils/apiClient';
import { theme } from '../styles/theme';

const messageCache = new Map();

export function MotivationalBanner({ role }) {
    const [message, setMessage] = useState(() => messageCache.get(role) || '');
    const session = getSession();

    useEffect(() => {
        if (session.showMotivationalMessages === false) {
            setMessage('');
            return;
        }
        if (messageCache.has(role)) {
            setMessage(messageCache.get(role));
            return;
        }
        contentApi.motivational(role)
            .then((data) => {
                if (data?.enabled === false) {
                    messageCache.set(role, '');
                    setMessage('');
                    return;
                }
                const next = data?.message || '';
                messageCache.set(role, next);
                setMessage(next);
            })
            .catch(() => {
                messageCache.set(role, '');
                setMessage('');
            });
    }, [role, session.showMotivationalMessages]);

    if (!message) return null;

    return (
        <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 6,
            background: 'rgba(43,92,230,0.08)',
            border: `1px solid ${theme.border}`,
            borderLeft: `3px solid ${theme.primary}`,
        }}>
            <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{message}</p>
        </div>
    );
}
