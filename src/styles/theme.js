export const theme = {
    bg: '#FFFFFF',
    bgCard: '#F8FAFC',
    bgDark: '#EEF2F7',
    accent: '#1A4A9E',
    primary: '#002D72',
    navy: '#002D72',
    navyDeep: '#001A44',
    navyMid: '#1A4A9E',
    text: '#0A1F44',
    textMuted: 'rgba(10,31,68,0.62)',
    textDim: 'rgba(10,31,68,0.42)',
    border: 'rgba(0,45,114,0.12)',
    borderHover: 'rgba(0,45,114,0.28)',
    success: '#0F766E',
    warning: '#B45309',
    error: '#B91C1C',
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
    boxShadow: '0 1px 2px rgba(0,45,114,0.06)',
};

export function formatRoleLabel(role) {
    if (!role) return '';
    return role.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

export const inputStyle = {
    width: '100%',
    background: '#FFFFFF',
    border: `0.5px solid ${theme.border}`,
    borderRadius: 9,
    padding: '11px 14px',
    fontSize: 14,
    color: theme.text,
    fontFamily: theme.fontBody,
    outline: 'none',
};

/** Use on native select elements - pairs with styles/forms.css */
export const selectStyle = {
    ...inputStyle,
    background: '#FFFFFF',
    color: theme.text,
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
    color: theme.textMuted,
    border: `0.5px solid ${theme.border}`,
    borderRadius: 9,
    padding: '10px 20px',
    fontSize: 14,
    fontFamily: theme.fontBody,
    cursor: 'pointer',
};
