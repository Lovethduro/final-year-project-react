import { theme } from '../styles/theme';

export function StarRatingInput({ value = 0, onChange, size = 28 }) {
    return (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    aria-label={`Rate ${star} stars`}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: size,
                        color: star <= value ? theme.warning : 'rgba(0,45,114,0.2)',
                        padding: 0,
                        lineHeight: 1,
                    }}
                >
                    ★
                </button>
            ))}
            {value > 0 && (
                <span style={{ fontSize: 13, color: theme.textDim, alignSelf: 'center' }}>{value}/5</span>
            )}
        </div>
    );
}

export function AgentStarBadge({ rating = 0, count = 0 }) {
    if (!rating && !count) return null;
    return (
        <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>
            {rating ? `${Number(rating).toFixed(1)} / 5` : '-'}
            {count > 0 && <span style={{ color: theme.textDim, fontWeight: 400 }}> ({count} reviews)</span>}
        </span>
    );
}
