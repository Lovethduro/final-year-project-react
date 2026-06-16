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
    fontHeading: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
};

export const cardStyle = {
    background: theme.bgCard,
    borderRadius: 8,
    padding: 20,
    border: `1px solid ${theme.border}`,
};

export const dashboardCardStyle = {
    ...cardStyle,
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
};

export function formatRoleLabel(role) {
    if (!role) return '';
    return role.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

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

/** Use on native select elements — pairs with styles/forms.css */
export const selectStyle = {
    ...inputStyle,
    background: '#0D1830',
    color: '#f1f5f9',
    colorScheme: 'light',
    cursor: 'pointer',
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
