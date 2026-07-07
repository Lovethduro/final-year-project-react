import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicSupportApi, assetUrl } from './utils/apiClient';
import { theme, cardStyle } from './styles/theme';
import {
    ChatMessageRow,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelBody,
    ChatPanelFooter,
    AgentChatHeader,
} from './components/ChatMessage';

export default function SupportPortalPage() {
    const { token } = useParams();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const load = useCallback(async () => {
        if (!token) return;
        setError('');
        try {
            const data = await publicSupportApi.getPortal(token);
            setTicket(data.ticket);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
            setTicket(null);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!text.trim() || !token) return;
        setSending(true);
        setError('');
        try {
            await publicSupportApi.replyToPortal(token, text.trim());
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

    const closed = ticket?.status === 'closed' || ticket?.status === 'resolved';

    return (
    <>
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '32px 16px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Link to="/" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>CyForce Technologies</Link>
                    <h1 style={{ fontFamily: theme.fontHeading, color: theme.text, fontSize: 24, margin: '12px 0 6px' }}>
                        Your Support Ticket
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>
                        Track your request and reply to our support team — no account required.
                    </p>
                </div>

                {error && (
                    <p style={{ color: theme.error, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</p>
                )}

                {loading && !error && (
                    <p style={{ color: theme.textDim, textAlign: 'center' }}>Loading your ticket…</p>
                )}

                {ticket && (
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.border}` }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 6 }}>{ticket.subject}</div>
                            <div style={{ fontSize: 13, color: theme.textMuted }}>
                                Status: {ticket.status} · Priority: {ticket.priority} · {ticket.category}
                            </div>
                            <p style={{ fontSize: 14, color: theme.text, margin: '12px 0 0' }}>{ticket.description}</p>
                            {ticket.attachmentUrl && (
                                <img src={assetUrl(ticket.attachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 12 }} />
                            )}
                        </div>

                        <ChatPanel style={{ minHeight: 360, border: 'none', borderRadius: 0 }}>
                            <ChatPanelHeader>
                                {ticket.assigneeName ? (
                                    <AgentChatHeader
                                        name={ticket.assigneeName}
                                        imageUrl={null}
                                        roleLabel="Support Agent"
                                    />
                                ) : (
                                    <div style={{ fontSize: 13, color: theme.textMuted }}>Awaiting support agent assignment</div>
                                )}
                            </ChatPanelHeader>
                            <ChatPanelBody>
                                {messages.length ? messages.map((m) => {
                                    const mine = !m.authorId;
                                    return (
                                        <div key={m.id} style={{ marginBottom: 4 }}>
                                            <ChatMessageRow
                                                message={{ ...m, messageType: 'text' }}
                                                isMine={mine}
                                                showAvatar={!mine}
                                            />
                                        </div>
                                    );
                                }) : (
                                    <p style={{ color: theme.textDim, fontSize: 13 }}>No messages yet. Our team will respond soon.</p>
                                )}
                                <div ref={bottomRef} />
                            </ChatPanelBody>
                            {!closed && (
                                <ChatPanelFooter>
                                    <form onSubmit={send} style={{ display: 'flex', gap: 10, width: '100%' }}>
                                        <input
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Write a reply..."
                                            style={inputStyle}
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !text.trim()}
                                            style={{
                                                background: theme.primary,
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                fontFamily: theme.fontBody,
                                            }}
                                        >
                                            {sending ? 'Sending…' : 'Send'}
                                        </button>
                                    </form>
                                </ChatPanelFooter>
                            )}
                        </ChatPanel>
                    </div>
                )}
            </div>
        </div>
    </>
    );
}