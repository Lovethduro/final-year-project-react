import { useCallback, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, StatCard, PrimaryButton, Alert, Select, ConfirmDialog } from './components/ui';
import { adminApi, supportApi, assetUrl } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme } from './styles/theme';
import { ChatMessageRow } from './components/ChatMessage';

const STAFF_ROLES = ['SUPPORT_AGENT', 'ADMIN', 'SUPERVISOR'];

function slaHoursForPriority(priority) {
    const p = (priority || 'medium').toLowerCase();
    if (['high', 'urgent', 'critical'].includes(p)) return 4;
    if (p === 'low') return 24;
    return 8;
}

function isTicketSlaBreached(ticket) {
    if (!ticket?.createdAt) return false;
    const created = new Date(ticket.createdAt);
    const deadline = new Date(created.getTime() + slaHoursForPriority(ticket.priority) * 3600000);
    if (['resolved', 'closed'].includes(ticket.status)) {
        const resolved = new Date(ticket.updatedAt || Date.now());
        return resolved > deadline;
    }
    return Date.now() > deadline.getTime();
}

function ticketSlaLabel(ticket) {
    if (!ticket?.createdAt) return '';
    const created = new Date(ticket.createdAt);
    const deadline = new Date(created.getTime() + slaHoursForPriority(ticket.priority) * 3600000);
    const diffMs = deadline.getTime() - Date.now();
    if (diffMs < 0) {
        const overdueMins = Math.floor(Math.abs(diffMs) / 60000);
        if (overdueMins < 60) return `${overdueMins}m overdue`;
        return `${Math.floor(overdueMins / 60)}h overdue`;
    }
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m left`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
}

export default function TicketsPage() {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const isStaff = STAFF_ROLES.includes(auth.role);
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [mergingId, setMergingId] = useState(null);
    const [mergeConfirm, setMergeConfirm] = useState(null);
    const [reply, setReply] = useState('');
    const [macros, setMacros] = useState([]);
    const [selectedMacroId, setSelectedMacroId] = useState('');
    const [internalNote, setInternalNote] = useState(false);
    const [transferNote, setTransferNote] = useState('');
    const [transferringId, setTransferringId] = useState(null);
    const [transferMode, setTransferMode] = useState(null);
    const [transferAgentId, setTransferAgentId] = useState('');
    const [agents, setAgents] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [takingOver, setTakingOver] = useState(false);

    const isAdmin = auth.role === 'ADMIN';

    const reload = useCallback(() => {
        const load = auth.role === 'SUPPORT_AGENT'
            ? supportApi.allOpen().then(setTickets)
            : adminApi.tickets().then(setTickets);
        load.catch(() => setTickets([]));
    }, [auth.role]);

    useEffect(() => {
        if (auth.role === 'CUSTOMER') return;
        reload();
        if (isStaff) {
            supportApi.macros().then(setMacros).catch(() => setMacros([]));
            supportApi.agents().then(setAgents).catch(() => setAgents([]));
        }
    }, [auth.role, isStaff, reload]);

    useEffect(() => {
        const ticketId = searchParams.get('ticket');
        if (ticketId && isStaff) {
            openTicket(ticketId);
        }
    }, [searchParams, isStaff]);

    const openTicket = async (id) => {
        setError('');
        try {
            const [data, timelineData, duplicateData] = await Promise.all([
                supportApi.getTicket(id),
                supportApi.getTicketTimeline(id),
                supportApi.getDuplicates(id),
            ]);
            setSelected(data.ticket);
            setTimeline(timelineData || []);
            setDuplicates(duplicateData || []);
            if (auth.role === 'ADMIN') {
                const ticket = data.ticket;
                setInternalNote(!(ticket.adminTakeover || ticket.slaEscalated));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTakeover = async () => {
        if (!selected) return;
        setError('');
        setTakingOver(true);
        try {
            const ticket = await supportApi.takeover(selected.id);
            setSelected(ticket);
            setInternalNote(false);
            setMessage('You have taken over this ticket. The customer has been notified.');
            await openTicket(selected.id);
            reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setTakingOver(false);
        }
    };

    const sendReply = async (e) => {
        e.preventDefault();
        if (!selected || !reply.trim()) return;
        setError('');
        const noteOnly = isAdmin && !(selected.adminTakeover || selected.slaEscalated);
        try {
            await supportApi.respond(selected.id, reply.trim(), noteOnly || internalNote);
            setReply('');
            setInternalNote(isAdmin && !(selected.adminTakeover || selected.slaEscalated));
            await openTicket(selected.id);
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const assignToMe = async () => {
        if (!selected) return;
        setError('');
        try {
            await supportApi.assign(selected.id);
            await openTicket(selected.id);
            reload();
            setMessage('Ticket assigned to you.');
        } catch (err) {
            setError(err.message);
        }
    };

    const updateStatus = async (status) => {
        if (!selected) return;
        setError('');
        try {
            await supportApi.updateTicketStatus(selected.id, status);
            await openTicket(selected.id);
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTransferToSales = async (ticketId) => {
        setError('');
        setMessage('');
        try {
            await supportApi.transferToSales(ticketId, transferNote || 'Customer wants to purchase');
            setTransferringId(null);
            setTransferMode(null);
            setTransferNote('');
            setTransferAgentId('');
            setMessage('Ticket transferred to sales. A sales conversation was created for the customer.');
            if (selected?.id === ticketId) {
                setSelected(null);
                setTimeline([]);
                setDuplicates([]);
            }
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTransferToAgent = async (ticketId) => {
        if (!transferAgentId) {
            setError('Select an agent to transfer to.');
            return;
        }
        setError('');
        setMessage('');
        try {
            await supportApi.transferToAgent(ticketId, transferAgentId, transferNote || 'Handoff from ticket chat');
            setTransferringId(null);
            setTransferMode(null);
            setTransferNote('');
            setTransferAgentId('');
            setMessage('Ticket transferred to another support agent.');
            if (selected?.id === ticketId) {
                await openTicket(ticketId);
            }
            reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const applyMacro = (macroId) => {
        setSelectedMacroId(macroId);
        const macro = macros.find((m) => m.id === macroId);
        if (!macro) return;
        const customerName = selected?.customerName || 'there';
        const text = (macro.content || '')
            .replaceAll('{{customerName}}', customerName)
            .replaceAll('{{ticketId}}', selected?.id || '');
        setReply((prev) => (prev?.trim() ? `${prev}\n\n${text}` : text));
    };

    const openMergeConfirm = (duplicateId) => {
        if (!selected || !duplicateId) return;
        const duplicate = duplicates.find((d) => d.id === duplicateId);
        const label = duplicate?.ticketNumber || duplicateId.slice(-6).toUpperCase();
        setMergeConfirm({
            duplicateId,
            label,
            duplicateSubject: duplicate?.subject || 'other ticket',
            primarySubject: selected.subject,
        });
    };

    const confirmMergeDuplicate = async () => {
        if (!selected || !mergeConfirm?.duplicateId) return;
        const { duplicateId, label } = mergeConfirm;
        setError('');
        setMessage('');
        setMergingId(duplicateId);
        try {
            await supportApi.mergeTicket(selected.id, duplicateId);
            setMessage(`Merged ticket ${label} into this ticket.`);
            setMergeConfirm(null);
            await openTicket(selected.id);
            reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setMergingId(null);
        }
    };

    if (auth.role === 'CUSTOMER') {
        return <Navigate to="/customer/tickets" replace />;
    }

    const filtered = tickets.filter((t) => {
        const q = search.toLowerCase();
        const matchesSearch = [t.id, t.subject, t.customerName, t.customerEmail].filter(Boolean).join(' ').toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${theme.border}`,
        borderRadius: 8,
        padding: 10,
        color: theme.text,
        fontFamily: theme.fontBody,
        marginBottom: 12,
    };

    const ticketOpen = selected
        && !['closed', 'resolved', 'merged'].includes(selected.status)
        && !selected.transferredToSales;
    const adminCanReplyToCustomer = isAdmin && ticketOpen && (selected?.adminTakeover || selected?.slaEscalated);
    const adminNoteOnly = isAdmin && ticketOpen && !adminCanReplyToCustomer;
    const canChat = ticketOpen && (!isAdmin || adminCanReplyToCustomer || adminNoteOnly);
    const canManageTicket = !isAdmin || selected?.adminTakeover || selected?.slaEscalated;

    return (
        <DashboardLayout>
            <PageHeader
                title="Support Tickets"
                subtitle={auth.role === 'SUPPORT_AGENT'
                    ? 'Chat with customers and resolve support requests'
                    : isAdmin
                        ? 'Monitor support threads — add internal notes, or take over escalated tickets to reply'
                        : 'Track and resolve customer support requests'}
            />
            {error && <Alert type="error">{error}</Alert>}
            {message && <Alert type="success">{message}</Alert>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard title="Open" value={tickets.filter((t) => t.status === 'open').length} icon="📂" status="warning" />
                <StatCard title="In Progress" value={tickets.filter((t) => t.status === 'in_progress').length} icon="⏳" status="info" />
                <StatCard title="Resolved" value={tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length} icon="✅" status="success" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(300px, 0.85fr) minmax(420px, 1.15fr)' : '1fr', gap: 20, alignItems: 'start' }}>
                <Card>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                        <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </Select>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'id', label: 'ID', render: (r) => r.id?.slice(-6).toUpperCase() },
                            { key: 'subject', label: 'Subject' },
                            { key: 'customerName', label: 'Customer' },
                            { key: 'priority', label: 'Priority' },
                            {
                                key: 'sla',
                                label: 'SLA',
                                render: (r) => {
                                    const breached = isTicketSlaBreached(r);
                                    return (
                                        <div>
                                            <span style={{ fontSize: 11, color: breached ? theme.error : theme.textDim }}>{ticketSlaLabel(r)}</span>
                                            {r.slaEscalated && <StatusBadge status="error" label="Escalated" />}
                                        </div>
                                    );
                                },
                            },
                            { key: 'assigneeName', label: 'Assignee', render: (r) => r.assigneeName || 'Unassigned' },
                            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status === 'resolved' ? 'success' : row.status === 'open' ? 'warning' : 'info'} label={(row.status || '').replace('_', ' ')} /> },
                            {
                                key: 'actions',
                                label: '',
                                render: (r) => (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {isStaff && (
                                            <button
                                                type="button"
                                                onClick={() => openTicket(r.id)}
                                                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: 'none', background: theme.primary, color: '#fff', cursor: 'pointer' }}
                                            >
                                                {isAdmin ? 'View' : 'Chat'}
                                            </button>
                                        )}
                                        {auth.role === 'SUPPORT_AGENT' && !r.transferredToSales && (
                                            transferringId === r.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                                                    <input
                                                        value={transferNote}
                                                        onChange={(e) => setTransferNote(e.target.value)}
                                                        placeholder="Note for sales (optional)"
                                                        style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <PrimaryButton onClick={() => handleTransferToSales(r.id)} style={{ fontSize: 10, padding: '3px 8px' }}>Confirm</PrimaryButton>
                                                        <button type="button" onClick={() => { setTransferringId(null); setTransferNote(''); }} style={{ fontSize: 10, padding: '3px 8px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setTransferringId(r.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>
                                                    To Sales
                                                </button>
                                            )
                                        )}
                                        {r.transferredToSales && <StatusBadge status="info" label="With Sales" />}
                                    </div>
                                ),
                            },
                        ]}
                        rows={filtered}
                        emptyMessage="No tickets found."
                    />
                </Card>

                {selected && isStaff && (
                    <Card title={selected.subject} style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 220px)' }}>
                        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
                            {selected.customerName} · {selected.customerEmail || 'Guest'}
                            {' · '}Priority: {selected.priority}
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                            <StatusBadge status={selected.status === 'resolved' ? 'success' : 'warning'} label={selected.status} />
                            {isTicketSlaBreached(selected) && (
                                <StatusBadge status="error" label={`SLA: ${ticketSlaLabel(selected)}`} />
                            )}
                            {selected.slaEscalated && (
                                <StatusBadge status="error" label="SLA escalated" />
                            )}
                            {selected.adminTakeover && (
                                <StatusBadge status="info" label="Admin takeover" />
                            )}
                            {isAdmin && ticketOpen && !selected.adminTakeover && (
                                <PrimaryButton onClick={handleTakeover} disabled={takingOver} style={{ fontSize: 11, padding: '4px 12px' }}>
                                    {takingOver ? 'Taking over…' : 'Take over ticket'}
                                </PrimaryButton>
                            )}
                            {auth.role === 'SUPPORT_AGENT' && !selected.assigneeId && (
                                <PrimaryButton onClick={assignToMe} style={{ fontSize: 11, padding: '4px 12px' }}>Assign to me</PrimaryButton>
                            )}
                            {auth.role === 'SUPPORT_AGENT' && !selected.transferredToSales && (
                                transferringId === selected.id && transferMode === 'agent' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
                                        <Select value={transferAgentId} onChange={(e) => setTransferAgentId(e.target.value)} style={{ marginBottom: 0, fontSize: 12 }}>
                                            <option value="">Transfer to agent…</option>
                                            {agents.filter((a) => !a.self).map((a) => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </Select>
                                        <input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Handoff note" style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <PrimaryButton onClick={() => handleTransferToAgent(selected.id)} style={{ fontSize: 10, padding: '3px 8px' }}>Confirm</PrimaryButton>
                                            <button type="button" onClick={() => { setTransferringId(null); setTransferMode(null); setTransferNote(''); setTransferAgentId(''); }} style={{ fontSize: 10, padding: '3px 8px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : transferringId === selected.id && transferMode === 'sales' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                                        <input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Note for sales" style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text }} />
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <PrimaryButton onClick={() => handleTransferToSales(selected.id)} style={{ fontSize: 10, padding: '3px 8px' }}>Confirm</PrimaryButton>
                                            <button type="button" onClick={() => { setTransferringId(null); setTransferMode(null); setTransferNote(''); }} style={{ fontSize: 10, padding: '3px 8px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => { setTransferringId(selected.id); setTransferMode('agent'); }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer' }}>
                                            To Agent
                                        </button>
                                        <button type="button" onClick={() => { setTransferringId(selected.id); setTransferMode('sales'); }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>
                                            To Sales
                                        </button>
                                    </>
                                )
                            )}
                            <Select value={selected.status} onChange={(e) => updateStatus(e.target.value)} disabled={!canManageTicket} style={{ width: 'auto', minWidth: 140, marginBottom: 0, fontSize: 12, opacity: canManageTicket ? 1 : 0.6 }}>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </Select>
                        </div>
                        <p style={{ fontSize: 14, color: theme.text, marginBottom: 12 }}>{selected.description}</p>
                        {isAdmin && adminNoteOnly && (
                            <div style={{
                                marginBottom: 12,
                                padding: '10px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                color: theme.textMuted,
                                border: `1px solid ${theme.border}`,
                                background: 'rgba(251,191,36,0.08)',
                            }}>
                                Oversight mode — you can add internal notes for the team. Use <strong style={{ color: theme.text }}>Take over ticket</strong> or wait for SLA escalation to reply to the customer.
                            </div>
                        )}
                        {isAdmin && adminCanReplyToCustomer && (
                            <div style={{
                                marginBottom: 12,
                                padding: '10px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                color: theme.textMuted,
                                border: `1px solid ${theme.border}`,
                                background: 'rgba(52,211,153,0.08)',
                            }}>
                                {selected.adminTakeover
                                    ? 'You have taken over this ticket — customer-visible replies are enabled.'
                                    : 'SLA escalated — you may reply to the customer on this ticket.'}
                            </div>
                        )}
                        {duplicates.length > 0 && (
                            <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, border: `0.5px solid ${theme.warning}44`, background: 'rgba(245,158,11,0.08)' }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.warning, marginBottom: 4 }}>Likely duplicate tickets</div>
                                <p style={{ fontSize: 11, color: theme.textDim, margin: '0 0 12px', lineHeight: 1.5 }}>
                                    Same customer with a matching subject or description. Open the other ticket first if you want to keep that one instead.
                                </p>
                                {duplicates.map((dup) => (
                                    <div key={dup.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap', padding: '10px 0', borderTop: `0.5px solid ${theme.border}` }}>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                                                <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600 }}>{dup.ticketNumber}</span>
                                                <StatusBadge status={dup.confidence === 'high' ? 'error' : 'warning'} label={`${dup.confidence === 'high' ? 'High' : 'Medium'} confidence`} />
                                            </div>
                                            <div style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>{dup.subject}</div>
                                            {dup.descriptionPreview && (
                                                <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4, lineHeight: 1.45 }}>
                                                    {dup.descriptionPreview}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 11, color: theme.textDim }}>
                                                {dup.reason}
                                                {' · '}{dup.status?.replace('_', ' ')}
                                                {dup.createdAt ? ` · ${new Date(dup.createdAt).toLocaleString()}` : ''}
                                                {dup.messageCount != null ? ` · ${dup.messageCount} msg` : ''}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => openTicket(dup.id)}
                                                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer' }}
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                disabled={mergingId === dup.id}
                                                onClick={() => openMergeConfirm(dup.id)}
                                                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, border: 'none', background: dup.confidence === 'high' ? theme.warning : 'rgba(245,158,11,0.35)', color: '#111', cursor: mergingId === dup.id ? 'not-allowed' : 'pointer', opacity: mergingId === dup.id ? 0.7 : 1 }}
                                            >
                                                {mergingId === dup.id ? 'Merging…' : 'Merge into this'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selected.attachmentUrl && (
                            <img src={assetUrl(selected.attachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 16 }} />
                        )}
                        <div style={{ flex: 1, minHeight: 360, maxHeight: 'min(620px, calc(100vh - 420px))', overflowY: 'auto', marginBottom: 16, borderTop: `0.5px solid ${theme.border}`, paddingTop: 12 }}>
                            {timeline.length ? timeline.map((item) => {
                                const mine = item.authorId === auth.userId;
                                const isSystem = item.messageType === 'system';
                                return (
                                    <div key={item.id || `${item.createdAt}-${item.message}`} style={{ marginBottom: 4 }}>
                                        <ChatMessageRow
                                            message={{
                                                ...item,
                                                messageType: item.messageType || (isSystem ? 'system' : 'text'),
                                            }}
                                            isMine={mine}
                                            showAvatar={!mine && !isSystem}
                                        />
                                        {!isSystem && item.internalNote && (
                                            <div style={{ fontSize: 10, color: theme.warning, margin: '-6px 0 8px 42px' }}>Internal note</div>
                                        )}
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: theme.textDim,
                                                margin: isSystem ? '-8px 0 8px 0' : (mine ? '-8px 0 8px 0' : '-8px 0 8px 42px'),
                                                textAlign: isSystem ? 'center' : (mine ? 'right' : 'left'),
                                            }}
                                        >
                                            {isSystem ? 'System' : (item.authorName || 'Customer')}
                                            {' · '}
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>
                                );
                            }) : <p style={{ color: theme.textDim, fontSize: 13 }}>No timeline events yet. Send the first reply below.</p>}
                        </div>
                        {canChat ? (
                            <form onSubmit={sendReply}>
                                {isStaff && !adminNoteOnly && (
                                    <div style={{ marginBottom: 10 }}>
                                        <Select value={selectedMacroId} onChange={(e) => applyMacro(e.target.value)} style={{ marginBottom: 8 }}>
                                            <option value="">Insert a macro...</option>
                                            {macros.map((macro) => (
                                                <option key={macro.id} value={macro.id}>{macro.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder={adminNoteOnly ? 'Add an internal note for the support team…' : 'Write a reply to the customer...'}
                                    rows={adminNoteOnly ? 4 : 6}
                                    style={{ ...inputStyle, minHeight: adminNoteOnly ? 100 : 140, resize: 'vertical', marginBottom: 12 }}
                                    required
                                />
                                {isStaff && !adminNoteOnly && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>
                                        <input type="checkbox" checked={internalNote} onChange={(e) => setInternalNote(e.target.checked)} />
                                        Internal note (not visible to customer)
                                    </label>
                                )}
                                <PrimaryButton type="submit">{adminNoteOnly ? 'Add internal note' : 'Send Message'}</PrimaryButton>
                            </form>
                        ) : (
                            <p style={{ fontSize: 13, color: theme.textDim }}>This ticket is closed or transferred — chat is read-only.</p>
                        )}
                        <button type="button" onClick={() => { setSelected(null); setTimeline([]); setDuplicates([]); }} style={{ marginTop: 12, background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}>← Back to list</button>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(mergeConfirm)}
                title="Merge tickets?"
                message={mergeConfirm ? (
                    <>
                        Merge <strong>{mergeConfirm.label}</strong> (“{mergeConfirm.duplicateSubject}”) into this ticket (“{mergeConfirm.primarySubject}”)?
                        <br /><br />
                        Messages will move here and the other ticket will be closed.
                    </>
                ) : ''}
                confirmLabel={mergingId ? 'Merging…' : 'Merge tickets'}
                cancelLabel="Cancel"
                danger
                loading={Boolean(mergingId)}
                onConfirm={confirmMergeDuplicate}
                onCancel={() => { if (!mergingId) setMergeConfirm(null); }}
            />
        </DashboardLayout>
    );
}
