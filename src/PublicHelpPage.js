import { Link } from 'react-router-dom';
import { KnowledgeBaseContent } from './KnowledgeBasePage';
import { theme } from './styles/theme';

export default function PublicHelpPage() {
    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '32px 16px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ marginBottom: 12 }}>
                    <Link to="/" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none' }}>
                        CyForce Technologies
                    </Link>
                </div>
                <KnowledgeBaseContent publicMode />
            </div>
        </div>
    );
}
