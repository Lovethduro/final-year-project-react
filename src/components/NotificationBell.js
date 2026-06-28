import { useEffect, useState, useRef } from 'react';
import { notificationApi } from '../utils/apiClient';
import { PurchaseSurveyForm } from './PurchaseSurveyForm';
import { theme } from '../styles/theme';

function BellIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [expandedSurveyId, setExpandedSurveyId] = useState(null);
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

    const removeAll = async () => {
        if (!notifications.length) return;
        await notificationApi.deleteAll();
        setExpandedSurveyId(null);
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
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    color: theme.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <BellIcon />
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
                    border: `1px solid ${theme.border}`, borderRadius: 8,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 500,
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', borderBottom: `1px solid ${theme.border}`,
                    }}>
                        <span style={{ fontWeight: 600, color: theme.text }}>Notifications</span>
                        {notifications.length > 0 && (
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                {unread > 0 && (
                                    <button type="button" onClick={markAllRead} style={{
                                        background: 'none', border: 'none', color: theme.accent,
                                        fontSize: 12, cursor: 'pointer',
                                    }}>
                                        Mark all read
                                    </button>
                                )}
                                <button type="button" onClick={removeAll} style={{
                                    background: 'none', border: 'none', color: theme.error,
                                    fontSize: 12, cursor: 'pointer',
                                }}>
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p style={{ padding: 20, color: theme.textMuted, fontSize: 13 }}>No notifications</p>
                    ) : notifications.map((n) => (
                        <div key={n.id} style={{
                            padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
                            background: n.read ? 'transparent' : 'rgba(43,92,230,0.08)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: typeColor(n.type), marginBottom: 4 }}>
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4 }}>{n.message}</div>
                                    {n.surveyToken && (
                                        <div style={{ marginTop: 10 }}>
                                            {expandedSurveyId === n.id ? (
                                                <PurchaseSurveyForm
                                                    token={n.surveyToken}
                                                    compact
                                                    onComplete={() => {
                                                        setExpandedSurveyId(null);
                                                        markRead(n.id);
                                                        load();
                                                    }}
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setExpandedSurveyId(n.id);
                                                        if (!n.read) markRead(n.id);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: `1px solid ${theme.border}`,
                                                        borderRadius: 6,
                                                        color: theme.accent,
                                                        fontSize: 12,
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                        fontFamily: theme.fontBody,
                                                    }}
                                                >
                                                    Rate your purchase
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {!n.read && (
                                        <button type="button" onClick={() => markRead(n.id)} title="Mark read" style={{
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
                                            color: theme.accent, fontFamily: theme.fontBody,
                                        }}>
                                            Read
                                        </button>
                                    )}
                                    <button type="button" onClick={() => remove(n.id)} title="Delete" style={{
                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
                                        color: theme.error, fontFamily: theme.fontBody,
                                    }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
