import { BackLink } from './BackLink';

export function LegalBackLink({ to = '/register', label = 'Return to registration' }) {
    return <BackLink to={to} label={label} variant="auth" />;
}
