import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatusBadge, PrimaryButton, Alert, Select, GhostButton } from '../components/ui';
import {
    WelcomeBanner,
    QuickActions,
    ActivityTimeline,
    PipelineBarChart,
    DonutChart,
    ProgressStat,
    MetricCard,
    HorizontalBarChart,
} from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { salesApi } from '../utils/apiClient';
import { theme, inputStyle } from '../styles/theme';
import { greetingTitle, formatDashboardDateTime } from '../utils/greeting';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    const naira = kobo / 100;
    if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
    return `₦${Math.round(naira).toLocaleString()}`;
}

function firstName(fullName) {
    return (fullName || 'Agent').trim().split(/\s+/)[0];
}

function initials(name) {
    return (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function leadStatusTone(status) {
    const s = (status || 'new').toLowerCase();
    if (s === 'qualified' || s === 'converted') return 'success';
    if (s === 'contacted' || s === 'proposal') return 'info';
    if (s === 'lost') return 'error';
    return 'warning';
}

function CardLink({ to, children }) {
    return (
        <Link to={to} style={{ fontSize: 12, color: theme.accent, textDecoration: 'none', fontWeight: 500 }}>
            {children}
        </Link>
    );
}

function SectionEmpty({ message, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '28px 16px' }}>
            <p style={{ color: theme.textMuted, fontSize: 14, margin: '0 0 12px' }}>{message}</p>
            {action}
        </div>
    );
}

function LeadAvatar({ name }) {
    return (
        <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#0F172A',
            flexShrink: 0,
        }}>
            {initials(name)}
        </div>
    );
}

