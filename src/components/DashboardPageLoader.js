import { theme } from '../styles/theme';

export default function DashboardPageLoader() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 240,
            color: theme.textMuted,
            fontSize: 14,
            fontFamily: theme.fontBody,
        }}>
            Loading…
        </div>
    );
}
