import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Card, Alert, DataTable, StatusBadge, PrimaryButton } from './components/ui';
import {
    MetricCard,
    DonutChart,
    PipelineBarChart,
    LineChart,
    GaugeChart,
    HorizontalBarChart,
    StarRating,
} from './components/dashboard/DashboardWidgets';
import { analyticsApi } from './utils/apiClient';
import { theme } from './styles/theme';

const CHART_COLORS = ['#1A4A9E', '#6366F1', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C', '#1A4A9E'];

function ChartLegendItem({ color, label }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.textMuted }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            {label}
        </span>
    );
}

function toDonutSlices(items) {
    return (items || []).map((item, index) => ({
        label: item.source || item.label || item.team,
        value: item.count || item.ticketsResolved || 0,
        display: item.pct != null
            ? `${item.pct}% (${item.count ?? 0})`
            : String(item.count ?? item.ticketsResolved ?? 0),
        color: CHART_COLORS[index % CHART_COLORS.length],
    })).filter((slice) => slice.value > 0);
}

function toBarItems(items, valueKey = 'count') {
    return (items || []).map((item) => ({
        label: item.source || item.label || item.team,
        value: item[valueKey] || 0,
    }));
}

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        Promise.all([
            analyticsApi.overview(),
            analyticsApi.performance(),
        ])
            .then(([overview, performance]) => {
                setData(overview);
                setAgents(performance || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const leadSources = data?.leadSources || [];
    const hearAboutUs = data?.hearAboutUsBreakdown || [];
    const leadPipeline = (data?.leadPipeline || []).filter((stage) => stage.count > 0);
    const ticketStatuses = data?.ticketStatusBreakdown || [];
    const ticketPriorities = data?.ticketPriorityBreakdown || [];
    const ticketCategories = data?.ticketCategoryBreakdown || [];
    const teamPerformance = data?.teamPerformance || [];
    const insights = data?.insights || [];
    const leadTrend = (data?.leadTrendMonthly || []).map((point) => ({
        label: point.label,
        total: point.count,
    }));
    const ticketTrend = data?.ticketTrendWeekly || [];
    const resolutionRate = data?.resolutionRatePercent ?? 0;
    const csat = data?.averageCsat ?? 0;

    const topAgents = agents.slice(0, 5).map((agent) => ({
        label: agent.name,
        value: Number(agent.ticketsResolved || 0) + Number(agent.leadsConverted || 0),
    }));

    return (
        <>
                    <PageHeader
                title="Analytics"
                subtitle="Charts and live CRM metrics for leads, support, acquisition, and team performance"
                action={(
                    <PrimaryButton onClick={load} disabled={loading}>
                        {loading ? 'Refreshing…' : 'Refresh data'}
                    </PrimaryButton>
                )}
            />
            {error && <Alert type="error">{error}</Alert>}

            {loading && !data ? (
                <p style={{ color: theme.textDim }}>Loading analytics…</p>
            ) : (
                <>
                    {insights.length > 0 && (
                        <Card title="Key insights" style={{ marginBottom: 20 }}>
                            <ul style={{ margin: 0, paddingLeft: 20, color: theme.textMuted, fontSize: 14, lineHeight: 1.8 }}>
                                {insights.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                        </Card>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <MetricCard label="Total Leads" value={data?.totalLeads ?? 0} detail={`${data?.leadsThisMonth ?? 0} this month`} accent={theme.primary} />
                        <MetricCard label="Lead Conversion" value={`${data?.leadConversionRate ?? 0}%`} detail={`${data?.convertedLeads ?? 0} converted`} accent={theme.success} />
                        <MetricCard label="Total Tickets" value={data?.totalTickets ?? 0} detail={`${data?.ticketsThisMonth ?? 0} this month`} accent={theme.accent} />
                        <MetricCard label="Open Tickets" value={data?.openTickets ?? 0} detail={`${data?.resolvedTickets ?? 0} resolved`} accent={theme.warning} />
                        <MetricCard label="Customers" value={data?.totalCustomers ?? 0} detail={`${data?.totalAgents ?? 0} active agents`} accent="#A78BFA" />
                        <MetricCard
                            label="Avg CSAT"
                            value={csat > 0 ? `${csat}/5` : '-'}
                            detail={data?.feedbackCount ? `${data.feedbackCount} ratings` : 'No feedback yet'}
                            accent={theme.success}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Ticket resolution rate">
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                                <GaugeChart percent={resolutionRate} label="Resolved" size={140} />
                            </div>
                            <p style={{ textAlign: 'center', fontSize: 13, color: theme.textMuted, margin: 0 }}>
                                {data?.resolvedTickets ?? 0} of {data?.totalTickets ?? 0} tickets resolved or closed
                            </p>
                        </Card>

                        <Card title="Lead sources">
                            {leadSources.length ? (
                                <DonutChart slices={toDonutSlices(leadSources)} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No lead source data yet.</p>
                            )}
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Lead pipeline">
                            {leadPipeline.length ? (
                                <PipelineBarChart stages={leadPipeline.map((s) => ({ label: s.label, count: s.count }))} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No leads in the pipeline yet.</p>
                            )}
                        </Card>

                        <Card title="Ticket status mix">
                            {ticketStatuses.length ? (
                                <DonutChart slices={toDonutSlices(ticketStatuses)} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No ticket data yet.</p>
                            )}
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="New leads - last 6 months">
                            <LineChart data={leadTrend} series={['total']} height={160} />
                        </Card>

                        <Card title="Support activity - last 7 days">
                            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                                <ChartLegendItem color={theme.primary} label="Created" />
                                <ChartLegendItem color={theme.success} label="Resolved" />
                                <ChartLegendItem color={theme.warning} label="Open backlog" />
                            </div>
                            <LineChart data={ticketTrend} series={['total', 'resolved', 'open']} height={160} />
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="How customers heard about us">
                            {hearAboutUs.length ? (
                                <DonutChart slices={toDonutSlices(hearAboutUs)} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>Registration responses will appear here.</p>
                            )}
                        </Card>

                        <Card title="Tickets by priority">
                            <HorizontalBarChart items={toBarItems(ticketPriorities)} />
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Tickets by category">
                            {ticketCategories.length ? (
                                <DonutChart slices={toDonutSlices(ticketCategories)} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No ticket categories yet.</p>
                            )}
                        </Card>

                        <Card title="Sales vs support teams">
                            {teamPerformance.length ? (
                                <>
                                    <HorizontalBarChart items={toBarItems(teamPerformance, 'ticketsResolved')} />
                                    <DataTable
                                        columns={[
                                            { key: 'team', label: 'Team' },
                                            { key: 'agents', label: 'Agents' },
                                            { key: 'ticketsResolved', label: 'Resolved' },
                                            { key: 'openTickets', label: 'Open' },
                                            { key: 'leadsOwned', label: 'Leads' },
                                            { key: 'leadsConverted', label: 'Converted' },
                                        ]}
                                        rows={teamPerformance}
                                        emptyMessage="No team data."
                                    />
                                </>
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No team activity yet.</p>
                            )}
                        </Card>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <Card title="Top performers">
                            {topAgents.length ? (
                                <HorizontalBarChart items={topAgents} />
                            ) : (
                                <p style={{ color: theme.textDim, fontSize: 13 }}>No agent activity yet.</p>
                            )}
                            <p style={{ fontSize: 12, color: theme.textDim, marginTop: 12, marginBottom: 0 }}>
                                Score combines resolved tickets and converted leads.
                            </p>
                        </Card>

                        <Card title="Lead source breakdown">
                            <DataTable
                                columns={[
                                    { key: 'source', label: 'Source' },
                                    { key: 'count', label: 'Count' },
                                    { key: 'pct', label: 'Share', render: (r) => `${r.pct}%` },
                                ]}
                                rows={leadSources}
                                emptyMessage="No data."
                            />
                        </Card>
                    </div>

                    <Card title="Pipeline stage details">
                        <DataTable
                            columns={[
                                { key: 'label', label: 'Stage' },
                                { key: 'count', label: 'Leads' },
                                {
                                    key: 'share',
                                    label: 'Share',
                                    render: (r) => {
                                        const total = data?.totalLeads || 0;
                                        const pct = total ? Math.round((r.count / total) * 100) : 0;
                                        return `${pct}%`;
                                    },
                                },
                            ]}
                            rows={data?.leadPipeline || []}
                            emptyMessage="No pipeline data."
                        />
                    </Card>

                    <Card title="Agent performance leaderboard" style={{ marginTop: 20 }}>
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Agent' },
                                { key: 'role', label: 'Role' },
                                { key: 'ticketsResolved', label: 'Resolved' },
                                { key: 'openTickets', label: 'Open' },
                                { key: 'leadsOwned', label: 'Leads' },
                                { key: 'leadsConverted', label: 'Converted' },
                                { key: 'avgResponse', label: 'Avg response' },
                                {
                                    key: 'rating',
                                    label: 'Rating',
                                    render: (row) => (
                                        typeof row.rating === 'number'
                                            ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <StatusBadge status="success" label={`${row.rating}/5`} />
                                                    <StarRating rating={row.rating} />
                                                </span>
                                            )
                                            : row.rating
                                    ),
                                },
                            ]}
                            rows={agents}
                            emptyMessage="No agent performance data yet."
                        />
                    </Card>
                </>
            )}
        </>
    );
}