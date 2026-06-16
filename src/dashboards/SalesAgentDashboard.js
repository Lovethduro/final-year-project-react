import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, StatusBadge, PrimaryButton, Alert, Select } from '../components/ui';
import { WelcomeBanner, QuickActions, ActivityTimeline, PipelineBarChart, DonutChart, ProgressStat, StarRating, MetricCard } from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { salesApi } from '../utils/apiClient';
import { theme } from '../styles/theme';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    const naira = kobo / 100;
    if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
    return `₦${Math.round(naira).toLocaleString()}`;
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

    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 };

    return (
        <DashboardLayout>
            <WelcomeBanner
                title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${auth.fullName || 'Sales Agent'}`}
                subtitle="Track your pipeline, bonuses, and close more deals."
                badge={unreadMessages > 0 ? `${unreadMessages} open conversation${unreadMessages > 1 ? 's' : ''}` : undefined}
            />

            {error && <Alert type="error">{error}</Alert>}
            {loading && !overview && <p style={{ color: theme.textDim, marginBottom: 16 }}>Loading dashboard…</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                <ProgressStat title="Monthly Target" value={stats.convertedThisMonth ?? 0} target={stats.monthlyTarget ?? 10} unit=" deals" />
                <MetricCard label="Deals Closed" value={stats.converted ?? stats.convertedLeads ?? 0} detail="Won this period" accent={theme.success} />
                <MetricCard label="Active Leads" value={stats.totalLeads ?? 0} detail="In pipeline" accent={theme.accent} />
                <MetricCard label="Pipeline Value" value={formatNaira(stats.pipelineValueKobo)} detail="Open opportunities" accent={theme.warning} />
                <MetricCard label="Conversion Rate" value={`${stats.conversionRate ?? 0}%`} detail="Lead to close" accent={theme.accent} />
                <MetricCard label="Total Bonuses" value={formatNaira(bonuses?.totalBonusKobo ?? stats.commissionKobo)} detail="Earned to date" accent={theme.success} />
            </div>

            {dealsComparison && (
                <Card title="Deals Closed — Team Comparison" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center', padding: 12, background: 'rgba(52,211,153,0.08)', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: theme.textDim }}>Highest</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: theme.success }}>{dealsComparison.highest?.agentName || '—'}</div>
                            <div style={{ fontSize: 13, color: theme.text }}>{dealsComparison.highest?.dealsClosed ?? 0} deals</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, background: 'rgba(251,191,36,0.08)', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: theme.textDim }}>Your rank</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: theme.accent }}>#{dealsComparison.myRank || '—'}</div>
                            <div style={{ fontSize: 13, color: theme.text }}>{dealsComparison.myDealsClosed ?? 0} deals</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, background: 'rgba(248,113,113,0.08)', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: theme.textDim }}>Lowest</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: theme.error }}>{dealsComparison.lowest?.agentName || '—'}</div>
                            <div style={{ fontSize: 13, color: theme.text }}>{dealsComparison.lowest?.dealsClosed ?? 0} deals</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, color: theme.textDim }}>Team average</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{dealsComparison.teamAverage ?? 0}</div>
                            <div style={{ fontSize: 13, color: theme.textDim }}>deals / agent</div>
                        </div>
                    </div>
                    {(dealsComparison.agents || []).map((agent) => (
                        <div key={agent.agentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `0.5px solid ${theme.border}`, fontSize: 13 }}>
                            <span style={{ color: theme.text }}>#{agent.rank} {agent.agentName}</span>
                            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ color: theme.success, fontWeight: 600 }}>{agent.dealsClosed} closed</span>
                                {agent.averageRating > 0 && <StarRating rating={agent.averageRating} />}
                            </span>
                        </div>
                    ))}
                </Card>
            )}

            {bonuses?.items?.length > 0 && (
                <Card title="Bonus Breakdown" style={{ marginBottom: 24 }}>
                    {bonuses.items.map((item, index) => (
                        <div key={`${item.type}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <StatusBadge
                                        status={item.type === 'deal' ? 'success' : 'info'}
                                        label={item.type === 'deal' ? 'Deal' : 'Target'}
                                    />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{item.title}</span>
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>
                                    {item.customerName} · {item.bonusLabel}
                                    {item.closedAt && ` · ${new Date(item.closedAt).toLocaleDateString()}`}
                                </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.success, whiteSpace: 'nowrap' }}>
                                +{formatNaira(item.bonusKobo)}
                            </div>
                        </div>
                    ))}
                </Card>
            )}

            <QuickActions actions={[
                { label: 'Add Lead', onClick: () => setShowForm(true) },
                { label: `Messages${unreadMessages ? ` (${unreadMessages})` : ''}`, to: '/sales/messages' },
                { label: 'Sales Playbook', to: '/sales/playbook' },
                { label: 'Customers', to: '/dashboard/customers' },
                { label: 'Pipeline', to: '/dashboard/leads' },
                { label: 'Sales', to: '/dashboard/sales' },
            ]} />

            {hotLeads.length > 0 && (
                <Card title="Priority Leads" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                        {hotLeads.map((lead) => (
                            <div key={lead.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 16, border: `1px solid ${theme.border}` }}>
                                <div style={{ fontWeight: 600, color: theme.text, marginBottom: 4 }}>{lead.name}</div>
                                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8 }}>{lead.company || lead.email}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                    <span style={{ color: theme.accent }}>Score: {lead.score}</span>
                                    <StatusBadge status={lead.status === 'qualified' ? 'success' : 'warning'} label={lead.status} />
                                </div>
                                <div style={{ fontSize: 12, color: theme.success, marginBottom: 8 }}>{formatNaira(lead.valueKobo)}</div>
                                <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 10 }}>Last contact: {lead.lastContact}</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {lead.phone && (
                                        <a href={`tel:${lead.phone}`} style={{ padding: '8px 12px', background: theme.primary, color: '#fff', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>
                                            Call
                                        </a>
                                    )}
                                    <button type="button" onClick={() => markContacted(lead.id)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.08)', color: theme.text, border: `0.5px solid ${theme.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                                        Log contact
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {showForm && (
                <Card title="Add New Lead" style={{ marginBottom: 24 }}>
                    <form onSubmit={addLead}>
                        <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <input style={inputStyle} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="event">Event</option>
                            <option value="cold_call">Cold Call</option>
                            <option value="social">Social</option>
                        </Select>
                        <PrimaryButton type="submit">Save Lead</PrimaryButton>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20, alignItems: 'start' }}>
                <div>
                    <Card title="Sales Pipeline" style={{ marginBottom: 20 }}>
                        {pipelineData.length ? <PipelineBarChart stages={pipelineData} /> : <p style={{ color: theme.textDim, fontSize: 14 }}>No pipeline data yet.</p>}
                    </Card>

                    <Card title="My Top Opportunities">
                        {opportunities.length ? opportunities.map((opp) => (
                            <div key={opp.id} style={{ padding: '14px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ color: theme.text, fontWeight: 600 }}>{opp.name}</span>
                                    <span style={{ color: theme.success }}>{formatNaira(opp.valueKobo)}</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 6 }}>
                                    <div style={{ width: `${Math.min(100, opp.score || 0)}%`, height: '100%', background: theme.primary, borderRadius: 4 }} />
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>
                                    {opp.score}% score · {opp.status} · {opp.lastContact}
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: theme.textDim, fontSize: 14 }}>No opportunities yet. Add leads to build your pipeline.</p>
                        )}
                    </Card>
                </div>

                <div>
                    <Card title="Follow-up Tasks" style={{ marginBottom: 20 }}>
                        {tasks.length ? tasks.map((task) => (
                            <div key={task.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: theme.text }}>{task.time} · {task.type}</div>
                                    <div style={{ fontSize: 12, color: theme.textMuted }}>{task.company} — {task.contact}</div>
                                </div>
                                <button type="button" onClick={() => markContacted(task.leadId)} style={{ fontSize: 11, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Done
                                </button>
                            </div>
                        )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No follow-ups due.</p>}
                    </Card>

                    <Card title="Recent Activity" style={{ marginBottom: 20 }}>
                        <ActivityTimeline items={activity} />
                    </Card>

                    <Card title="Lead Sources" style={{ marginBottom: 20 }}>
                        {donutSlices.length ? <DonutChart slices={donutSlices} /> : <p style={{ color: theme.textDim, fontSize: 13 }}>No lead data yet.</p>}
                    </Card>

                    <Card title="Team Leaderboard">
                        {myRank?.rank ? (
                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                <div style={{ fontSize: 40, fontWeight: 800, color: theme.accent }}>#{myRank.rank}</div>
                                <div style={{ fontSize: 14, color: theme.text, marginTop: 4 }}>Your rank this month</div>
                                <div style={{ fontSize: 12, color: theme.textDim, marginTop: 8 }}>
                                    {myRank.converted} deals · {myRank.qualified} qualified
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: theme.textDim, fontSize: 13, textAlign: 'center' }}>No ranking data yet.</p>
                        )}
                        {(overview?.leaderboard || []).slice(0, 3).map((entry) => (
                            <div key={entry.agentId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderTop: `0.5px solid ${theme.border}`, color: entry.currentUser ? theme.accent : theme.textMuted }}>
                                <span>#{entry.rank} {entry.agentName}</span>
                                <span>{entry.converted} won</span>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <Link to="/dashboard/leads" style={{ color: theme.accent, fontSize: 14 }}>View all leads →</Link>
            </div>
        </DashboardLayout>
    );
}
