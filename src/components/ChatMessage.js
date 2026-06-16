import { assetUrl } from '../utils/apiClient';
import { theme } from '../styles/theme';
import { AgentStarBadge } from './StarRatingInput';

export function ChatAvatar({ name, imageUrl, size = 36 }) {
    const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
    const resolved = imageUrl ? assetUrl(imageUrl) : null;

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: Math.max(12, size * 0.4),
            fontWeight: 700,
        }}>
            {resolved ? (
                <img src={resolved} alt={name || 'Agent'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initial}
        </div>
    );
}

export function ChatMessageRow({ message, isMine, showAvatar = true }) {
    const isSystem = message.messageType === 'system';
    const isInvoice = message.messageType === 'invoice';
    const isEmail = message.messageType === 'email';

    if (isSystem) {
        return (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{
                    display: 'inline-block',
                    padding: '5px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    color: theme.textMuted,
                    background: 'rgba(255,255,255,0.04)',
                }}>
                    {message.message}
                </span>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 14,
            flexDirection: isMine ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
        }}>
            {showAvatar && !isMine && (
                <ChatAvatar name={message.authorName} imageUrl={message.authorAvatarUrl} size={32} />
            )}
            <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: isMine ? 'rgba(43,92,230,0.2)' : 'rgba(255,255,255,0.06)',
                border: isInvoice ? `1px solid rgba(52,211,153,0.3)` : isEmail ? `1px solid rgba(167,139,250,0.35)` : 'none',
            }}>
                {!isMine && (
                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4, fontWeight: 500 }}>
                        {message.authorName || 'Agent'}
                        {isEmail && <span style={{ marginLeft: 6, color: theme.accent }}>· Email</span>}
                    </div>
                )}
                <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.5 }}>{message.message}</div>
            </div>
        </div>
    );
}

export function AgentChatHeader({ name, imageUrl, roleLabel = 'Agent', averageRating, ratingCount, meta }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ChatAvatar name={name} imageUrl={imageUrl} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>
                        {name || `Awaiting ${roleLabel.toLowerCase()}`}
                    </span>
                    <AgentStarBadge rating={averageRating} count={ratingCount} />
                </div>
                <div style={{ fontSize: 12, color: theme.textDim, marginTop: 2 }}>
                    {meta || (name ? roleLabel : `A ${roleLabel.toLowerCase()} will join shortly`)}
                </div>
            </div>
        </div>
    );
}

export function ChatPanel({ children, style }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 520,
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            overflow: 'hidden',
            ...style,
        }}>
            {children}
        </div>
    );
}

export function ChatPanelHeader({ children }) {
    return (
        <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            flexShrink: 0,
        }}>
            {children}
        </div>
    );
}

export function ChatPanelToolbar({ children }) {
    if (!children) return null;
    return (
        <div style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${theme.border}`,
            flexShrink: 0,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
        }}>
            {children}
        </div>
    );
}

export function ChatPanelBody({ children, bottomRef }) {
    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            minHeight: 0,
        }}>
            {children}
            {bottomRef && <div ref={bottomRef} />}
        </div>
    );
}

export function ChatPanelFooter({ children }) {
    return (
        <div style={{
            padding: '14px 20px',
            borderTop: `1px solid ${theme.border}`,
            flexShrink: 0,
        }}>
            {children}
        </div>
    );
}

export function ChatInboxList({ children }) {
    return (
        <div style={{ margin: '0 -4px' }}>
            {children}
        </div>
    );
}

export function ChatInboxItem({ active, onClick, title, subtitle }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 14px',
                marginBottom: 2,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: active ? 'rgba(43,92,230,0.12)' : 'transparent',
                color: active ? theme.text : theme.textMuted,
                fontFamily: theme.fontBody,
                transition: 'background 0.15s ease',
            }}
        >
            <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? theme.text : theme.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>{subtitle}</div>}
        </button>
    );
}
