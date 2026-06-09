import { Link } from 'react-router-dom';
import { theme, cardStyle } from '../../styles/theme';

export function WelcomeBanner({ title, subtitle, badge, children }) {
    return (
        <div style={{
            ...cardStyle,
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(43,92,230,0.25), rgba(13,24,48,0.95))',
            border: `0.5px solid ${theme.borderHover}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: theme.fontHeading, fontSize: 28, fontWeight: 800, color: theme.text, marginBottom: 8 }}>{title}</h1>
                    <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 8 }}>{subtitle}</p>
                    {badge && (
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            background: `${theme.success}22`,
                            color: theme.success,
                        }}>
                            {badge}
                        </span>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}

export function QuickActions({ actions }) {
    return (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {actions.map((a) => {
                    const style = {
                        ...cardStyle,
                        padding: 16,
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: theme.text,
                        cursor: 'pointer',
                        border: `0.5px solid ${theme.border}`,
                        background: 'rgba(255,255,255,0.03)',
                    };
                    const inner = (
                        <>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                            <div style={{ fontSize: 13 }}>{a.label}</div>
                        </>
                    );
                    if (a.to) return <Link key={a.label} to={a.to} style={style}>{inner}</Link>;
                    return <button key={a.label} type="button" onClick={a.onClick} style={{ ...style, fontFamily: theme.fontBody }}>{inner}</button>;
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
                        <span style={{ color: theme.text }}>{item.label}{item.overloaded ? ' ⚠️' : ''}</span>
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
    return (
        <span style={{ color: theme.warning, fontSize: 14 }}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
        </span>
    );
}

export function StatusToggle({ value, options, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
                    padding: '6px 12px', borderRadius: 20, border: `0.5px solid ${value === opt.value ? theme.accent : theme.border}`,
                    background: value === opt.value ? 'rgba(43,92,230,0.25)' : 'transparent',
                    color: value === opt.value ? theme.accent : theme.textMuted,
                    fontSize: 12, cursor: 'pointer', fontFamily: theme.fontBody,
                }}>
                    {opt.icon} {opt.label}
                </button>
            ))}
        </div>
    );
}

export function ProgressStat({ title, value, target, icon, unit = '' }) {
    const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
        <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ fontSize: 12, color: theme.accent }}>{pct}%</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: theme.text }}>{value}{unit}</div>
            <div style={{ fontSize: 13, color: theme.accent, marginBottom: 10 }}>{title}</div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>Target: {target}{unit}</div>
        </div>
    );
}
