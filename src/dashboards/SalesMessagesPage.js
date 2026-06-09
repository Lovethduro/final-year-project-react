import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert } from '../components/ui';
import { salesApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';

export default function SalesMessagesPage() {
    const auth = useAuth();
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const load = () => {
        salesApi.conversations().then(setConversations).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openConversation = async (id) => {
        try {
            const data = await salesApi.getConversation(id);
            setActive(data.conversation);
            setMessages(data.messages || []);
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

    const inputStyle = { flex: 1, background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody };

    return (
        <DashboardLayout>
            <PageHeader title="Customer Messages" subtitle="Respond to customer inquiries" />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 480 }}>
                <Card title="Inbox">
                    {conversations.length ? conversations.map((c) => (
                        <button key={c.id} type="button" onClick={() => openConversation(c.id)} style={{
                            display: 'block', width: '100%', textAlign: 'left', padding: '12px 0',
                            borderBottom: `0.5px solid ${theme.border}`, background: 'transparent', cursor: 'pointer',
                            color: active?.id === c.id ? theme.accent : theme.text,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.customerName}</div>
                            <div style={{ fontSize: 11, color: theme.textDim }}>{c.subject}</div>
                        </button>
                    )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No customer messages.</p>}
                </Card>

                <Card title={active ? `${active.customerName} — ${active.subject}` : 'Select a conversation'}>
                    {active ? (
                        <>
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{active.customerEmail}</div>
                            <div style={{ height: 320, overflowY: 'auto', marginBottom: 16 }}>
                                {messages.map((m) => {
                                    const mine = m.authorId === auth.userId;
                                    return (
                                        <div key={m.id} style={{
                                            marginBottom: 10, maxWidth: '80%', marginLeft: mine ? 'auto' : 0,
                                            padding: 10, borderRadius: 10,
                                            background: mine ? 'rgba(43,92,230,0.25)' : 'rgba(255,255,255,0.05)',
                                        }}>
                                            <div style={{ fontSize: 11, color: theme.textDim }}>{m.authorName}</div>
                                            <div style={{ fontSize: 14, color: theme.text }}>{m.message}</div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to customer..." style={inputStyle} />
                                <PrimaryButton type="submit">Send</PrimaryButton>
                            </form>
                        </>
                    ) : (
                        <p style={{ color: theme.textDim, fontSize: 14 }}>Select a customer conversation from the inbox.</p>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
