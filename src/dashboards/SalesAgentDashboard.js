import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, DataTable, StatusBadge, PrimaryButton, Alert } from '../components/ui';
import { WelcomeBanner, QuickActions, ActivityTimeline, PipelineBarChart, DonutChart, ProgressStat } from '../components/dashboard/DashboardWidgets';
import { useAuth } from '../hooks/useAuth';
import { salesApi } from '../utils/apiClient';
import { theme, cardStyle } from '../styles/theme';

const TIPS = [
    'Follow up with hot leads within 24 hours to boost conversion.',
    'Personalize your outreach — mention the prospect\'s company by name.',
    'Log every call to keep your pipeline accurate.',
    'Focus on qualified leads with scores above 70.',
];

const PIPELINE_STAGES = [
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'converted', label: 'Closed Won' },
];

const SOURCE_COLORS = { website: '#38BDF8', referral: '#34D399', event: '#FBBF24', cold_call: '#A78BFA', social: '#F472B6' };

const TASKS = [
    { id: 1, time: '10:00 AM', type: 'Call', company: 'Acme Corp', contact: 'John Smith', done: false },
    { id: 2, time: '2:00 PM', type: 'Demo', company: 'TechStart', contact: 'Sarah J.', done: false },
    { id: 3, time: '4:30 PM', type: 'Follow-up', company: 'Solar NG', contact: 'Ibrahim M.', done: true },
];

function formatRelative(iso) {
    if (!iso) return 'Recently';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
}

