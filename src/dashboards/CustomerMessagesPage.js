import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert } from '../components/ui';
import { customerApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';

export default function CustomerMessagesPage() {
    const auth = useAuth();
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const loadConversations = () => {
        customerApi.conversations().then(setConversations).catch((err) => setError(err.message));
    };

    useEffect(() => { loadConversations(); }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openConversation = async (id) => {
        setError('');
        try {
            const data = await customerApi.getConversation(id);
            setActive(data.conversation);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const startChat = async (e) => {
        e.preventDefault();
        if (!firstMessage.trim()) return;
        try {
            const conv = await customerApi.startConversation(subject || 'Sales inquiry', firstMessage.trim());
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

    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 };

    return (
        <DashboardLayout>
            <PageHeader
                title="Message Sales Team"
                subtitle="Chat with a sales agent about products, pricing, or payment issues"
                action={<PrimaryButton onClick={() => setShowNew(true)}>+ New Message</PrimaryButton>}
            />
            {error && <Alert type="error">{error}</Alert>}

            {showNew && (
                <Card title="Start a conversation" style={{ marginBottom: 20 }}>
                    <form onSubmit={startChat}>
                        <input style={inputStyle} placeholder="Subject (e.g. Payment not working)" value={subject} onChange={(e) => setSubject(e.target.value)} />
                        <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Describe your issue or question..." value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} required />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton type="submit">Send Message</PrimaryButton>
                            <button type="button" onClick={() => setShowNew(false)} style={{ background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textMuted, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 480 }}>
                <Card title="Conversations">
                    {conversations.length ? conversations.map((c) => (
                        <button key={c.id} type="button" onClick={() => openConversation(c.id)} style={{
                            display: 'block', width: '100%', textAlign: 'left', padding: '12px 0',
                            borderBottom: `0.5px solid ${theme.border}`, background: 'transparent', border: 'none',
                            borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme.border,
                            cursor: 'pointer', color: active?.id === c.id ? theme.accent : theme.text,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.subject}</div>
                            <div style={{ fontSize: 11, color: theme.textDim }}>{c.salesAgentName || 'Awaiting agent'} · {c.status}</div>
                        </button>
                    )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No conversations yet.</p>}
                </Card>

                <Card title={active ? active.subject : 'Select a conversation'}>
                    {active ? (
                        <>
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>
                                Sales agent: {active.salesAgentName || 'Will be assigned shortly'}
                            </div>
                            <div style={{ height: 320, overflowY: 'auto', marginBottom: 16, padding: '8px 0' }}>
                                {messages.map((m) => {
                                    const mine = m.authorId === auth.userId;
                                    return (
                                        <div key={m.id} style={{
                                            marginBottom: 10, maxWidth: '80%',
                                            marginLeft: mine ? 'auto' : 0,
                                            padding: 10, borderRadius: 10,
                                            background: mine ? 'rgba(43,92,230,0.25)' : 'rgba(255,255,255,0.05)',
                                        }}>
                                            <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>{m.authorName}</div>
                                            <div style={{ fontSize: 14, color: theme.text }}>{m.message}</div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            {active.status !== 'closed' && (
                                <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                                    <PrimaryButton type="submit">Send</PrimaryButton>
                                </form>
                            )}
                        </>
                    ) : (
                        <p style={{ color: theme.textDim, fontSize: 14 }}>Select a conversation or start a new message to contact our sales team.</p>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
