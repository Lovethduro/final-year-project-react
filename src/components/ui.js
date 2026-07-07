import { theme, dashboardCardStyle, inputStyle, selectStyle, buttonPrimary, buttonGhost } from '../styles/theme';
import { useEffect, useState } from 'react';

export { inputStyle, selectStyle };

export function AvatarInitials({ name, size = 32, fontSize }) {
    const parts = (name || 'User').trim().split(/\s+/).filter(Boolean);
    const initials = parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.slice(0, 2) || 'U').toUpperCase();
    const textSize = fontSize || Math.max(11, Math.round(size * 0.36));

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: textSize,
            fontWeight: 600,
            flexShrink: 0,
            letterSpacing: '0.02em',
        }}>
            {initials}
        </div>
    );
}

export function PageHeader({ title, subtitle, action }) {
    return (
        <div className="cyforce-page-header" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                    <h1 style={{ fontFamily: theme.fontHeading, fontSize: 24, fontWeight: 600, color: theme.text, margin: '0 0 6px' }}>{title}</h1>
                    {subtitle && <p style={{ fontSize: 14, color: theme.textMuted, fontFamily: theme.fontBody, margin: 0 }}>{subtitle}</p>}
                </div>
                {action && <div className="cyforce-page-header-action">{action}</div>}
            </div>
            <div style={{ height: 1, background: theme.border, marginTop: 20 }} />
        </div>
    );
}

export function StatCard({ title, value, trend, status = 'info', progress, progressLabel }) {
    const colors = { success: theme.success, warning: theme.warning, error: theme.error, info: theme.accent };
    const accent = colors[status] || theme.accent;
    return (
        <div style={{ ...dashboardCardStyle, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textDim, fontWeight: 500 }}>{title}</div>
                {trend && (
                    <span style={{ fontSize: 12, color: trend.isPositive ? theme.success : theme.error }}>
                        {trend.isPositive ? '+' : '-'}{trend.value}{trend.suffix ?? '%'}
                    </span>
                )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{value}</div>
            <div style={{ width: '100%', height: 2, background: accent, borderRadius: 1, opacity: 0.7 }} />
            {progress != null && (
                <>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 12 }}>
                        <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: theme.primary, borderRadius: 2 }} />
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
        <div style={{ ...dashboardCardStyle, color: theme.text, ...style }}>
            {title && <h2 style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: '0 0 16px', fontFamily: theme.fontHeading }}>{title}</h2>}
            {children}
        </div>
    );
}

export function DataTable({ columns, rows, emptyMessage = 'No data found', onRowClick, activeRowId }) {
    if (!rows.length) {
        return <p style={{ color: theme.textMuted, fontFamily: theme.fontBody }}>{emptyMessage}</p>;
    }

    const compact = Boolean(onRowClick);

    return (
        <div className="cyforce-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: theme.fontBody }}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={{
                                textAlign: 'left',
                                padding: compact ? '8px 10px' : '12px 14px',
                                fontSize: 11,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: theme.textMuted,
                                borderBottom: `0.5px solid ${theme.border}`,
                            }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => {
                        const isActive = activeRowId && row.id === activeRowId;
                        return (
                            <tr
                                key={row.id || idx}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                style={{
                                    cursor: onRowClick ? 'pointer' : undefined,
                                    background: isActive ? 'rgba(43,92,230,0.12)' : undefined,
                                }}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} style={{
                                        padding: compact ? '10px' : '14px',
                                        fontSize: compact ? 13 : 14,
                                        color: 'rgba(255,255,255,0.85)',
                                        borderBottom: `0.5px solid ${theme.border}`,
                                    }}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
    return (
        <input
            className="cyforce-search-input"
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

export function GhostButton({ children, onClick, disabled, type = 'button', style }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled} style={{ ...buttonGhost, opacity: disabled ? 0.6 : 1, ...style }}>
            {children}
        </button>
    );
}

export function Select({ children, style, className = '', ...props }) {
    return (
        <select
            className={`cyforce-select ${className}`.trim()}
            style={{ ...selectStyle, ...style }}
            {...props}
        >
            {children}
        </select>
    );
}

export function FilterSelect({ value, onChange, options, style }) {
    return (
        <Select value={value} onChange={(e) => onChange(e.target.value)} style={style}>
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </Select>
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

export function ConfirmDialog({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    danger = false,
}) {
    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={loading ? undefined : onCancel}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(4,10,21,0.82)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: theme.bgCard,
                    border: `0.5px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: '28px 32px',
                    width: '100%',
                    maxWidth: 420,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                    fontFamily: theme.fontBody,
                }}
            >
                <h2
                    id="confirm-dialog-title"
                    style={{
                        margin: '0 0 10px',
                        fontFamily: theme.fontHeading,
                        fontSize: 20,
                        fontWeight: 700,
                        color: theme.text,
                    }}
                >
                    {title}
                </h2>
                {message && (
                    <p style={{ margin: '0 0 24px', fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
                        {message}
                    </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <GhostButton onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </GhostButton>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            ...buttonPrimary,
                            background: danger ? theme.error : theme.primary,
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Removing…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ReviewNoteDialog({
    open,
    title,
    message,
    noteLabel = 'Note (optional)',
    notePlaceholder = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    danger = false,
}) {
    const [note, setNote] = useState('');

    useEffect(() => {
        if (open) setNote('');
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-note-dialog-title"
            onClick={loading ? undefined : onCancel}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(4,10,21,0.82)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: theme.bgCard,
                    border: `0.5px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: '28px 32px',
                    width: '100%',
                    maxWidth: 440,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                    fontFamily: theme.fontBody,
                }}
            >
                <h2
                    id="review-note-dialog-title"
                    style={{
                        margin: '0 0 10px',
                        fontFamily: theme.fontHeading,
                        fontSize: 20,
                        fontWeight: 700,
                        color: theme.text,
                    }}
                >
                    {title}
                </h2>
                {message && (
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
                        {message}
                    </p>
                )}
                <label style={{ display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 }}>
                    {noteLabel}
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={notePlaceholder}
                    rows={3}
                    disabled={loading}
                    style={{ ...inputStyle, width: '100%', marginBottom: 24, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <GhostButton onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </GhostButton>
                    <button
                        type="button"
                        onClick={() => onConfirm(note)}
                        disabled={loading}
                        style={{
                            ...buttonPrimary,
                            background: danger ? theme.error : theme.primary,
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Saving…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
