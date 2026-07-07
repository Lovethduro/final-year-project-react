import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Card, SearchInput, PrimaryButton, Alert, Select } from './components/ui';
import { BackLink } from './components/BackLink';
import { ChatInboxList, ChatInboxItem, ChatPanel, ChatPanelHeader, ChatPanelBody } from './components/ChatMessage';
import { useAuth } from './hooks/useAuth';
import { salesApi } from './utils/apiClient';
import { theme, inputStyle } from './styles/theme';

const CATEGORY_LABELS = {
    product: 'Products',
    discount: 'Discount policy',
    objection: 'Objections',
    process: 'Process',
    general: 'General',
};

const EMPTY_FORM = {
    title: '',
    category: 'product',
    productCategory: '',
    summary: '',
    body: '',
    maxDiscountPercent: '',
    supervisorApprovalAbove: '',
    keywords: '',
    pinned: false,
    active: true,
    sortOrder: 0,
};

function CategoryBadge({ category }) {
    const colors = {
        product: theme.accent,
        discount: theme.warning,
        objection: theme.error,
        process: theme.success,
        general: theme.textDim,
    };
    return (
        <>
        <span style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors[category] || theme.textDim,
        }}>
            {CATEGORY_LABELS[category] || category}
        </span>
        </>
    );
}

function DiscountRules({ entry }) {
    if (entry.maxDiscountPercent == null && entry.supervisorApprovalAbove == null) return null;
    return (
        <div style={{
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 6,
            background: 'rgba(251,191,36,0.08)',
            border: `1px solid rgba(251,191,36,0.25)`,
        }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.warning, marginBottom: 8 }}>Discount rules</div>
            {entry.maxDiscountPercent != null && (
                <div style={{ fontSize: 13, color: theme.text, marginBottom: 4 }}>
                    Max discount without escalation: <strong>{entry.maxDiscountPercent}%</strong>
                </div>
            )}
            {entry.supervisorApprovalAbove != null && (
                <div style={{ fontSize: 13, color: theme.textMuted }}>
                    Supervisor approval required above: <strong>{entry.supervisorApprovalAbove}%</strong>
                </div>
            )}
        </div>
    );
}

