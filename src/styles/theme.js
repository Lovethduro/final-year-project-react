export const theme = {
    bg: '#060B1A',
    bgCard: '#0D1830',
    bgDark: '#04080F',
    accent: '#38BDF8',
    primary: '#2B5CE6',
    text: '#fff',
    textMuted: 'rgba(255,255,255,0.5)',
    textDim: 'rgba(255,255,255,0.35)',
    border: 'rgba(99,179,237,0.1)',
    borderHover: 'rgba(56,189,248,0.3)',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#EF4444',
    fontHeading: "'Syne', sans-serif",
    fontBody: "'DM Sans', sans-serif",
};

export const cardStyle = {
    background: theme.bgCard,
    borderRadius: 16,
    padding: 24,
    border: `0.5px solid ${theme.border}`,
};

export const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(99,179,237,0.2)',
    borderRadius: 9,
    padding: '11px 14px',
    fontSize: 14,
    color: '#fff',
    fontFamily: theme.fontBody,
    outline: 'none',
};

export const buttonPrimary = {
    background: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: '10px 20px',
    fontSize: 14,
    fontFamily: theme.fontBody,
    fontWeight: 500,
    cursor: 'pointer',
};

export const buttonGhost = {
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    border: '0.5px solid rgba(255,255,255,0.2)',
    borderRadius: 9,
    padding: '10px 20px',
    fontSize: 14,
    fontFamily: theme.fontBody,
    cursor: 'pointer',
};
