import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, SearchInput, StatusBadge, PrimaryButton, Alert, Select } from './components/ui';
import { adminApi, knowledgeBaseApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme } from './styles/theme';

function ArticleList({ articles, onSelect, loading }) {
    if (loading) {
        return <p style={{ color: theme.textDim, fontSize: 14 }}>Loading articles…</p>;
    }
    if (!articles.length) {
        return <p style={{ color: theme.textDim, fontSize: 14 }}>No articles found.</p>;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {articles.map((article) => (
                <button
                    key={article.id}
                    type="button"
                    onClick={() => onSelect(article.id)}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 14,
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: `0.5px solid ${theme.border}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: theme.fontBody,
                    }}
                >
                    <div>
                        <div style={{ color: theme.text, fontWeight: 500, marginBottom: 4 }}>{article.title}</div>
                        <div style={{ fontSize: 12, color: theme.textDim }}>{article.category} · {article.views} views</div>
                    </div>
                    <StatusBadge status={article.status === 'published' ? 'success' : 'pending'} label={article.status} />
                </button>
            ))}
        </div>
    );
}

export function KnowledgeBaseContent({ publicMode = false }) {
    const auth = useAuth();
    const isAdmin = auth.role === 'ADMIN' && !publicMode;
    const [search, setSearch] = useState('');
    const [articles, setArticles] = useState([]);
    const [manageArticles, setManageArticles] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState('');
    const [form, setForm] = useState({
        id: '',
        title: '',
        category: 'General',
        tags: '',
        content: '',
        published: true,
    });

    const loadArticles = useCallback((query = search) => {
        setLoading(true);
        setError('');
        knowledgeBaseApi.list(query)
            .then(setArticles)
            .catch((err) => {
                setError(err.message);
                setArticles([]);
            })
            .finally(() => setLoading(false));
    }, [search]);

    const loadManageArticles = useCallback(() => {
        if (!isAdmin) return;
        adminApi.knowledgeBase()
            .then(setManageArticles)
            .catch((err) => setError(err.message));
    }, [isAdmin]);

    useEffect(() => { loadArticles(''); }, [loadArticles]);
    useEffect(() => { loadManageArticles(); }, [loadManageArticles]);

    useEffect(() => {
        const timer = setTimeout(() => loadArticles(search), 250);
        return () => clearTimeout(timer);
    }, [search, loadArticles]);

    const openArticle = async (id) => {
        setError('');
        try {
            const article = await knowledgeBaseApi.get(id);
            setSelected(article);
            loadArticles(search);
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setForm({
            id: '',
            title: '',
            category: 'General',
            tags: '',
            content: '',
            published: true,
        });
    };

    const editArticle = (article) => {
        setForm({
            id: article.id,
            title: article.title || '',
            category: article.category || 'General',
            tags: article.tags || '',
            content: article.content || '',
            published: article.status === 'published',
        });
        setSuccess('');
        setError('');
    };

    const saveArticle = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                title: form.title.trim(),
                category: form.category.trim(),
                tags: form.tags.trim(),
                content: form.content.trim(),
                published: form.published,
            };
            if (!payload.title) {
                throw new Error('Title is required');
            }
            if (!payload.content) {
                throw new Error('Content is required');
            }
            if (form.id) {
                await adminApi.updateKnowledgeArticle(form.id, payload);
                setSuccess('Article updated.');
            } else {
                await adminApi.createKnowledgeArticle(payload);
                setSuccess('Article created.');
            }
            resetForm();
            loadManageArticles();
            loadArticles(search);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteArticle = async (articleId) => {
        setDeletingId(articleId);
        setError('');
        setSuccess('');
        try {
            await adminApi.deleteKnowledgeArticle(articleId);
            setSuccess('Article deleted.');
            if (form.id === articleId) {
                resetForm();
            }
            loadManageArticles();
            loadArticles(search);
            if (selected?.id === articleId) {
                setSelected(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId('');
        }
    };

    return (
        <>
            {publicMode && (
                <div style={{ marginBottom: 16 }}>
                    <Link to="/support" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>
                        ← Contact Support
                    </Link>
                </div>
            )}
            <PageHeader
                title="Help Center"
                subtitle={publicMode ? 'Browse answers before opening a support ticket' : 'Articles and documentation for customers and support teams'}
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            {isAdmin && (
                <Card title="Knowledge Base Management" style={{ marginBottom: 20 }}>
                    <form onSubmit={saveArticle}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 12 }}>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Article title"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `0.5px solid ${theme.border}`,
                                    borderRadius: 8,
                                    padding: 10,
                                    color: theme.text,
                                    fontFamily: theme.fontBody,
                                }}
                            />
                            <input
                                value={form.category}
                                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                placeholder="Category"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `0.5px solid ${theme.border}`,
                                    borderRadius: 8,
                                    padding: 10,
                                    color: theme.text,
                                    fontFamily: theme.fontBody,
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <input
                                value={form.tags}
                                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                                placeholder="Tags (comma separated)"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `0.5px solid ${theme.border}`,
                                    borderRadius: 8,
                                    padding: 10,
                                    color: theme.text,
                                    fontFamily: theme.fontBody,
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <textarea
                                rows={6}
                                value={form.content}
                                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="Write article content..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `0.5px solid ${theme.border}`,
                                    borderRadius: 8,
                                    padding: 10,
                                    color: theme.text,
                                    fontFamily: theme.fontBody,
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <Select
                                value={form.published ? 'published' : 'draft'}
                                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.value === 'published' }))}
                                style={{ width: 160, marginBottom: 0 }}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </Select>
                            <PrimaryButton type="submit" disabled={saving}>
                                {saving ? 'Saving…' : (form.id ? 'Update Article' : 'Create Article')}
                            </PrimaryButton>
                            {form.id && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        background: 'transparent',
                                        border: `0.5px solid ${theme.border}`,
                                        color: theme.textMuted,
                                        borderRadius: 8,
                                        padding: '8px 14px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                        {manageArticles.map((article) => (
                            <div
                                key={article.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    border: `0.5px solid ${theme.border}`,
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                <div>
                                    <div style={{ color: theme.text, fontSize: 14, marginBottom: 3 }}>{article.title}</div>
                                    <div style={{ color: theme.textDim, fontSize: 12 }}>
                                        {article.category} · {article.views} views
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <StatusBadge status={article.status === 'published' ? 'success' : 'pending'} label={article.status} />
                                    <button
                                        type="button"
                                        onClick={() => editArticle(article)}
                                        style={{
                                            background: 'transparent',
                                            border: `0.5px solid ${theme.border}`,
                                            color: theme.accent,
                                            borderRadius: 6,
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteArticle(article.id)}
                                        disabled={deletingId === article.id}
                                        style={{
                                            background: 'transparent',
                                            border: `0.5px solid ${theme.error}55`,
                                            color: theme.error,
                                            borderRadius: 6,
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            opacity: deletingId === article.id ? 0.6 : 1,
                                        }}
                                    >
                                        {deletingId === article.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!manageArticles.length && (
                            <p style={{ color: theme.textDim, margin: 0 }}>No articles yet.</p>
                        )}
                    </div>
                </Card>
            )}

            <Card>
                <div style={{ marginBottom: 20, maxWidth: 360 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search articles..." />
                </div>
                <ArticleList articles={articles} onSelect={openArticle} loading={loading} />
            </Card>

            {selected && (
                <Card title={selected.title} style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>
                        {selected.category} · {selected.views} views
                    </div>
                    <div style={{ color: theme.text, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {selected.content || 'No content available.'}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelected(null)}
                        style={{ marginTop: 16, background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12 }}
                    >
                        ← Back to articles
                    </button>
                </Card>
            )}
        </>
    );
}

export default function KnowledgeBasePage() {
    return (
        <DashboardLayout>
            <KnowledgeBaseContent />
        </DashboardLayout>
    );
}
