import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader, Card, PrimaryButton, Alert } from '../components/ui';
import { teamChatApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';
import {
    ChatMessageRow,
    ChatPanel,
    ChatPanelBody,
    ChatPanelFooter,
    ChatPanelHeader,
    ChatInboxList,
    ChatInboxItem,
} from '../components/ChatMessage';

const CHANNEL_LABELS = {
    STAFF_TO_SUPERVISOR: 'Staff → Supervisors',
    SUPERVISOR_TO_ADMIN: 'Supervisor → Admin',
};

export default function TeamChatPage() {
    const auth = useAuth();
    const [threads, setThreads] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [error, setError] = useState('');
    const [showNew, setShowNew] = useState(false);
    const bottomRef = useRef(null);

    const pageTitle = auth.role === 'SUPERVISOR'
        ? 'Message Admin'
        : auth.role === 'ADMIN'
            ? 'Supervisor Messages'
            : 'Message Supervisors';

    const load = () => {
        teamChatApi.threads().then(setThreads).catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openThread = async (id) => {
        setError('');
        try {
            const data = await teamChatApi.getThread(id);
            setActive(data.thread);
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const startThread = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            const thread = await teamChatApi.startThread({ subject: subject || 'Team message', message: text.trim() });
            setShowNew(false);
            setText('');
            setSubject('');
            load();
            openThread(thread.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const send = async (e) => {
        e.preventDefault();
        if (!active || !text.trim()) return;
        try {
            await teamChatApi.sendMessage(active.id, text.trim());
            setText('');
            openThread(active.id);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const canStart = auth.role !== 'ADMIN';

    return (
        <DashboardLayout>
            <PageHeader
                title={pageTitle}
                subtitle="Internal team messaging — separate from customer conversations"
                action={canStart ? <PrimaryButton onClick={() => setShowNew(!showNew)}>New message</PrimaryButton> : null}
            />
            {error && <Alert type="error">{error}</Alert>}

            {showNew && (
                <Card title="New team message" style={{ marginBottom: 16 }}>
                    <form onSubmit={startThread}>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={{ ...inputStyle, marginBottom: 10 }} />
                        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Your message..." rows={3} required style={{ ...inputStyle, marginBottom: 10 }} />
                        <PrimaryButton type="submit">Send</PrimaryButton>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 16 }}>
                <Card title="Threads" style={{ marginBottom: 0 }}>
                    <ChatInboxList>
                        {threads.length ? threads.map((t) => (
                            <ChatInboxItem
                                key={t.id}
                                active={active?.id === t.id}
                                onClick={() => openThread(t.id)}
                                title={t.subject}
                                subtitle={`${CHANNEL_LABELS[t.channelType] || t.channelType} · ${t.initiatorName}`}
                            />
                        )) : <p style={{ color: theme.textDim, fontSize: 13, padding: 8 }}>No team messages yet.</p>}
                    </ChatInboxList>
                </Card>

                <ChatPanel>
                    {active ? (
                        <>
                            <ChatPanelHeader>
                                <div>
                                    <div style={{ fontWeight: 600, color: theme.text }}>{active.subject}</div>
                                    <div style={{ fontSize: 12, color: theme.textDim }}>{CHANNEL_LABELS[active.channelType]}</div>
                                </div>
                            </ChatPanelHeader>
                            <ChatPanelBody bottomRef={bottomRef}>
                                {messages.map((m) => (
                                    <ChatMessageRow key={m.id} message={m} isMine={m.authorId === auth.userId} showAvatar={m.authorId !== auth.userId} />
                                ))}
                            </ChatPanelBody>
                            <ChatPanelFooter>
                                <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
                                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply..." style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                                    <PrimaryButton type="submit">Send</PrimaryButton>
                                </form>
                            </ChatPanelFooter>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim }}>
                            Select a thread or start a new message.
                        </div>
                    )}
                </ChatPanel>
            </div>
        </DashboardLayout>
    );
}
