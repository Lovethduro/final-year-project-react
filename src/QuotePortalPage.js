import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quoteApi } from './utils/apiClient';
import { theme, cardStyle } from './styles/theme';
import {
    ChatMessageRow,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelBody,
    ChatPanelFooter,
    AgentChatHeader,
} from './components/ChatMessage';

export default function QuotePortalPage() {
    const { token } = useParams();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const load = async () => {
        if (!token) return;
        setError('');
        try {
            const data = await quoteApi.getPortal(token);
            setConversation(data.conversation);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
            setConversation(null);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [token]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!text.trim() || !token) return;
        setSending(true);
        setError('');
        try {
            await quoteApi.sendPortalMessage(token, text.trim());
            setText('');
            await load();
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
    };

    const closed = conversation?.status === 'closed';

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '32px 16px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Link to="/" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>CyForce Technologies</Link>
                    <h1 style={{ fontFamily: theme.fontHeading, color: theme.text, fontSize: 24, margin: '12px 0 6px' }}>
                        Your Quote Conversation
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>
                        Message your sales agent here — no account or phone call required.
                    </p>
                </div>

                {error && (
                    <p style={{ color: theme.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</p>
                )}

                {loading && !error && (
                    <p style={{ color: theme.textDim, textAlign: 'center' }}>Loading your conversation…</p>
                )}

                {conversation && (
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <ChatPanel style={{ minHeight: 480, border: 'none', borderRadius: 0 }}>
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
                                    <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', marginTop: 40 }}>
                                        Your agent will reply here. You can also send a message below.
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
                                <div style={{ padding: 16, borderTop: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
                                    This conversation is closed. Email sales if you need further help.
                                </div>
                            )}
                        </ChatPanel>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: theme.textDim }}>
                    Already have an account? <Link to="/login" style={{ color: theme.accent }}>Sign in</Link> to access billing and more.
                </p>
            </div>
        </div>
    );
}
