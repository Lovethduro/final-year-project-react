import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, SearchInput, StatusBadge } from './components/ui';
import { theme } from './styles/theme';

const articles = [
    { id: '1', title: 'How to reset your password', category: 'Account', views: 342, status: 'published' },
    { id: '2', title: 'Setting up MFA with authenticator app', category: 'Security', views: 218, status: 'published' },
    { id: '3', title: 'Solar system maintenance guide', category: 'Solar', views: 156, status: 'published' },
    { id: '4', title: 'Troubleshooting network connectivity', category: 'ICT', views: 89, status: 'draft' },
];

export default function KnowledgeBasePage() {
    const [search, setSearch] = useState('');
    const filtered = articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout>
            <PageHeader title="Knowledge Base" subtitle="Articles and documentation for support teams" />
            <Card>
                <div style={{ marginBottom: 20, maxWidth: 360 }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search articles..." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map((article) => (
                        <div key={article.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                            border: `0.5px solid ${theme.border}`,
                        }}>
                            <div>
                                <div style={{ color: theme.text, fontWeight: 500, marginBottom: 4 }}>{article.title}</div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>{article.category} · {article.views} views</div>
                            </div>
                            <StatusBadge status={article.status === 'published' ? 'success' : 'pending'} label={article.status} />
                        </div>
                    ))}
                </div>
            </Card>
        </DashboardLayout>
    );
}
