import { Link, useParams } from 'react-router-dom';
import { QuoteGuestChat } from './components/QuoteGuestChat';
import { theme } from './styles/theme';

export default function QuotePortalPage() {
    const { token } = useParams();

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '32px 16px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Link to="/" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>CyForce Technologies</Link>
                    <h1 style={{ fontFamily: theme.fontHeading, color: theme.text, fontSize: 24, margin: '12px 0 6px' }}>
                        Your Quote Conversation
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>
                        Message your sales agent here — no account required. This link is also saved when you visit from the same browser.
                    </p>
                </div>

                {token ? (
                    <QuoteGuestChat token={token} />
                ) : (
                    <p style={{ color: theme.error, fontSize: 14, textAlign: 'center' }}>Invalid quote link.</p>
                )}

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: theme.textDim }}>
                    <Link to={{ pathname: '/', hash: '#quote-chat' }} style={{ color: theme.accent }}>
                        Return to homepage chat
                    </Link>
                    {' · '}
                    <Link to="/login" style={{ color: theme.accent }}>Sign in</Link> for billing and more.
                </p>
            </div>
        </div>
    );
}
