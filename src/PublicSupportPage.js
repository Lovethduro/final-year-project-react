import { Link } from 'react-router-dom';
import { ContactSupportContent } from './components/ContactSupportContent';
import { theme } from './styles/theme';

export default function PublicSupportPage() {
    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '32px 16px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ marginBottom: 20 }}>
                    <Link to="/" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>
                        ← CyForce Technologies
                    </Link>
                </div>
                <ContactSupportContent publicMode />
            </div>
        </div>
    );
}
