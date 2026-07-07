import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Card, Alert } from '../components/ui';
import { salesApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';
import {
    AgentChatHeader,
    ChatMessageRow,
    ChatPanel,
    ChatPanelHeader,
    ChatPanelBody,
    ChatInboxList,
    ChatInboxItem,
} from '../components/ChatMessage';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function ConversationMonitorPage() {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const deepLinkId = searchParams.get('conversation');
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const load = () => {
        salesApi.conversations().then(setConversations).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        if (deepLinkId) openConversation(deepLinkId);
    }, [deepLinkId]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openConversation = async (id) => {
        setError('');
        try {
            const data = await salesApi.getConversation(id);
            setActive(data.conversation);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const metaParts = active ? [
        active.isGuest && 'Quote request (guest)',
        active.customerEmail,
        active.salesAgentName && `Agent: ${active.salesAgentName}`,
        active.supervisorName && `Supervisor: ${active.supervisorName}`,
        active.agreedAmountKobo && `Agreed: ${formatNaira(active.agreedAmountKobo)}`,
    ].filter(Boolean).join(' · ') : '';

    return (
        <>
                    <PageHeader
                title="Customer Conversations"
                subtitle="Read-only oversight of sales chats between customers and sales agents"
            />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{
                padding: '10px 14px',
                marginBottom: 16,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: 'rgba(56,189,248,0.06)',
                fontSize: 13,
                color: theme.textMuted,
            }}>
                Administrators can monitor conversations here but cannot message customers directly.
                Use <strong style={{ color: theme.text }}>Tickets &amp; Chat</strong> for support oversight, or take over an escalated ticket when needed.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 16, alignItems: 'stretch' }}>
                <Card title="All conversations" style={{ marginBottom: 0 }}>
                    <ChatInboxList>
                        {conversations.length ? conversations.map((c) => (
                            <ChatInboxItem
                                key={c.id}
                                active={active?.id === c.id}
                                onClick={() => openConversation(c.id)}
                                title={c.customerName}
                                subtitle={`${c.isGuest ? 'Quote · ' : ''}${c.subject} · ${c.status}`}
                            />
                        )) : (
                            <p style={{ color: theme.textDim, fontSize: 13, padding: '8px 14px' }}>No customer conversations yet.</p>
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
                                />
                            </ChatPanelHeader>

                            <div style={{
                                padding: '10px 20px',
                                fontSize: 12,
                                color: theme.textMuted,
                                borderBottom: `1px solid ${theme.border}`,
                                background: 'rgba(251,191,36,0.08)',
                            }}>
                                View-only — sales agents and supervisors handle customer replies.
                            </div>

                            <ChatPanelBody bottomRef={bottomRef}>
                                {messages.length === 0 ? (
                                    <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', marginTop: 40 }}>No messages in this conversation.</p>
                                ) : messages.map((m) => {
                                    const mine = m.authorId === auth.userId;
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
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                            <p style={{ color: theme.textDim, fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
                                Select a conversation to review messages between the customer and their sales agent.
                            </p>
                        </div>
                    )}
                </ChatPanel>
            </div>
        </>
    );
}