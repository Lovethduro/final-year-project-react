import { theme, cardStyle, inputStyle, buttonPrimary, buttonGhost } from '../styles/theme';

export function PageHeader({ title, subtitle, action }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
                <h1 style={{ fontFamily: theme.fontHeading, fontSize: 32, fontWeight: 800, color: theme.text, marginBottom: 8 }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 14, color: theme.textMuted, fontFamily: theme.fontBody }}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function StatCard({ title, value, icon, trend, status = 'info', progress, progressLabel }) {
    const colors = { success: theme.success, warning: theme.warning, error: theme.error, info: theme.accent };
    return (
        <div style={{ ...cardStyle, padding: 20, transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                {trend && (
                    <span style={{ fontSize: 12, color: trend.isPositive ? theme.success : theme.error }}>
                        {trend.isPositive ? '+' : '-'}{trend.value}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: colors[status] || theme.accent }}>{title}</div>
            {progress != null && (
                <>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 12 }}>
                        <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: theme.primary, borderRadius: 4 }} />
                    </div>
                    {progressLabel && <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>{progressLabel}</div>}
                </>
            )}
        </div>
    );
}

export function StatusBadge({ status, label }) {
    const map = {
        active: theme.success,
        online: theme.success,
        success: theme.success,
        approved: theme.success,
        pending: theme.warning,
        warning: theme.warning,
        inactive: '#64748B',
        error: theme.error,
        info: theme.accent,
    };
    const color = map[status] || theme.accent;
    return (
        <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: `${color}22`,
            color,
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'capitalize',
        }}>
            {label || status}
        </span>
    );
}

export function Card({ title, children, style }) {
    return (
        <div style={{ ...cardStyle, ...style }}>
            {title && <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.text, marginBottom: 16, fontFamily: theme.fontHeading }}>{title}</h2>}
            {children}
        </div>
    );
}

export function DataTable({ columns, rows, emptyMessage = 'No data found' }) {
    if (!rows.length) {
        return <p style={{ color: theme.textMuted, fontFamily: theme.fontBody }}>{emptyMessage}</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: theme.fontBody }}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={{
                                textAlign: 'left',
                                padding: '12px 14px',
                                fontSize: 11,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: theme.textDim,
                                borderBottom: `0.5px solid ${theme.border}`,
                            }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={row.id || idx}>
                            {columns.map((col) => (
                                <td key={col.key} style={{
                                    padding: '14px',
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.85)',
                                    borderBottom: `0.5px solid ${theme.border}`,
                                }}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, maxWidth: 320 }}
        />
    );
}

export function PrimaryButton({ children, onClick, disabled, type = 'button', style }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled} style={{ ...buttonPrimary, opacity: disabled ? 0.6 : 1, ...style }}>
            {children}
        </button>
    );
}

export function GhostButton({ children, onClick }) {
    return <button onClick={onClick} style={buttonGhost}>{children}</button>;
}

export function FilterSelect({ value, onChange, options }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
            {options.map((opt) => <option key={opt} value={opt} style={{ background: theme.bgCard }}>{opt}</option>)}
        </select>
    );
}

export function Alert({ type = 'info', children }) {
    const colors = { info: theme.accent, success: theme.success, error: theme.error, warning: theme.warning };
    return (
        <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 16,
            background: `${colors[type]}15`,
            border: `0.5px solid ${colors[type]}44`,
            color: colors[type],
            fontFamily: theme.fontBody,
            fontSize: 14,
        }}>
            {children}
        </div>
    );
}