export default function SalesPlaybookPage() {
    const auth = useAuth();
    const canManage = auth.isAdmin || auth.isSupervisor;
    const [entries, setEntries] = useState([]);
    const [active, setActive] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        salesApi.playbookList(category || undefined, search || undefined)
            .then((data) => setEntries(data || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [category, search]);

    useEffect(() => { load(); }, [load]);

    const openEntry = async (id) => {
        setError('');
        try {
            const detail = await salesApi.playbookGet(id);
            setActive(detail);
        } catch (err) {
            setError(err.message);
        }
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setForm({
            title: entry.title || '',
            category: entry.category || 'general',
            productCategory: entry.productCategory || '',
            summary: entry.summary || '',
            body: entry.body || '',
            maxDiscountPercent: entry.maxDiscountPercent ?? '',
            supervisorApprovalAbove: entry.supervisorApprovalAbove ?? '',
            keywords: entry.keywords || '',
            pinned: !!entry.pinned,
            active: entry.active !== false,
            sortOrder: entry.sortOrder ?? 0,
        });
        setShowForm(true);
    };

    const saveEntry = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            ...form,
            maxDiscountPercent: form.maxDiscountPercent === '' ? null : Number(form.maxDiscountPercent),
            supervisorApprovalAbove: form.supervisorApprovalAbove === '' ? null : Number(form.supervisorApprovalAbove),
            sortOrder: Number(form.sortOrder) || 0,
        };
        try {
            if (editingId) {
                await salesApi.playbookUpdate(editingId, payload);
            } else {
                await salesApi.playbookCreate(payload);
            }
            setShowForm(false);
            setEditingId(null);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeEntry = async (id) => {
        if (!window.confirm('Delete this playbook entry?')) return;
        setError('');
        try {
            await salesApi.playbookDelete(id);
            if (active?.id === id) setActive(null);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const field = (key) => ({
        value: form[key],
        onChange: (e) => setForm((f) => ({
            ...f,
            [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        })),
    });

    return (
    <>
                    <PageHeader
                title="Sales Playbook"
                subtitle="Product guides, discount rules, and talk tracks for customer enquiries"
                action={(
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {!auth.isAdmin && (
                            <BackLink to="/sales/messages" label="Return to messages" />
                        )}
                        {canManage && <PrimaryButton onClick={startCreate}>Add guide</PrimaryButton>}
                    </div>
                )}
            />
            {error && <Alert type="error">{error}</Alert>}

            {showForm && canManage && (
                <Card title={editingId ? 'Edit guide' : 'New guide'} style={{ marginBottom: 16 }}>
                    <form onSubmit={saveEntry}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Title</label>
                                <input {...field('title')} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Category</label>
                                <Select {...field('category')}>
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Product line (optional)</label>
                                <input {...field('productCategory')} placeholder="CCTV, Solar, ICT…" style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Short summary</label>
                            <input {...field('summary')} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Guide content</label>
                            <textarea {...field('body')} required rows={10} style={{ ...inputStyle, minHeight: 180, lineHeight: 1.55 }} placeholder="Use blank lines between sections. Bullet points with • work well." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Max discount %</label>
                                <input {...field('maxDiscountPercent')} type="number" min="0" max="100" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Supervisor above %</label>
                                <input {...field('supervisorApprovalAbove')} type="number" min="0" max="100" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Sort order</label>
                                <input {...field('sortOrder')} type="number" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 6 }}>Search keywords</label>
                                <input {...field('keywords')} placeholder="cctv,solar,price" style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: theme.textMuted }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.pinned} onChange={field('pinned').onChange} />
                                Pin to top
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.active} onChange={field('active').onChange} />
                                Published
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save guide'}</PrimaryButton>
                            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={{ ...inputStyle, width: 'auto', padding: '10px 20px', cursor: 'pointer', background: 'transparent', color: theme.textMuted }}>Cancel</button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="cyforce-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: 16, alignItems: 'stretch' }}>
                <Card title="Guides" style={{ marginBottom: 0 }}>
                    <div style={{ marginBottom: 12 }}>
                        <SearchInput value={search} onChange={setSearch} placeholder="Search playbook…" />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        <button type="button" onClick={() => setCategory('')} style={{
                            padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: theme.fontBody,
                            border: `1px solid ${!category ? theme.primary : theme.border}`,
                            background: !category ? 'rgba(43,92,230,0.12)' : 'transparent',
                            color: !category ? theme.text : theme.textMuted,
                        }}>All</button>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                            <button key={k} type="button" onClick={() => setCategory(k)} style={{
                                padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: theme.fontBody,
                                border: `1px solid ${category === k ? theme.primary : theme.border}`,
                                background: category === k ? 'rgba(43,92,230,0.12)' : 'transparent',
                                color: category === k ? theme.text : theme.textMuted,
                            }}>{v}</button>
                        ))}
                    </div>
                    {loading ? (
                        <p style={{ color: theme.textDim, fontSize: 13 }}>Loading…</p>
                    ) : (
                        <ChatInboxList>
                            {entries.length ? entries.map((entry) => (
                                <ChatInboxItem
                                    key={entry.id}
                                    active={active?.id === entry.id}
                                    onClick={() => openEntry(entry.id)}
                                    title={`${entry.pinned ? '⭐ ' : ''}${entry.title}`}
                                    subtitle={[CATEGORY_LABELS[entry.category], entry.productCategory, entry.summary].filter(Boolean).join(' · ')}
                                />
                            )) : (
                                <p style={{ color: theme.textDim, fontSize: 13, padding: '8px 14px' }}>No guides found.</p>
                            )}
                        </ChatInboxList>
                    )}
                </Card>

                <ChatPanel>
                    {active ? (
                        <>
                            <ChatPanelHeader>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <CategoryBadge category={active.category} />
                                        {active.productCategory && (
                                            <span style={{ fontSize: 12, color: theme.textMuted }}>{active.productCategory}</span>
                                        )}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: theme.text }}>{active.title}</h2>
                                    {active.summary && (
                                        <p style={{ margin: '8px 0 0', fontSize: 14, color: theme.textMuted }}>{active.summary}</p>
                                    )}
                                </div>
                            </ChatPanelHeader>
                            <ChatPanelBody>
                                <DiscountRules entry={active} />
                                <div style={{
                                    fontSize: 14,
                                    color: theme.text,
                                    lineHeight: 1.65,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {active.body}
                                </div>
                            </ChatPanelBody>
                            {canManage && (
                                <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8 }}>
                                    <PrimaryButton onClick={() => startEdit(active)} style={{ fontSize: 13, padding: '8px 14px' }}>Edit</PrimaryButton>
                                    <button type="button" onClick={() => removeEntry(active.id)} style={{
                                        padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`,
                                        background: 'transparent', color: theme.error, cursor: 'pointer', fontSize: 13, fontFamily: theme.fontBody,
                                    }}>Delete</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                            <p style={{ color: theme.textDim, fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
                                Select a guide to read product advice, discount limits, and objection handling scripts.
                            </p>
                        </div>
                    )}
                </ChatPanel>
            </div>
    </>
    );
}