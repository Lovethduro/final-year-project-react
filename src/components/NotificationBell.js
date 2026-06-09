import { useEffect, useState, useRef } from 'react';
import { notificationApi } from '../utils/apiClient';
import { theme } from '../styles/theme';

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const panelRef = useRef(null);

    const load = () => {
        notificationApi.list()
            .then(setNotifications)
            .catch(() => setNotifications([]));
        notificationApi.unreadCount()
            .then((r) => setUnread(r.count || 0))
            .catch(() => setUnread(0));
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000);
        const onRefresh = () => load();
        window.addEventListener('cyforce:notifications-refresh', onRefresh);
        return () => {
            clearInterval(interval);
            window.removeEventListener('cyforce:notifications-refresh', onRefresh);
        };
    }, []);
    useEffect(() => {
        const onClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    const markRead = async (id) => {
        await notificationApi.markRead(id);
        load();
    };

    const markAllRead = async () => {
        await notificationApi.markAllRead();
        load();
    };

    const remove = async (id) => {
        await notificationApi.delete(id);
        load();
    };

    const typeColor = (type) => {
        if (type === 'critical' || type === 'error') return theme.error;
        if (type === 'warning') return theme.warning;
        return theme.accent;
    };

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', background: 'rgba(255,255,255,0.05)',
                    border: `0.5px solid ${theme.border}`, borderRadius: 10,
                    padding: '8px 12px', cursor: 'pointer', color: theme.text, fontSize: 18,
                }}
            >
                🔔
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, background: theme.error,
                        color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10,
                        padding: '2px 6px', minWidth: 18, textAlign: 'center',
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360,
                    maxHeight: 420, overflowY: 'auto', background: theme.bgCard,
                    border: `0.5px solid ${theme.border}`, borderRadius: 14,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 500,
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', borderBottom: `0.5px solid ${theme.border}`,
                    }}>
                        <span style={{ fontWeight: 600, color: theme.text }}>Notifications</span>
                        {unread > 0 && (
                            <button type="button" onClick={markAllRead} style={{
                                background: 'none', border: 'none', color: theme.accent,
                                fontSize: 12, cursor: 'pointer',
                            }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p style={{ padding: 20, color: theme.textMuted, fontSize: 13 }}>No notifications</p>
                    ) : notifications.map((n) => (
                        <div key={n.id} style={{
                            padding: '12px 16px', borderBottom: `0.5px solid ${theme.border}`,
                            background: n.read ? 'transparent' : 'rgba(43,92,230,0.08)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: typeColor(n.type), marginBottom: 4 }}>
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4 }}>{n.message}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {!n.read && (
                                        <button type="button" onClick={() => markRead(n.id)} title="Mark read" style={{
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                                        }}>✓</button>
                                    )}
                                    <button type="button" onClick={() => remove(n.id)} title="Delete" style={{
                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: theme.error,
                                    }}>✕</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
