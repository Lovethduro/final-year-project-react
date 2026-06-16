import { Link } from 'react-router-dom';
import { theme, dashboardCardStyle } from '../../styles/theme';

export function MetricCard({ label, value, detail, accent = theme.accent, trend }) {
    return (
        <div style={{ ...dashboardCardStyle, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textDim, marginBottom: 8, fontWeight: 500 }}>
                {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: value?.length > 8 ? 22 : 26, fontWeight: 600, color: theme.text, lineHeight: 1.2 }}>
                    {value}
                </div>
                {trend != null && (
                    <span style={{ fontSize: 12, color: trend >= 0 ? theme.success : theme.error }}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            {detail && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{detail}</div>}
            <div style={{ width: '100%', height: 2, background: accent, borderRadius: 1, marginTop: 12, opacity: 0.7 }} />
        </div>
    );
}

export function WelcomeBanner({ title, subtitle, badge, children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: theme.fontHeading, fontSize: 24, fontWeight: 600, color: theme.text, margin: '0 0 6px' }}>{title}</h1>
                    {subtitle && <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>{subtitle}</p>}
                    {badge && (
                        <span style={{
                            display: 'inline-block',
                            marginTop: 10,
                            padding: '3px 10px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            background: 'rgba(52,211,153,0.12)',
                            color: theme.success,
                            border: `1px solid rgba(52,211,153,0.25)`,
                        }}>
                            {badge}
                        </span>
                    )}
                </div>
                {children}
            </div>
            <div style={{ height: 1, background: theme.border, marginTop: 20 }} />
        </div>
    );
}

export function QuickActions({ actions }) {
    return (
        <div style={{ ...dashboardCardStyle, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: '0 0 14px', letterSpacing: '0.01em' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {actions.map((a) => {
                    const style = {
                        padding: '8px 14px',
                        borderRadius: 6,
                        textDecoration: 'none',
                        color: theme.text,
                        cursor: 'pointer',
                        border: `1px solid ${theme.border}`,
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: theme.fontBody,
                    };
                    const inner = <span>{a.label}</span>;
                    if (a.to) return <Link key={a.label} to={a.to} style={style}>{inner}</Link>;
                    return <button key={a.label} type="button" onClick={a.onClick} style={style}>{inner}</button>;
                })}
            </div>
        </div>
    );
}

export function ActivityTimeline({ items }) {
    return (
        <div>
            {items.length ? items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, marginTop: 6, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 13, color: theme.text }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: theme.textDim }}>{item.time}</div>
                    </div>
                </div>
            )) : <p style={{ color: theme.textDim, fontSize: 13 }}>No recent activity.</p>}
        </div>
    );
}

export function PipelineBarChart({ stages }) {
    const max = Math.max(...stages.map((s) => s.count), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, paddingTop: 8 }}>
            {stages.map((stage) => (
                <div key={stage.label} style={{ flex: 1, textAlign: 'center', minWidth: 48 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 6 }}>{stage.count}</div>
                    <div style={{
                        height: `${(stage.count / max) * 120}px`,
                        minHeight: stage.count > 0 ? 8 : 4,
                        background: `linear-gradient(180deg, ${theme.primary}, ${theme.accent})`,
                        borderRadius: '6px 6px 0 0',
                        margin: '0 auto',
                        width: '70%',
                    }} />
                    <div style={{ fontSize: 10, color: theme.textDim, marginTop: 8, lineHeight: 1.2 }}>{stage.label}</div>
                </div>
            ))}
        </div>
    );
}

export function DonutChart({ slices }) {
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    let offset = 0;
    const gradient = slices.map((slice) => {
        const pct = (slice.value / total) * 100;
        const part = `${slice.color} ${offset}% ${offset + pct}%`;
        offset += pct;
        return part;
    }).join(', ');

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: total > 0 ? `conic-gradient(${gradient})` : theme.border,
                flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
                {slices.map((slice) => (
                    <div key={slice.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: theme.textMuted }}><span style={{ color: slice.color }}>●</span> {slice.label}</span>
                        <span style={{ color: theme.text }}>{slice.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LineChart({ data, series = ['total'], height = 140 }) {
    if (!data?.length) return <p style={{ color: theme.textDim, fontSize: 13 }}>No trend data yet.</p>;
    const max = Math.max(...data.flatMap((d) => series.map((k) => d[k] || 0)), 1);
    const colors = { total: theme.primary, resolved: theme.success, open: theme.warning };
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, marginBottom: 8 }}>
                {data.map((point) => (
                    <div key={point.label || point.date} style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                        {series.map((key) => (
                            <div key={key} title={`${key}: ${point[key] || 0}`} style={{
                                width: series.length > 1 ? `${90 / series.length}%` : '70%',
                                height: `${((point[key] || 0) / max) * 100}%`,
                                minHeight: (point[key] || 0) > 0 ? 4 : 2,
                                background: colors[key] || theme.accent,
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.9,
                            }} />
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                {data.map((point, i) => (
                    <div key={point.label || point.date || i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {point.label || point.day}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GaugeChart({ percent = 0, label = '', size = 120 }) {
    const p = Math.min(100, Math.max(0, percent));
    const color = p >= 90 ? theme.success : p >= 70 ? theme.warning : theme.error;
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: size, height: size, borderRadius: '50%', margin: '0 auto',
                background: `conic-gradient(${color} ${p * 3.6}deg, rgba(255,255,255,0.08) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
            }}>
                <div style={{
                    width: size * 0.72, height: size * 0.72, borderRadius: '50%',
                    background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{p}%</span>
                    {label && <span style={{ fontSize: 10, color: theme.textDim }}>{label}</span>}
                </div>
            </div>
        </div>
    );
}

export function HorizontalBarChart({ items, maxValue }) {
    if (!items?.length) return <p style={{ color: theme.textDim, fontSize: 13 }}>No data.</p>;
    const max = maxValue || Math.max(...items.map((i) => i.value), 1);
    return (
        <div>
            {items.map((item) => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: theme.text }}>{item.label}{item.overloaded ? ' (overloaded)' : ''}</span>
                        <span style={{ color: theme.textMuted }}>{item.value}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                        <div style={{
                            width: `${(item.value / max) * 100}%`,
                            height: '100%',
                            background: item.overloaded ? theme.error : `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                            borderRadius: 4,
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StarRating({ rating = 0 }) {
    if (!rating) return null;
    return (
        <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>
            {Number(rating).toFixed(1)}
            <span style={{ color: theme.textDim }}> / 5</span>
        </span>
    );
}

export function StatusToggle({ value, options, onChange }) {
    const dotColors = { available: theme.success, busy: theme.error, away: theme.warning, on_break: theme.textDim };
    return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
                    padding: '6px 12px', borderRadius: 6, border: `1px solid ${value === opt.value ? theme.accent : theme.border}`,
                    background: value === opt.value ? 'rgba(43,92,230,0.15)' : 'transparent',
                    color: value === opt.value ? theme.text : theme.textMuted,
                    fontSize: 12, cursor: 'pointer', fontFamily: theme.fontBody,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[opt.value] || theme.accent, flexShrink: 0 }} />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export function ProgressStat({ title, value, target, unit = '' }) {
    const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
        <div style={{ ...dashboardCardStyle, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textDim, fontWeight: 500 }}>{title}</div>
                <span style={{ fontSize: 12, color: theme.textMuted }}>{pct}%</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: theme.text, marginBottom: 10 }}>{value}{unit}</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: theme.primary, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>Target: {target}{unit}</div>
        </div>
    );
}
