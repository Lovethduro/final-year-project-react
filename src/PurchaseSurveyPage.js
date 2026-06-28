import { useParams, Link } from 'react-router-dom';
import { PurchaseSurveyForm } from './components/PurchaseSurveyForm';
import { theme, cardStyle } from './styles/theme';

export default function PurchaseSurveyPage() {
    const { token } = useParams();

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '40px 20px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', ...cardStyle, padding: 28 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontFamily: theme.fontHeading, color: theme.text, fontSize: 26, marginBottom: 8 }}>Rate Your Purchase</h1>
                    <p style={{ color: theme.textMuted, fontSize: 14 }}>Tell us how your CyForce purchase experience went.</p>
                </div>
                <PurchaseSurveyForm token={token} />
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/login" style={{ color: theme.accent, fontSize: 13 }}>Sign in to your account</Link>
                </div>
            </div>
        </div>
    );
}
