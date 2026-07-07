import { useEffect, useState, useRef } from 'react';
import { PageHeader, Card, PrimaryButton, Alert } from '../components/ui';
import { customerApi, paymentApi, getSession } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle as themeInputStyle } from '../styles/theme';
import { refreshNotifications } from '../utils/notifications';
import { completePaymentIfNeeded, isSimulatedPayment } from '../utils/paymentUtils';
import {
    AgentChatHeader,
    ChatMessageRow,
    ChatExpiryNotice,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelBody,
    ChatPanelFooter,
    ChatInboxList,
    ChatInboxItem,
    isChatExpired,
    formatChatExpiry,
} from '../components/ChatMessage';
import { StarRatingInput } from '../components/StarRatingInput';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function CustomerMessagesPage() {
    const auth = useAuth();
    const session = getSession();
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(null);
    const [rating, setRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const bottomRef = useRef(null);
    const provider = session.preferredPaymentMethod || 'paystack';

    const loadConversations = () => {
        customerApi.conversations().then(setConversations).catch((err) => setError(err.message));
    };

    useEffect(() => { loadConversations(); }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openConversation = async (id) => {
        setError('');
        setRating(0);
        setRatingComment('');
        try {
            const data = await customerApi.getConversation(id);
            setActive(data.conversation);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const submitRating = async (e) => {
        e.preventDefault();
        if (!active || rating < 1) return;
        setRatingSubmitting(true);
        setError('');
        try {
            await customerApi.rateConversation(active.id, rating, ratingComment.trim());
            setRating(0);
            setRatingComment('');
            openConversation(active.id);
            loadConversations();
        } catch (err) {
            setError(err.message);
        } finally {
            setRatingSubmitting(false);
        }
    };

    const startChat = async (e) => {
        e.preventDefault();
        if (!firstMessage.trim()) return;
        try {
            const conv = await customerApi.startConversation(subject || 'Product inquiry', firstMessage.trim());
            setShowNew(false);
            setSubject('');
            setFirstMessage('');
            loadConversations();
            openConversation(conv.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const send = async (e) => {
        e.preventDefault();
        if (!active || !text.trim()) return;
        try {
            await customerApi.sendMessage(active.id, text.trim());
            setText('');
            openConversation(active.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const payInvoice = async (invoice) => {
        if (!invoice || invoice.status === 'paid') return;
        setPaying(invoice.id);
        setError('');
        try {
            const init = provider === 'paystack'
                ? await paymentApi.initPaystack({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id })
                : await paymentApi.initFlutterwave({ amount: invoice.amount, description: invoice.description, invoiceId: invoice.id });

            if (isSimulatedPayment(init)) {
                setError(
                    provider === 'flutterwave'
                        ? 'Flutterwave is not configured on the server. Add FLUTTERWAVE_SECRET_KEY to application-local.properties and restart the backend.'
                        : 'Paystack is not configured on the server. Add PAYSTACK_SECRET_KEY to application-local.properties and restart the backend.'
                );
                return;
            }
            if (init.authorizationUrl) {
                window.location.href = init.authorizationUrl;
                return;
            }
            if (await completePaymentIfNeeded(init, paymentApi)) {
                openConversation(active.id);
                loadConversations();
                refreshNotifications();
                return;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setPaying(null);
        }
    };

    const fieldStyle = { ...themeInputStyle, marginBottom: 0 };
    const chatExpired = active?.expiresAt && isChatExpired(active.expiresAt);
    const canSend = active && !chatExpired && active.status !== 'closed' && active.status !== 'pending_rating';

    return (
        <>
                    <PageHeader
                title="Message Sales Team"
                subtitle="Discuss pricing with a sales agent. When you agree on a price, they will send an invoice you can pay here."
                action={<PrimaryButton onClick={() => setShowNew(true)}>New Message</PrimaryButton>}
            />
            {error && <Alert type="error">{error}</Alert>}

            {showNew && (
                <Card title="Start a conversation" style={{ marginBottom: 16 }}>
                    <form onSubmit={startChat}>
                        <input style={{ ...themeInputStyle, marginBottom: 12 }} placeholder="Subject (e.g. Solar package pricing)" value={subject} onChange={(e) => setSubject(e.target.value)} />
                        <textarea style={{ ...themeInputStyle, minHeight: 80, marginBottom: 12 }} placeholder="Tell us what you need and your budget if you have one..." value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} required />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton type="submit">Send Message</PrimaryButton>
                            <button type="button" onClick={() => setShowNew(false)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontFamily: theme.fontBody, fontSize: 13 }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 16, alignItems: 'stretch' }}>
                <Card title="Conversations" style={{ marginBottom: 0 }}>
                    <ChatInboxList>
                        {conversations.length ? conversations.map((c) => (
                            <ChatInboxItem
                                key={c.id}
                                active={active?.id === c.id}
                                onClick={() => openConversation(c.id)}
                                title={c.subject}
                                subtitle={`${c.salesAgentName || 'Awaiting agent'} · ${c.status === 'pending_rating' ? 'rate experience' : c.status}${c.expiresAt ? ` · expires ${formatChatExpiry(c.expiresAt)}` : ''}`}
                            />
                        )) : <p style={{ color: theme.textDim, fontSize: 13, padding: '8px 14px' }}>No conversations yet.</p>}
                    </ChatInboxList>
                </Card>

                <ChatPanel>
                    {active ? (
                        <>
                            <ChatPanelHeader>
                                <AgentChatHeader
                                    name={active.salesAgentName}
                                    imageUrl={active.salesAgentAvatarUrl}
                                    roleLabel="Sales Agent"
                                    averageRating={active.salesAgentAverageRating}
                                    ratingCount={active.salesAgentRatingCount}
                                    meta={active.subject}
                                    expiresAt={active.expiresAt}
                                />
                            </ChatPanelHeader>

                            {active.expiresAt && (
                                <div style={{ padding: '0 20px 12px' }}>
                                    <ChatExpiryNotice expiresAt={active.expiresAt} />
                                </div>
                            )}

                            <ChatPanelBody bottomRef={bottomRef}>
                                {messages.length === 0 ? (
                                    <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', marginTop: 40 }}>No messages yet.</p>
                                ) : messages.map((m) => {
                                    const mine = m.authorId === auth.userId;
                                    const isInvoice = m.messageType === 'invoice';
                                    if (m.messageType === 'system') {
                                        return <ChatMessageRow key={m.id} message={m} isMine={mine} />;
                                    }
                                    return (
                                        <div key={m.id}>
                                            <ChatMessageRow message={m} isMine={mine} showAvatar={!mine} />
                                            {isInvoice && m.invoice && (
                                                <div style={{ margin: '-8px 0 14px 42px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: 13, color: theme.accent, fontWeight: 600 }}>
                                                        {formatNaira(m.invoice.amount)}
                                                    </span>
                                                    {m.invoice.status === 'paid' ? (
                                                        <span style={{ fontSize: 12, color: theme.success }}>Paid</span>
                                                    ) : (
                                                        <PrimaryButton onClick={() => payInvoice(m.invoice)} disabled={paying === m.invoice.id} style={{ fontSize: 12, padding: '6px 12px' }}>
                                                            {paying === m.invoice.id ? 'Processing…' : 'Pay Invoice'}
                                                        </PrimaryButton>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </ChatPanelBody>

                            {active.status === 'pending_rating' && (
                                <ChatPanelFooter>
                                    <form onSubmit={submitRating}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Rate your experience</div>
                                        <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
                                            This conversation was closed. Please rate {active.salesAgentName || 'our sales team'}.
                                        </p>
                                        <StarRatingInput value={rating} onChange={setRating} />
                                        <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Optional comment…" style={{ ...themeInputStyle, minHeight: 60, marginTop: 8, marginBottom: 12 }} />
                                        <PrimaryButton type="submit" disabled={ratingSubmitting || rating < 1}>
                                            {ratingSubmitting ? 'Submitting…' : 'Submit Rating'}
                                        </PrimaryButton>
                                    </form>
                                </ChatPanelFooter>
                            )}

                            {canSend && (
                                <ChatPanelFooter>
                                    <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." style={{ ...fieldStyle, flex: 1 }} />
                                        <PrimaryButton type="submit">Send</PrimaryButton>
                                    </form>
                                </ChatPanelFooter>
                            )}

                            {active.status === 'closed' && active.customerRating && (
                                <ChatPanelFooter>
                                    <p style={{ fontSize: 13, color: theme.textDim, margin: 0 }}>
                                        You rated this conversation {active.customerRating}/5. Thank you!
                                    </p>
                                </ChatPanelFooter>
                            )}
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                            <p style={{ color: theme.textDim, fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
                                Select a conversation or start a new message to negotiate with our sales team.
                            </p>
                        </div>
                    )}
                </ChatPanel>
            </div>
        </>
    );
}