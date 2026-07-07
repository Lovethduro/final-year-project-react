import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Card, DataTable, StatusBadge, StatCard, PrimaryButton, Alert, FilterSelect } from './components/ui';
import { LineChart, StarRating } from './components/dashboard/DashboardWidgets';
import { feedbackApi } from './utils/apiClient';
import { theme } from './styles/theme';

const SENTIMENT_OPTIONS = ['All Sentiment', 'Positive', 'Neutral', 'Negative'];

const ghostButtonStyle = {
    padding: '8px 14px',
    borderRadius: 8,
    border: `0.5px solid ${theme.border}`,
    background: 'rgba(255,255,255,0.03)',
    color: theme.text,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: theme.fontBody,
};

function trendLabel(value, suffix = '%') {
    if (value == null || Number.isNaN(value)) return null;
    const positive = value >= 0;
    return {
        value: Math.abs(value),
        suffix,
        isPositive: positive,
    };
}

function sentimentStatus(sentiment) {
    if (sentiment === 'Positive') return 'success';
    if (sentiment === 'Neutral') return 'warning';
    return 'error';
}

export default function FeedbackPage() {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [sentimentFilter, setSentimentFilter] = useState('All Sentiment');
    const [showSurveyInfo, setShowSurveyInfo] = useState(false);

    useEffect(() => {
        setLoading(true);
        feedbackApi.overview()
            .then(setOverview)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const stats = overview?.stats || {};
    const sentiment = overview?.sentiment || {};
    const trend = overview?.trend || [];

    const filteredRecent = useMemo(() => {
        const rows = overview?.recent || [];
        if (sentimentFilter === 'All Sentiment') return rows;
        return rows.filter((row) => row.sentiment === sentimentFilter);
    }, [overview?.recent, sentimentFilter]);

    const headerActions = (
        <PrimaryButton onClick={() => setShowSurveyInfo(true)}>Create Survey</PrimaryButton>
    );

    return (
        <>
                    <PageHeader
                title="Feedback & Customer Satisfaction"
                subtitle="Monitor customer feedback and satisfaction metrics"
                action={headerActions}
            />
            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard
                    title="Overall CSAT"
                    value={loading ? '…' : `${stats.csat || 0}/5`}
                    trend={trendLabel(stats.csatTrend)}
                    status="success"
                />
                <StatCard
                    title="NPS Score"
                    value={loading ? '…' : String(stats.nps ?? 0)}
                    trend={trendLabel(stats.npsTrend, '')}
                    status="info"
                />
                <StatCard
                    title="Total Reviews"
                    value={loading ? '…' : Number(stats.totalReviews || 0).toLocaleString()}
                    trend={trendLabel(stats.reviewsTrend)}
                    status="warning"
                />
                <StatCard
                    title="Response Rate"
                    value={loading ? '…' : `${stats.responseRate ?? 0}%`}
                    trend={trendLabel(stats.responseRateTrend, ' pts')}
                    status="success"
                />
            </div>

            <div className="cyforce-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', gap: 20, marginBottom: 20 }}>
                <Card title="Satisfaction Trend (6 Months)">
                    {loading ? (
                        <p style={{ color: theme.textDim, fontSize: 13 }}>Loading trend…</p>
                    ) : (
                        <LineChart data={trend} series={['value']} height={180} />
                    )}
                    <p style={{ fontSize: 11, color: theme.textDim, marginTop: 8 }}>
                        Score scale: average rating × 10 (e.g. 4.6 CSAT ≈ 46)
                    </p>
                </Card>

                <Card title="Feedback Sentiment">
                    {[
                        { key: 'positive', label: 'Positive Feedback', color: theme.success },
                        { key: 'neutral', label: 'Neutral Feedback', color: theme.warning },
                        { key: 'negative', label: 'Negative Feedback', color: theme.error },
                    ].map((item) => (
                        <div key={item.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: theme.text }}>{item.label}</span>
                                <span style={{ fontSize: 13, color: theme.textMuted }}>
                                    {loading ? '…' : Number(sentiment[item.key] || 0).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                                <div style={{
                                    width: `${sentiment[`${item.key}Percent`] || 0}%`,
                                    height: '100%',
                                    background: item.color,
                                    borderRadius: 4,
                                }} />
                            </div>
                            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>
                                {loading ? '…' : `${sentiment[`${item.key}Percent`] || 0}% of total feedback`}
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            <Card title={(
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>Recent Feedback</span>
                    <FilterSelect
                        value={sentimentFilter}
                        onChange={setSentimentFilter}
                        options={SENTIMENT_OPTIONS}
                        style={{ marginBottom: 0, minWidth: 160 }}
                    />
                </div>
            )}>
                {loading ? (
                    <p style={{ color: theme.textDim, fontSize: 13 }}>Loading feedback…</p>
                ) : (
                    <DataTable
                        columns={[
                            { key: 'displayId', label: 'ID', render: (row) => row.displayId || row.id?.slice(-6).toUpperCase() },
                            { key: 'customerName', label: 'Customer' },
                            { key: 'agentName', label: 'Agent', render: (row) => row.agentName || '—' },
                            {
                                key: 'rating',
                                label: 'Rating',
                                render: (row) => (row.rating ? <StarRating rating={row.rating} /> : '—'),
                            },
                            {
                                key: 'comment',
                                label: 'Comment',
                                render: (row) => (
                                    <span style={{ fontSize: 13, color: theme.textMuted, maxWidth: 320, display: 'inline-block' }}>
                                        {row.comment || '—'}
                                    </span>
                                ),
                            },
                            {
                                key: 'sentiment',
                                label: 'Sentiment',
                                render: (row) => <StatusBadge status={sentimentStatus(row.sentiment)} label={row.sentiment} />,
                            },
                            { key: 'dateLabel', label: 'Date', render: (row) => row.dateLabel || '—' },
                        ]}
                        rows={filteredRecent}
                        emptyMessage="No feedback matches this filter."
                    />
                )}
            </Card>

            {showSurveyInfo && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    zIndex: 1000,
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 480,
                        background: theme.bg,
                        border: `0.5px solid ${theme.border}`,
                        borderRadius: 14,
                        padding: 24,
                    }}>
                        <h2 style={{ margin: '0 0 8px', color: theme.text, fontSize: 18 }}>Customer Surveys</h2>
                        <p style={{ margin: '0 0 16px', color: theme.textMuted, fontSize: 14, lineHeight: 1.6 }}>
                            Purchase satisfaction surveys are sent automatically after a customer pays an invoice.
                            Support and sales ratings are collected when customers rate closed tickets or conversations.
                        </p>
                        <p style={{ margin: '0 0 20px', color: theme.textDim, fontSize: 13, lineHeight: 1.5 }}>
                            Custom survey campaigns can be added in a future release.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowSurveyInfo(false)} style={ghostButtonStyle}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}