import { useLocation, useNavigate } from 'react-router-dom';
import { BackLink } from './BackLink';

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/reset-password']);

export function LegalBackLink({ label = 'Go back', fallbackTo = '/' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const from = typeof location.state?.from === 'string' ? location.state.from : '';

    const handleBack = () => {
        if (from && from !== location.pathname) {
            navigate(from, { replace: true });
            return;
        }
        navigate(fallbackTo, { replace: true });
    };

    const resolvedLabel = from && AUTH_PATHS.has(from)
        ? (from === '/login' ? 'Return to sign in' : from === '/register' ? 'Return to sign up' : 'Go back')
        : label;

    return (
        <BackLink
            label={resolvedLabel}
            ariaLabel={resolvedLabel}
            variant="auth"
            onClick={handleBack}
        />
    );
}