export default function SalesAgentDashboard() {
    const auth = useAuth();
    const [stats, setStats] = useState(null);
    const [leads, setLeads] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [tasks, setTasks] = useState(TASKS);
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });
    const [error, setError] = useState('');

    const tip = TIPS[new Date().getDate() % TIPS.length];

    const load = () => {
        salesApi.stats().then(setStats).catch(() => {});
        salesApi.leads().then(setLeads).catch(() => setLeads([]));
        salesApi.quotes().then(setQuotes).catch(() => setQuotes([]));
    };

    useEffect(() => { load(); }, []);

    const converted = leads.filter((l) => l.status === 'converted').length;
    const qualified = leads.filter((l) => l.status === 'qualified').length;
    const pipelineValue = leads.reduce((sum, l) => sum + (l.score || 0) * 10000, 0);
    const conversionRate = leads.length ? Math.round((converted / leads.length) * 100) : 0;
    const monthlyTarget = 10;
    const monthlyProgress = Math.min(100, Math.round((converted / monthlyTarget) * 100));

    const hotLeads = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0)).filter((l) => (l.score || 0) >= 60).slice(0, 3);

    const pipelineData = PIPELINE_STAGES.map((stage) => {
        let count = 0;
        if (stage.key === 'proposal') {
            count = leads.filter((l) => l.status === 'qualified' && (l.score || 0) >= 70 && (l.score || 0) < 85).length;
        } else if (stage.key === 'negotiation') {
            count = leads.filter((l) => l.status === 'qualified' && (l.score || 0) >= 85).length;
        } else {
            count = leads.filter((l) => (l.status || 'new') === stage.key).length;
        }
        return { label: stage.label, count };
    });

    const sourceCounts = leads.reduce((acc, l) => {
        const src = (l.source || 'website').toLowerCase();
        acc[src] = (acc[src] || 0) + 1;
        return acc;
    }, {});
    const donutSlices = Object.entries(sourceCounts).map(([label, value]) => ({
        label: label.replace('_', ' '),
        value,
        color: SOURCE_COLORS[label] || theme.accent,
    }));

    const opportunities = leads
        .filter((l) => ['qualified', 'contacted'].includes(l.status))
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 4);

    const activity = leads.slice(0, 5).map((l) => ({
        title: `${l.name} — ${l.status || 'new'} (${l.source || 'website'})`,
        time: formatRelative(l.updatedAt || l.createdAt),
    }));

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
                title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${auth.fullName || 'Sales Agent'}!`}
                subtitle={`💡 ${tip}`}
            />

            {error && <Alert type="error">{error}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                <ProgressStat title="Monthly Target" value={converted} target={monthlyTarget} icon="🎯" unit=" deals" />
                <div style={{ ...cardStyle, padding: 20 }}>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>{converted}</div>
                    <div style={{ fontSize: 13, color: theme.success }}>Deals Closed</div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }}>
                    <span style={{ fontSize: 24 }}>🔥</span>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>{stats?.totalLeads ?? leads.length}</div>
                    <div style={{ fontSize: 13, color: theme.accent }}>Active Leads</div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }}>
                    <span style={{ fontSize: 24 }}>💰</span>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>₦{(pipelineValue / 1000000).toFixed(1)}M</div>
                    <div style={{ fontSize: 13, color: theme.warning }}>Pipeline Value</div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }}>
                    <span style={{ fontSize: 24 }}>📈</span>
                    <div style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>{conversionRate}%</div>
                    <div style={{ fontSize: 13, color: theme.accent }}>Conversion Rate</div>
                </div>
                <div style={{ ...cardStyle, padding: 20 }}>
                    <span style={{ fontSize: 24 }}>💵</span>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, margin: '12px 0 4px' }}>₦{(converted * 150000).toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: theme.success }}>Commission Earned</div>
                </div>
            </div>

            <QuickActions actions={[
                { icon: '➕', label: 'Add Lead', onClick: () => setShowForm(true) },
                { icon: '📄', label: 'Create Quote', onClick: () => alert('Quote creation coming soon.') },
                { icon: '📞', label: 'Log Call', onClick: () => alert('Call logging coming soon.') },
                { icon: '💬', label: 'Customer Messages', to: '/sales/messages' },
                { icon: '👥', label: 'Customers', to: '/dashboard/customers' },
                { icon: '📊', label: 'Pipeline', to: '/dashboard/leads' },
            ]} />

            {hotLeads.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 24, border: `0.5px solid ${theme.warning}44` }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.warning, marginBottom: 16 }}>🔥 Hot Leads Alert</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                        {hotLeads.map((lead) => (
                            <div key={lead.id} style={{ background: 'rgba(251,191,36,0.08)', borderRadius: 12, padding: 16, border: `0.5px solid ${theme.warning}33` }}>
                                <div style={{ fontWeight: 600, color: theme.text, marginBottom: 4 }}>{lead.name}</div>
                                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8 }}>{lead.company || lead.email}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                                    <span style={{ color: theme.accent }}>Score: {lead.score}</span>
                                    <span style={{ color: theme.success }}>₦{((lead.score || 50) * 10000).toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 10 }}>Last contact: {formatRelative(lead.updatedAt)}</div>
                                <a href={`tel:${lead.phone || ''}`} style={{ display: 'inline-block', padding: '8px 16px', background: theme.primary, color: '#fff', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>
                                    Call Now
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <Card title="Add New Lead" style={{ marginBottom: 24 }}>
                    <form onSubmit={addLead}>
                        <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        <input style={inputStyle} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <input style={inputStyle} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                        <select style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="event">Event</option>
                            <option value="cold_call">Cold Call</option>
                            <option value="social">Social</option>
                        </select>
                        <PrimaryButton type="submit">Save Lead</PrimaryButton>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20, alignItems: 'start' }}>
                <div>
                    <Card title="Sales Pipeline" style={{ marginBottom: 20 }}>
                        <PipelineBarChart stages={pipelineData} />
                    </Card>

                    <Card title="My Top Opportunities">
                        {opportunities.length ? opportunities.map((opp) => (
                            <div key={opp.id} style={{ padding: '14px 0', borderBottom: `0.5px solid ${theme.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ color: theme.text, fontWeight: 600 }}>{opp.name}</span>
                                    <span style={{ color: theme.success }}>₦{((opp.score || 50) * 10000).toLocaleString()}</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 6 }}>
                                    <div style={{ width: `${opp.score || 50}%`, height: '100%', background: theme.primary, borderRadius: 4 }} />
                                </div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>
                                    {opp.score}% probability · Close: {formatRelative(opp.updatedAt)} · Next: Follow up call
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: theme.textDim, fontSize: 14 }}>No opportunities yet. Add leads to build your pipeline.</p>
                        )}
                    </Card>
                </div>

                <div>
                    <Card title="Upcoming Tasks" style={{ marginBottom: 20 }}>
                        {tasks.map((task) => (
                            <label key={task.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: `0.5px solid ${theme.border}`, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => setTasks(tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t))}
                                />
                                <div style={{ opacity: task.done ? 0.5 : 1 }}>
                                    <div style={{ fontSize: 13, color: theme.text }}>{task.time} · {task.type}</div>
                                    <div style={{ fontSize: 12, color: theme.textMuted }}>{task.company} — {task.contact}</div>
                                </div>
                            </label>
                        ))}
                    </Card>

                    <Card title="Recent Activity" style={{ marginBottom: 20 }}>
                        <ActivityTimeline items={activity} />
                    </Card>

                    <Card title="Lead Sources" style={{ marginBottom: 20 }}>
                        {donutSlices.length ? <DonutChart slices={donutSlices} /> : <p style={{ color: theme.textDim, fontSize: 13 }}>No lead data yet.</p>}
                    </Card>

                    <Card title="Team Leaderboard">
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{ fontSize: 40, fontWeight: 800, color: theme.accent }}>#2</div>
                            <div style={{ fontSize: 14, color: theme.text, marginTop: 4 }}>Your rank this month</div>
                            <div style={{ fontSize: 12, color: theme.textDim, marginTop: 8 }}>{converted} deals · {qualified} qualified leads</div>
                        </div>
                    </Card>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <Link to="/dashboard/leads" style={{ color: theme.accent, fontSize: 14 }}>View all leads →</Link>
            </div>
        </DashboardLayout>
    );
}
