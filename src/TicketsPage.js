import { useCallback, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { PageHeader, Card, DataTable, StatusBadge, SearchInput, StatCard, PrimaryButton, Alert, Select, ConfirmDialog } from './components/ui';
import { adminApi, supportApi, assetUrl } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme } from './styles/theme';
import { ChatMessageRow } from './components/ChatMessage';
import { TicketCopilotPanel } from './components/TicketCopilotPanel';

const STAFF_ROLES = ['SUPPORT_AGENT', 'ADMIN', 'SUPERVISOR'];
const CHAT_LAYOUT_KEY = 'cyforce.ticketsChatLayout';

function loadChatLayout() {
    try {
        const raw = localStorage.getItem(CHAT_LAYOUT_KEY);
        if (!raw) return { mode: 'split', panelOrder: 'list-first' };
        const parsed = JSON.parse(raw);
        return {
            mode: parsed.mode === 'focus' ? 'focus' : 'split',
            panelOrder: parsed.panelOrder === 'chat-first' ? 'chat-first' : 'list-first',
        };
    } catch {
        return { mode: 'split', panelOrder: 'list-first' };
    }
}

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
    const [agentsLoaded, setAgentsLoaded] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [takingOver, setTakingOver] = useState(false);
    const [chatLayout, setChatLayout] = useState(loadChatLayout);
    const [listDrawerOpen, setListDrawerOpen] = useState(false);

    const updateChatLayout = useCallback((patch) => {
        setChatLayout((prev) => {
            const next = { ...prev, ...patch };
            localStorage.setItem(CHAT_LAYOUT_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isAdmin = auth.role === 'ADMIN';
    const canMergeTickets = auth.role === 'SUPPORT_AGENT' || isAdmin;
    const canUseCopilot = auth.role === 'SUPPORT_AGENT' || isAdmin;

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
        }
    }, [auth.role, isStaff, reload]);

    const ensureAgents = useCallback(() => {
        if (agentsLoaded || auth.role === 'CUSTOMER') return;
        supportApi.agents()
            .then((data) => {
                setAgents(data);
                setAgentsLoaded(true);
            })
            .catch(() => setAgents([]));
    }, [agentsLoaded, auth.role]);

    useEffect(() => {
        if (transferringId != null || transferMode != null) {
            ensureAgents();
        }
    }, [transferringId, transferMode, ensureAgents]);

    const openTicket = useCallback(async (id) => {
        setError('');
        try {
            const requests = [
                supportApi.getTicket(id),
                supportApi.getTicketTimeline(id),
            ];
            if (canMergeTickets) {
                requests.push(supportApi.getDuplicates(id));
            }
            const [data, timelineData, duplicateData] = await Promise.all(requests);
            setSelected(data.ticket);
            setTimeline(timelineData || []);
            setDuplicates(canMergeTickets ? (duplicateData || []) : []);
            if (auth.role === 'ADMIN') {
                const ticket = data.ticket;
                setInternalNote(!(ticket.adminTakeover || ticket.slaEscalated));
            }
        } catch (err) {
            setError(err.message);
        }
    }, [canMergeTickets, auth.role]);

    useEffect(() => {
        const ticketId = searchParams.get('ticket');
        if (ticketId && isStaff) {
            openTicket(ticketId);
        }
    }, [searchParams, isStaff, openTicket]);

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
        background: 'rgba(15,23,42,0.04)',
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

    const toolbarBtn = {
        fontSize: 11,
        padding: '5px 10px',
        borderRadius: 6,
        border: `0.5px solid ${theme.border}`,
        background: 'transparent',
        color: theme.text,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    };

    const compactListColumns = [
        {
            key: 'subject',
            label: 'Ticket',
            render: (r) => (
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</div>
                    <div style={{ fontSize: 11, color: theme.textDim, marginTop: 2 }}>{r.customerName || 'Guest'}</div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status === 'resolved' ? 'success' : row.status === 'open' ? 'warning' : 'info'} label={(row.status || '').replace('_', ' ')} />,
        },
        {
            key: 'sla',
            label: 'SLA',
            render: (r) => {
                const breached = isTicketSlaBreached(r);
                return <span style={{ fontSize: 11, color: breached ? theme.error : theme.textDim }}>{ticketSlaLabel(r)}</span>;
            },
        },
    ];

    const fullListColumns = [
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
                                    style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'rgba(15,23,42,0.04)', color: theme.text }}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <PrimaryButton onClick={() => handleTransferToSales(r.id)} style={{ fontSize: 10, padding: '3px 8px' }}>Confirm</PrimaryButton>
                                    <button type="button" onClick={() => { setTransferringId(null); setTransferNote(''); }} style={{ fontSize: 10, padding: '3px 8px', background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.textDim, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setTransferringId(r.id)} style={{ ...toolbarBtn, color: theme.accent }}>
                                To Sales
                            </button>
                        )
                    )}
                    {r.transferredToSales && <StatusBadge status="info" label="With Sales" />}
                </div>
            ),
        },
    ];

    const listColumns = selected ? compactListColumns : fullListColumns;

    const chatFocus = Boolean(selected) && chatLayout.mode === 'focus';
    const listFirst = chatLayout.panelOrder === 'list-first';
    const showListInGrid = !selected || chatLayout.mode === 'split';

    const closeTicket = () => {
        setSelected(null);
        setTimeline([]);
        setDuplicates([]);
        setListDrawerOpen(false);
    };

    const renderTicketList = (onSelect) => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: selected ? 12 : 20, flexShrink: 0 }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
                {!selected && (
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </Select>
                )}
            </div>
            {selected && (
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 12, fontSize: 12 }}>
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </Select>
            )}
            <div style={{ flex: selected ? 1 : undefined, overflowY: selected ? 'auto' : undefined, minHeight: 0 }}>
                <DataTable
                    columns={listColumns}
                    rows={filtered}
                    emptyMessage="No tickets found."
                    onRowClick={isStaff ? (r) => {
                        openTicket(r.id);
                        if (onSelect) onSelect();
                    } : undefined}
                    activeRowId={selected?.id}
                />
            </div>
        </>
    );

    const layoutBtn = {
        ...toolbarBtn,
        fontSize: 11,
        padding: '5px 10px',
        color: theme.textDim,
    };

    return (
        <>
                    <PageHeader
                title="Support Tickets"
                subtitle={auth.role === 'SUPPORT_AGENT'
                    ? 'Chat with customers and resolve support requests'
                    : isAdmin
                        ? 'Monitor support threads - add internal notes, or take over escalated tickets to reply'
                        : 'Track and resolve customer support requests'}
            />
            {error && <Alert type="error">{error}</Alert>}
            {message && <Alert type="success">{message}</Alert>}
            {!selected && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <StatCard title="Open" value={tickets.filter((t) => t.status === 'open').length} icon="📂" status="warning" />
                    <StatCard title="In Progress" value={tickets.filter((t) => t.status === 'in_progress').length} icon="⏳" status="info" />
                    <StatCard title="Resolved" value={tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length} icon="✅" status="success" />
                </div>
            )}

            <div
                className="cyforce-chat-layout"
                style={{
                display: 'grid',
                gridTemplateColumns: selected && !chatFocus ? 'minmax(220px, 300px) minmax(0, 1fr)' : '1fr',
                gap: selected ? 16 : 20,
                alignItems: 'stretch',
                minHeight: selected ? 'calc(100vh - 160px)' : undefined,
                position: 'relative',
            }}>
                {showListInGrid && (
                    <Card style={{
                        order: listFirst ? 0 : 1,
                        padding: selected ? '12px 14px' : undefined,
                        overflow: 'hidden',
                        display: selected ? 'flex' : undefined,
                        flexDirection: selected ? 'column' : undefined,
                        maxHeight: selected ? 'calc(100vh - 160px)' : undefined,
                    }}>
                        {renderTicketList()}
                    </Card>
                )}

                {chatFocus && listDrawerOpen && (
                    <>
                        <button
                            type="button"
                            aria-label="Close ticket list"
                            onClick={() => setListDrawerOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 90,
                                border: 'none',
                                background: 'rgba(0,0,0,0.5)',
                                cursor: 'pointer',
                            }}
                        />
                        <Card style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: 'min(320px, 88vw)',
                            zIndex: 91,
                            padding: '12px 14px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '0 12px 12px 0',
                            boxShadow: '8px 0 32px rgba(0,0,0,0.35)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Tickets</span>
                                <button type="button" onClick={() => setListDrawerOpen(false)} style={layoutBtn}>Close</button>
                            </div>
                            {renderTicketList(() => setListDrawerOpen(false))}
                        </Card>
                    </>
                )}

                {selected && isStaff && (
                    <Card style={{
                        order: listFirst ? 1 : 0,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        overflow: 'hidden',
                        maxHeight: 'calc(100vh - 160px)',
                        minHeight: 'calc(100vh - 160px)',
                    }}>
                        {/* Header */}
                        <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${theme.border}`, flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h2 style={{ fontSize: 15, fontWeight: 600, color: theme.text, margin: 0, lineHeight: 1.35 }}>{selected.subject}</h2>
                                    <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
                                        {selected.customerName} · {selected.customerEmail || 'Guest'} · {selected.priority} priority
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {chatFocus && (
                                        <button type="button" onClick={() => setListDrawerOpen(true)} style={layoutBtn}>
                                            Tickets
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => updateChatLayout({ mode: chatFocus ? 'split' : 'focus' })}
                                        style={{ ...layoutBtn, color: chatFocus ? theme.primary : theme.textDim }}
                                        title={chatFocus ? 'Show ticket list beside chat' : 'Expand chat to full width'}
                                    >
                                        {chatFocus ? 'Split view' : 'Full screen'}
                                    </button>
                                    {!chatFocus && (
                                        <button
                                            type="button"
                                            onClick={() => updateChatLayout({ panelOrder: listFirst ? 'chat-first' : 'list-first' })}
                                            style={layoutBtn}
                                            title={listFirst ? 'Move chat to the left' : 'Move chat to the right'}
                                        >
                                            {listFirst ? 'Chat ← left' : 'Chat → right'}
                                        </button>
                                    )}
                                    <button type="button" onClick={closeTicket} style={layoutBtn}>
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingBottom: 2 }}>
                                <Select value={selected.status} onChange={(e) => updateStatus(e.target.value)} disabled={!canManageTicket} style={{ width: 'auto', minWidth: 120, marginBottom: 0, fontSize: 12, opacity: canManageTicket ? 1 : 0.6, flexShrink: 0 }}>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </Select>
                                {isTicketSlaBreached(selected) && (
                                    <StatusBadge status="error" label={ticketSlaLabel(selected)} />
                                )}
                                {selected.slaEscalated && <StatusBadge status="error" label="Escalated" />}
                                {selected.adminTakeover && <StatusBadge status="info" label="Admin takeover" />}
                                {isAdmin && ticketOpen && !selected.adminTakeover && (
                                    <PrimaryButton onClick={handleTakeover} disabled={takingOver} style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}>
                                        {takingOver ? 'Taking over…' : 'Take over'}
                                    </PrimaryButton>
                                )}
                                {auth.role === 'SUPPORT_AGENT' && !selected.assigneeId && (
                                    <PrimaryButton onClick={assignToMe} style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}>Assign to me</PrimaryButton>
                                )}
                                {auth.role === 'SUPPORT_AGENT' && !selected.transferredToSales && (
                                    transferringId === selected.id && transferMode === 'agent' ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                            <Select value={transferAgentId} onChange={(e) => setTransferAgentId(e.target.value)} style={{ marginBottom: 0, fontSize: 12, minWidth: 140 }}>
                                                <option value="">Agent…</option>
                                                {agents.filter((a) => !a.self).map((a) => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </Select>
                                            <PrimaryButton onClick={() => handleTransferToAgent(selected.id)} style={{ fontSize: 10, padding: '4px 8px' }}>Transfer</PrimaryButton>
                                            <button type="button" onClick={() => { setTransferringId(null); setTransferMode(null); setTransferNote(''); setTransferAgentId(''); }} style={{ ...toolbarBtn, fontSize: 10, padding: '4px 8px' }}>Cancel</button>
                                        </div>
                                    ) : transferringId === selected.id && transferMode === 'sales' ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                            <PrimaryButton onClick={() => handleTransferToSales(selected.id)} style={{ fontSize: 10, padding: '4px 8px' }}>To Sales</PrimaryButton>
                                            <button type="button" onClick={() => { setTransferringId(null); setTransferMode(null); setTransferNote(''); }} style={{ ...toolbarBtn, fontSize: 10, padding: '4px 8px' }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button type="button" onClick={() => { setTransferringId(selected.id); setTransferMode('agent'); }} style={{ ...toolbarBtn, flexShrink: 0 }}>To Agent</button>
                                            <button type="button" onClick={() => { setTransferringId(selected.id); setTransferMode('sales'); }} style={{ ...toolbarBtn, color: theme.accent, flexShrink: 0 }}>To Sales</button>
                                        </>
                                    )
                                )}
                            </div>
                            {(isAdmin && (adminNoteOnly || adminCanReplyToCustomer)) && (
                                <div style={{
                                    marginTop: 10,
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: theme.textMuted,
                                    border: `1px solid ${theme.border}`,
                                    background: adminNoteOnly ? 'rgba(251,191,36,0.08)' : 'rgba(52,211,153,0.08)',
                                }}>
                                    {adminNoteOnly
                                        ? 'Oversight mode - internal notes only. Take over or wait for SLA escalation to reply to the customer.'
                                        : (selected.adminTakeover ? 'You have taken over - customer replies enabled.' : 'SLA escalated - you may reply to the customer.')}
                                </div>
                            )}
                        </div>

                        {/* Scrollable body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', minHeight: 0 }}>
                            {selected.description && (
                                <details style={{ marginBottom: 10, fontSize: 13 }}>
                                    <summary style={{ cursor: 'pointer', color: theme.textMuted, fontSize: 12, marginBottom: 6 }}>Original request</summary>
                                    <p style={{ color: theme.text, margin: '6px 0 0', lineHeight: 1.5 }}>{selected.description}</p>
                                </details>
                            )}
                            {canMergeTickets && duplicates.length > 0 && (
                                <details style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: `0.5px solid ${theme.warning}44`, background: 'rgba(245,158,11,0.06)' }}>
                                    <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: theme.warning }}>
                                        {duplicates.length} possible duplicate{duplicates.length > 1 ? 's' : ''}
                                    </summary>
                                    {duplicates.map((dup) => (
                                        <div key={dup.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', padding: '8px 0', borderTop: `0.5px solid ${theme.border}`, marginTop: 8 }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{dup.ticketNumber} - {dup.subject}</div>
                                                <div style={{ fontSize: 11, color: theme.textDim }}>{dup.reason}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                <button type="button" onClick={() => openTicket(dup.id)} style={{ ...toolbarBtn, fontSize: 10, padding: '4px 8px' }}>View</button>
                                                <button type="button" disabled={mergingId === dup.id} onClick={() => openMergeConfirm(dup.id)} style={{ ...toolbarBtn, fontSize: 10, padding: '4px 8px', background: theme.warning, color: '#111', border: 'none' }}>
                                                    {mergingId === dup.id ? '…' : 'Merge'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </details>
                            )}
                            {selected.attachmentUrl && (
                                <img src={assetUrl(selected.attachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 10 }} />
                            )}
                            {canUseCopilot && (
                                <TicketCopilotPanel ticketId={selected.id} onUseReply={(text) => setReply(text)} />
                            )}

                            <div style={{ marginTop: 8 }}>
                                {timeline.length ? timeline.map((item) => {
                                    const mine = item.authorId === auth.userId;
                                    const isSystem = item.messageType === 'system';
                                    return (
                                        <div key={item.id || `${item.createdAt}-${item.message}`}>
                                            <ChatMessageRow
                                                message={{
                                                    ...item,
                                                    messageType: item.messageType || (isSystem ? 'system' : 'text'),
                                                }}
                                                isMine={mine}
                                                showAvatar={!mine && !isSystem}
                                            />
                                            {!isSystem && item.internalNote && (
                                                <div style={{ fontSize: 10, color: theme.warning, margin: '-10px 0 10px', textAlign: mine ? 'right' : 'left', paddingLeft: mine ? 0 : 42 }}>
                                                    Internal note
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No messages yet. Send the first reply below.</p>
                                )}
                            </div>
                        </div>

                        {/* Reply footer */}
                        <div style={{ padding: '12px 16px', borderTop: `0.5px solid ${theme.border}`, flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
                            {canChat ? (
                                <form onSubmit={sendReply}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        {isStaff && !adminNoteOnly && macros.length > 0 && (
                                            <Select value={selectedMacroId} onChange={(e) => applyMacro(e.target.value)} style={{ marginBottom: 0, fontSize: 12, width: 'auto', minWidth: 140, flexShrink: 0 }}>
                                                <option value="">Macro…</option>
                                                {macros.map((macro) => (
                                                    <option key={macro.id} value={macro.id}>{macro.label}</option>
                                                ))}
                                            </Select>
                                        )}
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder={adminNoteOnly ? 'Internal note for the team…' : 'Reply to customer…'}
                                            rows={3}
                                            style={{ ...inputStyle, flex: 1, minWidth: 200, minHeight: 72, resize: 'none', marginBottom: 0 }}
                                            required
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                                            {isStaff && !adminNoteOnly && (
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textMuted, whiteSpace: 'nowrap' }}>
                                                    <input type="checkbox" checked={internalNote} onChange={(e) => setInternalNote(e.target.checked)} />
                                                    Internal
                                                </label>
                                            )}
                                            <PrimaryButton type="submit" style={{ whiteSpace: 'nowrap' }}>
                                                {adminNoteOnly ? 'Add note' : 'Send'}
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <p style={{ fontSize: 13, color: theme.textDim, margin: 0 }}>This ticket is closed or transferred - chat is read-only.</p>
                            )}
                        </div>
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
        </>
    );
}