function ComparisonTile({ label, value, sub, accent }) {
    return (
        <div style={{
            padding: '14px 16px',
            borderRadius: 10,
            background: 'rgba(15,23,42,0.03)',
            border: `0.5px solid ${theme.border}`,
            textAlign: 'center',
        }}>
            <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.textDim, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: accent || theme.text, lineHeight: 1.2 }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

export default function SalesAgentDashboard() {
    const auth = useAuth();
    const [overview, setOverview] = useState(null);
    const [bonuses, setBonuses] = useState(null);
    const [dealsComparison, setDealsComparison] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        Promise.all([
            salesApi.overview(),
            salesApi.bonuses().catch(() => null),
            salesApi.dealsComparison().catch(() => null),
        ])
            .then(([overviewData, bonusData, dealsData]) => {
                setOverview(overviewData);
                setBonuses(bonusData);
                setDealsComparison(dealsData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const stats = overview?.stats || {};
    const hotLeads = overview?.hotLeads || [];
    const opportunities = overview?.opportunities || [];
    const pipelineData = (overview?.pipeline || []).map((s) => ({ label: s.label, count: s.count }));
    const donutSlices = (overview?.leadSources || []).map((s) => ({
        label: s.label,
        value: s.value,
        color: s.color || theme.accent,
    }));
    const activity = overview?.recentActivity || [];
    const tasks = overview?.upcomingTasks || [];
    const myRank = overview?.myRank;
    const unreadMessages = overview?.unreadConversations ?? 0;
    const targetPct = stats.monthlyTarget > 0
        ? Math.min(100, Math.round(((stats.convertedThisMonth ?? 0) / stats.monthlyTarget) * 100))
        : 0;

    const markContacted = async (leadId) => {
        setError('');
        try {
            await salesApi.updateLead(leadId, { status: 'contacted' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const addLead = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await salesApi.createLead(form);
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', company: '', source: 'website' });
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const rankBadge = myRank?.rank
        ? `Rank #${myRank.rank} this month`
        : dealsComparison?.myRank
            ? `Rank #${dealsComparison.myRank} on team`
            : undefined;

    const messageBadge = unreadMessages > 0
        ? `${unreadMessages} open conversation${unreadMessages > 1 ? 's' : ''}`
        : undefined;

    const comparisonBars = (dealsComparison?.agents || []).map((agent) => ({
        label: `#${agent.rank} ${agent.agentName}`,
        value: agent.dealsClosed,
    }));

    const formField = { ...inputStyle, marginBottom: 0 };

    return (
        <>
            <WelcomeBanner
                title={greetingTitle(firstName(auth.fullName))}
                subtitle={formatDashboardDateTime()}
                badge={messageBadge || rankBadge}
            >
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textDim, marginBottom: 4 }}>
                        Monthly target
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>
                        {stats.convertedThisMonth ?? 0}
                        <span style={{ fontSize: 14, fontWeight: 500, color: theme.textMuted }}> / {stats.monthlyTarget ?? 10}</span>
                    </div>
                    <div style={{ fontSize: 12, color: targetPct >= 100 ? theme.success : theme.accent, marginTop: 4 }}>
                        {targetPct}% complete
                    </div>
                </div>
            </WelcomeBanner>

            {error && <Alert type="error">{error}</Alert>}
            {loading && !overview && (
                <p style={{ color: theme.textMuted, marginBottom: 16, fontSize: 14 }}>Loading your dashboard…</p>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                <ProgressStat
                    title="Monthly Target"
                    value={stats.convertedThisMonth ?? 0}
                    target={stats.monthlyTarget ?? 10}
                    unit=" deals"
                />
                <MetricCard label="Deals Closed" value={stats.converted ?? stats.convertedLeads ?? 0} detail="Won this period" accent={theme.success} />
                <MetricCard label="Active Leads" value={stats.totalLeads ?? 0} detail="In pipeline" accent={theme.accent} />
                <MetricCard label="Pipeline Value" value={formatNaira(stats.pipelineValueKobo)} detail="Open opportunities" accent={theme.warning} />
                <MetricCard label="Conversion" value={`${stats.conversionRate ?? 0}%`} detail="Lead to close" accent={theme.primary} />
                <MetricCard label="Bonuses Earned" value={formatNaira(bonuses?.totalBonusKobo ?? stats.commissionKobo)} detail="All time" accent={theme.success} />
            </div>

            <QuickActions actions={[
                { label: 'Add Lead', onClick: () => setShowForm((v) => !v) },
                { label: unreadMessages ? `Messages (${unreadMessages})` : 'Messages', to: '/sales/messages' },
                { label: 'Pipeline', to: '/dashboard/leads' },
                { label: 'Sales', to: '/dashboard/sales' },
                { label: 'Playbook', to: '/sales/playbook' },
                { label: 'Customers', to: '/dashboard/customers' },
            ]} />

            {showForm && (
                <Card title="Add New Lead" style={{ marginBottom: 24 }}>
                    <form onSubmit={addLead}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>Full name</label>
                                <input style={formField} placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>Email</label>
                                <input style={formField} type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>Phone</label>
                                <input style={formField} placeholder="+234 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>Company</label>
                                <input style={formField} placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>Source</label>
                                <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ marginBottom: 0 }}>
                                    <option value="website">Website</option>
                                    <option value="referral">Referral</option>
                                    <option value="event">Event</option>
                                    <option value="cold_call">Cold Call</option>
                                    <option value="social">Social</option>
                                </Select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <PrimaryButton type="submit">Save Lead</PrimaryButton>
                            <GhostButton type="button" onClick={() => setShowForm(false)}>Cancel</GhostButton>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: 20, alignItems: 'start' }}>
                <div>
                    <Card
                        title={(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                <span>Priority Leads</span>
                                <CardLink to="/dashboard/leads">View all →</CardLink>
                            </div>
                        )}
                        style={{ marginBottom: 20 }}
                    >
                        {hotLeads.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {hotLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        style={{
                                            display: 'flex',
                                            gap: 14,
                                            padding: 14,
                                            borderRadius: 10,
                                            background: 'rgba(15,23,42,0.03)',
                                            border: `0.5px solid ${theme.border}`,
                                        }}
                                    >
                                        <LeadAvatar name={lead.name} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: theme.text, fontSize: 14 }}>{lead.name}</div>
                                                    <div style={{ fontSize: 12, color: theme.textMuted }}>{lead.company || lead.email}</div>
                                                </div>
                                                <StatusBadge status={leadStatusTone(lead.status)} label={(lead.status || 'new').replace('_', ' ')} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, marginBottom: 10 }}>
                                                <span style={{ color: theme.success, fontWeight: 600 }}>{formatNaira(lead.valueKobo)}</span>
                                                <span style={{ color: theme.accent }}>Score {lead.score ?? '-'}</span>
                                                <span style={{ color: theme.textDim }}>Last contact: {lead.lastContact || '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {lead.phone && (
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: theme.primary, color: '#fff',
                                                            borderRadius: 8,
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        Call
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => markContacted(lead.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: 'transparent',
                                                        color: theme.text,
                                                        border: `0.5px solid ${theme.border}`,
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Log contact
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <SectionEmpty
                                message="No priority leads right now. Add prospects to start building your pipeline."
                                action={<PrimaryButton type="button" onClick={() => setShowForm(true)}>Add Lead</PrimaryButton>}
                            />
                        )}
                    </Card>

                    <Card
                        title={(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                <span>Sales Pipeline</span>
                                <CardLink to="/dashboard/sales">Open pipeline →</CardLink>
                            </div>
                        )}
                        style={{ marginBottom: 20 }}
                    >
                        {pipelineData.length
                            ? <PipelineBarChart stages={pipelineData} />
                            : <SectionEmpty message="No pipeline stages yet. Convert leads to see your funnel." />}
                    </Card>

                    <Card
                        title={(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                <span>Top Opportunities</span>
                                <CardLink to="/dashboard/leads">Manage leads →</CardLink>
                            </div>
                        )}
                        style={{ marginBottom: 20 }}
                    >
                        {opportunities.length ? (
                            <div>
                                {opportunities.map((opp) => (
                                    <div key={opp.id} style={{ padding: '14px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                                            <div>
                                                <div style={{ color: theme.text, fontWeight: 600, fontSize: 14 }}>{opp.name}</div>
                                                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                                                    {(opp.status || 'open').replace('_', ' ')} · {opp.lastContact || 'No recent contact'}
                                                </div>
                                            </div>
                                            <div style={{ color: theme.success, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                                                {formatNaira(opp.valueKobo)}
                                            </div>
                                        </div>
                                        <div style={{ height: 6, background: 'rgba(15,23,42,0.08)', borderRadius: 4 }}>
                                            <div style={{
                                                width: `${Math.min(100, opp.score || 0)}%`,
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                                                borderRadius: 4,
                                            }} />
                                        </div>
                                        <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>{opp.score ?? 0}% win likelihood</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <SectionEmpty message="No opportunities yet. Qualify leads to surface deals here." />
                        )}
                    </Card>

                    {dealsComparison && (
                        <Card title="Team Performance" style={{ marginBottom: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
                                <ComparisonTile
                                    label="Your rank"
                                    value={`#${dealsComparison.myRank || '-'}`}
                                    sub={`${dealsComparison.myDealsClosed ?? 0} deals closed`}
                                    accent={theme.accent}
                                />
                                <ComparisonTile
                                    label="Team average"
                                    value={dealsComparison.teamAverage ?? 0}
                                    sub="deals per agent"
                                />
                                <ComparisonTile
                                    label="Top performer"
                                    value={dealsComparison.highest?.dealsClosed ?? 0}
                                    sub={dealsComparison.highest?.agentName || '-'}
                                    accent={theme.success}
                                />
                            </div>
                            {comparisonBars.length > 0 && (
                                <HorizontalBarChart items={comparisonBars} maxValue={dealsComparison.highest?.dealsClosed || undefined} />
                            )}
                        </Card>
                    )}

                    {bonuses?.items?.length > 0 && (
                        <Card title="Recent Bonuses">
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
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                            <StatusBadge status={item.type === 'deal' ? 'success' : 'info'} label={item.type === 'deal' ? 'Deal' : 'Target'} />
                                            <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.title}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                                            {item.customerName} · {item.bonusLabel}
                                            {item.closedAt && ` · ${new Date(item.closedAt).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.success, whiteSpace: 'nowrap' }}>
                                        +{formatNaira(item.bonusKobo)}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}
                </div>

                <div>
                    <Card title="Today's Follow-ups" style={{ marginBottom: 20 }}>
                        {tasks.length ? (
                            <div>
                                {tasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: 'flex',
                                            gap: 12,
                                            alignItems: 'flex-start',
                                            padding: '12px 0',
                                            borderBottom: index < tasks.length - 1 ? `0.5px solid ${theme.border}` : undefined,
                                        }}
                                    >
                                        <div style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: theme.warning,
                                            marginTop: 6,
                                            flexShrink: 0,
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{task.time} · {task.type}</div>
                                            <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{task.company} - {task.contact}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => markContacted(task.leadId)}
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 500,
                                                color: theme.accent,
                                                background: 'rgba(0,45,114,0.1)',
                                                border: `0.5px solid ${theme.border}`,
                                                borderRadius: 6,
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                            }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>No follow-ups scheduled for today.</p>
                        )}
                    </Card>

                    <Card title="Recent Activity" style={{ marginBottom: 20 }}>
                        <ActivityTimeline items={activity} />
                    </Card>

                    <Card title="Lead Sources" style={{ marginBottom: 20 }}>
                        {donutSlices.length
                            ? <DonutChart slices={donutSlices} />
                            : <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>Source breakdown appears once you have leads.</p>}
                    </Card>

                    <Card title="Leaderboard">
                        {myRank?.rank ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '16px 12px',
                                marginBottom: 12,
                                borderRadius: 10,
                                background: 'rgba(0,45,114,0.08)',
                                border: `0.5px solid ${theme.border}`,
                            }}>
                                <div style={{ fontSize: 36, fontWeight: 800, color: theme.accent, lineHeight: 1 }}>#{myRank.rank}</div>
                                <div style={{ fontSize: 13, color: theme.text, marginTop: 6 }}>Your position this month</div>
                                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6 }}>
                                    {myRank.converted} won · {myRank.qualified} qualified
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: theme.textMuted, fontSize: 13, textAlign: 'center', margin: '0 0 12px' }}>Ranking updates as you close deals.</p>
                        )}
                        {(overview?.leaderboard || []).slice(0, 5).map((entry, index) => (
                            <div
                                key={entry.agentId}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: 13,
                                    padding: '10px 0',
                                    borderTop: index === 0 && !myRank?.rank ? undefined : `0.5px solid ${theme.border}`,
                                    color: entry.currentUser ? theme.accent : theme.text,
                                    fontWeight: entry.currentUser ? 600 : 400,
                                }}
                            >
                                <span>#{entry.rank} {entry.agentName}</span>
                                <span style={{ color: theme.textMuted }}>{entry.converted} won</span>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </>
    );
}
