import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader, Card, PrimaryButton, Alert } from '../components/ui';
import { salesApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle as themeInputStyle } from '../styles/theme';
import {
    AgentChatHeader,
    ChatMessageRow,
    ChatExpiryNotice,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelToolbar,
    ChatPanelBody,
    ChatPanelFooter,
    ChatInboxList,
    ChatInboxItem,
    isChatExpired,
    formatChatExpiry,
} from '../components/ChatMessage';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function SalesMessagesPage() {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const deepLinkId = searchParams.get('conversation');
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceDescription, setInvoiceDescription] = useState('');
    const [forwardReason, setForwardReason] = useState('');
    const [showForwardForm, setShowForwardForm] = useState(false);
    const [inboxTab, setInboxTab] = useState('mine');
    const [queue, setQueue] = useState([]);
    const bottomRef = useRef(null);

    const load = () => {
        salesApi.conversations().then(setConversations).catch((err) => setError(err.message));
        if (auth.role === 'SALES_AGENT') {
            salesApi.conversationQueue().then(setQueue).catch(() => setQueue([]));
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        if (deepLinkId) {
            openConversation(deepLinkId);
        }
    }, [deepLinkId]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openConversation = async (id) => {
        setError('');
        setSuccess('');
        setShowInvoiceForm(false);
        setShowForwardForm(false);
        try {
            const data = await salesApi.getConversation(id);
            setActive(data.conversation);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const acceptConversation = async (id) => {
        setError('');
        try {
            await salesApi.acceptConversation(id);
            setSuccess('Conversation accepted. You can now reply to the customer.');
            setInboxTab('mine');
            load();
            openConversation(id);
        } catch (err) {
            setError(err.message);
        }
    };

    const send = async (e) => {
        e.preventDefault();
        if (!active || !text.trim()) return;
        try {
            await salesApi.sendMessage(active.id, text.trim());
            setText('');
            openConversation(active.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const sendInvoice = async (e) => {
        e.preventDefault();
        if (!active) return;
        const amount = Number(invoiceAmount);
        if (!amount || amount < 1) {
            setError('Enter a valid invoice amount in Naira.');
            return;
        }
        try {
            await salesApi.sendInvoice(active.id, {
                amount,
                description: invoiceDescription || active.subject,
            });
            setShowInvoiceForm(false);
            setInvoiceAmount('');
            setInvoiceDescription('');
            setSuccess('Invoice sent to customer. They can pay from the chat or billing page.');
            openConversation(active.id);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const forwardToSupervisor = async (e) => {
        e.preventDefault();
        if (!active) return;
        try {
            await salesApi.forwardConversation(active.id, forwardReason || 'Needs supervisor approval');
            setShowForwardForm(false);
            setForwardReason('');
            setSuccess('Conversation forwarded to supervisor.');
            openConversation(active.id);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const fieldStyle = { ...themeInputStyle, marginBottom: 0 };
    const canManageDeal = auth.role === 'SALES_AGENT';
    const showQueue = auth.role === 'SALES_AGENT';
    const isSupervisorView = auth.role === 'SUPERVISOR';
    const chatExpired = active?.expiresAt && isChatExpired(active.expiresAt);
    const canReply = active && !chatExpired && (
        auth.role === 'SALES_AGENT'
            ? active.status !== 'closed' && active.status !== 'unassigned'
            : isSupervisorView
                ? active.status === 'forwarded'
                : false
    );

    const metaParts = active ? [
        active.isGuest && 'Quote request (guest)',
        active.customerEmail,
        active.supervisorName && `Supervisor: ${active.supervisorName}`,
        active.agreedAmountKobo && `Agreed: ${formatNaira(active.agreedAmountKobo)}`,
    ].filter(Boolean).join(' · ') : '';

    return (
        <>
                    <PageHeader
                title={auth.isSupervisor ? 'Escalated Sales Conversations' : 'Customer Messages'}
                subtitle={auth.isSupervisor
                    ? 'Review negotiations forwarded by sales agents'
                    : 'Accept new inquiries from the queue, then negotiate and send invoices'}
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="cyforce-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 16, alignItems: 'stretch' }}>
                <Card title="Inbox" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                    {showQueue && (
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                            {[
                                { id: 'mine', label: `My chats (${conversations.length})` },
                                { id: 'queue', label: `Queue (${queue.length})` },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setInboxTab(tab.id)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        border: `1px solid ${inboxTab === tab.id ? theme.primary : theme.border}`,
                                        background: inboxTab === tab.id ? 'rgba(43,92,230,0.12)' : 'transparent',
                                        color: inboxTab === tab.id ? theme.text : theme.textMuted,
                                        fontFamily: theme.fontBody,
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <ChatInboxList>
                        {inboxTab === 'queue' && showQueue ? (
                            queue.length ? queue.map((c) => (
                                <div key={c.id} style={{ padding: '12px 14px', borderRadius: 6, marginBottom: 4 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{c.customerName}</div>
                                    <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 10 }}>{c.subject}</div>
                                    <PrimaryButton onClick={() => acceptConversation(c.id)} style={{ fontSize: 12, padding: '6px 12px' }}>
                                        Accept
                                    </PrimaryButton>
                                </div>
                            )) : <p style={{ color: theme.textDim, fontSize: 13, padding: '8px 14px' }}>No customers waiting in the queue.</p>
                        ) : (
                            conversations.length ? conversations.map((c) => (
                                <ChatInboxItem
                                    key={c.id}
                                    active={active?.id === c.id}
                                    onClick={() => openConversation(c.id)}
                                    title={c.customerName}
                                    subtitle={`${c.isGuest ? 'Quote · ' : ''}${c.subject} · ${c.status}${c.expiresAt ? ` · expires ${formatChatExpiry(c.expiresAt)}` : ''}`}
                                />
                            )) : <p style={{ color: theme.textDim, fontSize: 13, padding: '8px 14px' }}>No customer messages.</p>
                        )}
                    </ChatInboxList>
                </Card>

                <ChatPanel>
                    {active ? (
                        <>
                            <ChatPanelHeader>
                                <AgentChatHeader
                                    name={active.customerName}
                                    imageUrl={null}
                                    roleLabel={active.isGuest ? 'Quote prospect' : 'Customer'}
                                    meta={metaParts || active.subject}
                                    expiresAt={active.expiresAt}
                                />
                            </ChatPanelHeader>

                            {active.expiresAt && (
                                <div style={{ padding: '0 20px 12px' }}>
                                    <ChatExpiryNotice expiresAt={active.expiresAt} />
                                </div>
                            )}

                            {active.isGuest && canReply && (
                                <div style={{
                                    padding: '10px 20px',
                                    fontSize: 12,
                                    color: theme.textMuted,
                                    borderBottom: `1px solid ${theme.border}`,
                                    background: 'rgba(43,92,230,0.06)',
                                }}>
                                    Replies are sent to {active.customerEmail} with a link back to their quote portal.
                                </div>
                            )}

                            {isSupervisorView && active.status !== 'forwarded' && (
                                <div style={{
                                    padding: '10px 20px',
                                    fontSize: 12,
                                    color: theme.textMuted,
                                    borderBottom: `1px solid ${theme.border}`,
                                    background: 'rgba(251,191,36,0.08)',
                                }}>
                                    View-only mode. You can reply when a sales agent forwards this conversation for supervisor review.
                                </div>
                            )}

                            {canManageDeal && active.status !== 'closed' && active.status !== 'unassigned' && (
                                <ChatPanelToolbar>
                                    <Link to="/sales/playbook" style={{
                                        padding: '8px 14px',
                                        borderRadius: 6,
                                        border: `1px solid ${theme.border}`,
                                        background: 'transparent',
                                        color: theme.accent,
                                        fontSize: 13,
                                        textDecoration: 'none',
                                        fontFamily: theme.fontBody,
                                    }}>
                                        Sales Playbook
                                    </Link>
                                    <PrimaryButton onClick={() => { setShowInvoiceForm(!showInvoiceForm); setShowForwardForm(false); }} style={{ fontSize: 13, padding: '8px 14px' }}>
                                        Send Invoice
                                    </PrimaryButton>
                                    {active.status !== 'forwarded' && (
                                        <button
                                            type="button"
                                            onClick={() => { setShowForwardForm(!showForwardForm); setShowInvoiceForm(false); }}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: 6,
                                                border: `1px solid ${theme.border}`,
                                                background: 'transparent',
                                                color: theme.textMuted,
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                fontFamily: theme.fontBody,
                                            }}
                                        >
                                            Forward to Supervisor
                                        </button>
                                    )}
                                </ChatPanelToolbar>
                            )}

                            {(showInvoiceForm || showForwardForm) && (
                                <ChatPanelToolbar>
                                    {showInvoiceForm && (
                                        <form onSubmit={sendInvoice} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                                            <input value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="Amount in ₦" type="number" min="1" required style={{ ...fieldStyle, width: 140 }} />
                                            <input value={invoiceDescription} onChange={(e) => setInvoiceDescription(e.target.value)} placeholder="Description" style={{ ...fieldStyle, flex: 1, minWidth: 160 }} />
                                            <PrimaryButton type="submit" style={{ fontSize: 13, padding: '8px 14px' }}>Send invoice</PrimaryButton>
                                        </form>
                                    )}
                                    {showForwardForm && (
                                        <form onSubmit={forwardToSupervisor} style={{ display: 'flex', gap: 10, width: '100%' }}>
                                            <input value={forwardReason} onChange={(e) => setForwardReason(e.target.value)} placeholder="Reason for supervisor review" style={{ ...fieldStyle, flex: 1 }} />
                                            <PrimaryButton type="submit" style={{ fontSize: 13, padding: '8px 14px' }}>Forward</PrimaryButton>
                                        </form>
                                    )}
                                </ChatPanelToolbar>
                            )}

                            <ChatPanelBody bottomRef={bottomRef}>
                                {messages.length === 0 ? (
                                    <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', marginTop: 40 }}>No messages yet. Start the conversation below.</p>
                                ) : messages.map((m) => {
                                    const mine = m.authorId === auth.userId
                                        || m.authorRole === 'SALES_AGENT'
                                        || m.authorRole === 'ADMIN'
                                        || m.authorRole === 'SUPERVISOR';
                                    const isInvoice = m.messageType === 'invoice';
                                    return (
                                        <div key={m.id}>
                                            <ChatMessageRow message={m} isMine={mine} showAvatar={!mine} />
                                            {isInvoice && m.invoice && (
                                                <div style={{ fontSize: 12, color: theme.accent, margin: '-8px 0 12px 42px' }}>
                                                    Invoice {formatNaira(m.invoice.amount)} — {m.invoice.status}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </ChatPanelBody>

                            {canReply && (
                                <ChatPanelFooter>
                                    <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to customer..." style={{ ...fieldStyle, flex: 1 }} />
                                        <PrimaryButton type="submit" style={{ flexShrink: 0 }}>Send</PrimaryButton>
                                    </form>
                                </ChatPanelFooter>
                            )}
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                            <p style={{ color: theme.textDim, fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
                                Select a conversation from the inbox, or accept a customer from the queue.
                            </p>
                        </div>
                    )}
                </ChatPanel>
            </div>
        </>
    );
}