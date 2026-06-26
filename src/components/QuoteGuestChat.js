import { useCallback, useEffect, useRef, useState } from 'react';
import { quoteApi } from '../utils/apiClient';
import { saveQuotePortalSession, clearQuotePortalSession } from '../utils/quotePortalStorage';
import { theme, cardStyle } from '../styles/theme';
import {
    ChatMessageRow,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelBody,
    ChatPanelFooter,
    AgentChatHeader,
} from './ChatMessage';

const POLL_MS = 12000;

export function QuoteGuestChat({ token, compact = false, onInvalidToken }) {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const load = useCallback(async (silent = false) => {
        if (!token) return;
        if (!silent) setError('');
        try {
            const data = await quoteApi.getPortal(token);
            setConversation(data.conversation);
            setMessages(data.messages || []);
            saveQuotePortalSession({
                token,
                agentName: data.conversation?.salesAgentName,
                subject: data.conversation?.subject,
            });
        } catch (err) {
            if (!silent) {
                setError(err.message);
                setConversation(null);
                setMessages([]);
            }
            if (err.message?.toLowerCase().includes('invalid')
                || err.message?.toLowerCase().includes('expired')) {
                clearQuotePortalSession();
                onInvalidToken?.();
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [token, onInvalidToken]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') load(true);
        }, POLL_MS);
        return () => clearInterval(id);
    }, [load]);

    const send = async (e) => {
        e.preventDefault();
        if (!text.trim() || !token) return;
        setSending(true);
        setError('');
        try {
            await quoteApi.sendPortalMessage(token, text.trim());
            setText('');
            await load(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const inputStyle = {
        flex: 1,
        background: 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${theme.border}`,
        borderRadius: 8,
        padding: '10px 12px',
        color: theme.text,
        fontFamily: theme.fontBody,
        fontSize: 14,
    };

    const closed = conversation?.status === 'closed';
    const minHeight = compact ? 320 : 400;

    if (loading && !conversation && !error) {
        return (
            <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Loading your conversation…
            </p>
        );
    }

    if (!conversation && error) {
        return <p style={{ color: theme.error, fontSize: 13, textAlign: 'center' }}>{error}</p>;
    }

    if (!conversation) return null;

    return (
        <div style={compact ? undefined : { ...cardStyle, padding: 0, overflow: 'hidden' }}>
            {error && (
                <p style={{ color: theme.error, fontSize: 12, padding: compact ? '0 0 8px' : '12px 16px 0', margin: 0 }}>
                    {error}
                </p>
            )}
            <ChatPanel style={{ minHeight, border: compact ? `1px solid ${theme.border}` : 'none', borderRadius: compact ? 10 : 0 }}>
                <ChatPanelHeader>
                    <AgentChatHeader
                        name={conversation.salesAgentName || 'Sales team'}
                        imageUrl={null}
                        roleLabel="Your sales agent"
                        meta={conversation.subject}
                    />
                </ChatPanelHeader>

                <ChatPanelBody bottomRef={bottomRef}>
                    {messages.length === 0 ? (
                        <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', marginTop: 32 }}>
                            Your agent will reply here. Send a message below anytime.
                        </p>
                    ) : messages.map((m) => {
                        const mine = m.authorRole === 'GUEST';
                        return (
                            <ChatMessageRow
                                key={m.id}
                                message={m}
                                isMine={mine}
                                showAvatar={!mine}
                            />
                        );
                    })}
                </ChatPanelBody>

                {!closed ? (
                    <ChatPanelFooter>
                        <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your message…"
                                style={inputStyle}
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !text.trim()}
                                style={{
                                    flexShrink: 0,
                                    padding: '10px 18px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: theme.primary,
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: sending || !text.trim() ? 0.6 : 1,
                                }}
                            >
                                {sending ? 'Sending…' : 'Send'}
                            </button>
                        </form>
                    </ChatPanelFooter>
                ) : (
                    <div style={{
                        padding: 16,
                        borderTop: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                        fontSize: 13,
                        textAlign: 'center',
                    }}
                    >
                        This conversation is closed. Email sales if you need further help.
                    </div>
                )}
            </ChatPanel>
        </div>
    );
}
