import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader, Card, Alert, StatusBadge, PrimaryButton } from '../components/ui';
import {
    MetricCard,
    PipelineBarChart,
    DonutChart,
    HorizontalBarChart,
    StarRating,
} from '../components/dashboard/DashboardWidgets';
import { salesApi, userApi } from '../utils/apiClient';
import { theme } from '../styles/theme';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    const naira = kobo / 100;
    if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
    return `₦${Math.round(naira).toLocaleString()}`;
}

function buildInsights(stats, dealsComparison, profile) {
    const lines = [];
    const target = stats.monthlyTarget ?? 10;
    const closed = stats.convertedThisMonth ?? 0;

    if (target > 0) {
        if (closed >= target) {
            lines.push(`You have reached your monthly target with ${closed} deal${closed === 1 ? '' : 's'} closed.`);
        } else {
            lines.push(`${target - closed} more deal${target - closed === 1 ? '' : 's'} needed to hit your monthly target of ${target}.`);
        }
    }

    if (dealsComparison?.myRank === 1) {
        lines.push('You are the top-performing sales agent on the team this period.');
    } else if (dealsComparison?.myRank) {
        lines.push(`You are ranked #${dealsComparison.myRank} on the team with ${dealsComparison.myDealsClosed ?? 0} deals closed.`);
    }

    if ((stats.conversionRate ?? 0) >= 25) {
        lines.push(`Strong conversion rate at ${stats.conversionRate}% — keep nurturing qualified leads.`);
    } else if ((stats.totalLeads ?? 0) > 0 && (stats.conversionRate ?? 0) < 10) {
        lines.push('Conversion is below 10% — review follow-ups on open leads in your pipeline.');
    }

    if ((stats.pipelineValueKobo ?? 0) > 0) {
        lines.push(`Open pipeline value is ${formatNaira(stats.pipelineValueKobo)} across active opportunities.`);
    }

    if (profile?.averageRating > 0) {
        lines.push(`Customers rate you ${profile.averageRating.toFixed(1)}/5 across ${profile.ratingCount || 0} review${profile.ratingCount === 1 ? '' : 's'}.`);
    }

    if (!lines.length) {
        lines.push('Add leads and close deals to unlock personalized performance insights.');
    }

    return lines;
}

export default function SalesInsightsPage() {
    const [overview, setOverview] = useState(null);
    const [dealsComparison, setDealsComparison] = useState(null);
    const [bonuses, setBonuses] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        Promise.all([
            salesApi.overview(),
            salesApi.dealsComparison().catch(() => null),
            salesApi.bonuses().catch(() => null),
            userApi.getProfile().catch(() => null),
        ])
            .then(([overviewData, dealsData, bonusData, profileData]) => {
                setOverview(overviewData);
                setDealsComparison(dealsData);
                setBonuses(bonusData);
                setProfile(profileData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => overview?.stats || {}, [overview]);
    const insights = useMemo(
        () => buildInsights(stats, dealsComparison, profile),
        [stats, dealsComparison, profile],
    );
    const pipelineData = (overview?.pipeline || []).map((s) => ({ label: s.label, count: s.count }));
    const donutSlices = (overview?.leadSources || []).map((s) => ({
        label: s.label,
        value: s.value,
        color: s.color || theme.accent,
    }));
    const comparisonBars = (dealsComparison?.agents || []).map((agent) => ({
        label: `#${agent.rank} ${agent.agentName}`,
        value: agent.dealsClosed,
    }));

    return (
        <>
            <PageHeader
                title="Sales Insights"
                subtitle="Your pipeline, team standing, bonuses, and performance highlights"
                action={(
                    <PrimaryButton onClick={load} disabled={loading}>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </PrimaryButton>
                )}
            />
            {error && <Alert type="error">{error}</Alert>}

            {loading && !overview ? (
                <p style={{ color: theme.textMuted }}>Loading insights…</p>
            ) : (
                <>
                    <Card title="Key insights" style={{ marginBottom: 20 }}>
                        <ul style={{ margin: 0, paddingLeft: 20, color: theme.textMuted, fontSize: 14, lineHeight: 1.7 }}>
                            {insights.map((line) => <li key={line}>{line}</li>)}
                        </ul>
                    </Card>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 16,
                        marginBottom: 20,
                    }}>
                        <MetricCard label="Deals closed" value={stats.converted ?? stats.convertedLeads ?? 0} detail="This period" accent={theme.success} />
                        <MetricCard label="Active leads" value={stats.totalLeads ?? 0} detail="In pipeline" accent={theme.accent} />
                        <MetricCard label="Conversion" value={`${stats.conversionRate ?? 0}%`} detail="Lead to close" accent={theme.primary} />
                        <MetricCard label="Pipeline value" value={formatNaira(stats.pipelineValueKobo)} detail="Open opportunities" accent={theme.warning} />
                        {profile?.averageRating > 0 && (
                            <MetricCard
                                label="Customer rating"
                                value={`${profile.averageRating.toFixed(1)}/5`}
                                detail={`${profile.ratingCount || 0} reviews`}
                                accent={theme.success}
                            />
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Pipeline by stage">
                            {pipelineData.length ? (
                                <PipelineBarChart stages={pipelineData} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No pipeline data yet.</p>
                            )}
                        </Card>
                        <Card title="Lead sources">
                            {donutSlices.length ? (
                                <DonutChart slices={donutSlices} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No lead source data yet.</p>
                            )}
                        </Card>
                    </div>

                    {dealsComparison && (
                        <Card title="Team standing" style={{ marginBottom: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${theme.border}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: theme.textDim, marginBottom: 6 }}>Your rank</div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: theme.accent }}>#{dealsComparison.myRank || '—'}</div>
                                </div>
                                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${theme.border}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: theme.textDim, marginBottom: 6 }}>Your deals</div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{dealsComparison.myDealsClosed ?? 0}</div>
                                </div>
                                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${theme.border}`, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: theme.textDim, marginBottom: 6 }}>Team average</div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{dealsComparison.teamAverage ?? 0}</div>
                                </div>
                            </div>
                            {comparisonBars.length > 0 && (
                                <HorizontalBarChart items={comparisonBars} maxValue={dealsComparison.highest?.dealsClosed || undefined} />
                            )}
                        </Card>
                    )}

                    {profile?.averageRating > 0 && (
                        <Card title="Your customer feedback" style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <StarRating rating={profile.averageRating} />
                                <span style={{ fontSize: 14, color: theme.text }}>
                                    {profile.averageRating.toFixed(1)} / 5
                                    <span style={{ color: theme.textMuted }}> ({profile.ratingCount || 0} ratings)</span>
                                </span>
                            </div>
                        </Card>
                    )}

                    {bonuses?.items?.length > 0 && (
                        <Card title="Recent bonuses">
                            {bonuses.items.map((item, index) => (
                                <div
                                    key={`${item.type}-${index}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 16,
                                        padding: '14px 0',
                                        borderBottom: index < bonuses.items.length - 1 ? `0.5px solid ${theme.border}` : undefined,
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <StatusBadge status={item.type === 'deal' ? 'success' : 'info'} label={item.type === 'deal' ? 'Deal' : 'Target'} />
                                            <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.title}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                                            {item.customerName} · {item.bonusLabel}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: theme.success, whiteSpace: 'nowrap' }}>
                                        {formatNaira(item.amountKobo)}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}
                </>
            )}
        </>
    );
}
