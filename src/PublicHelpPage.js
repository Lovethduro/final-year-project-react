import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { LegalBackLink } from './components/LegalBackLink';
import { KnowledgeBaseContent } from './KnowledgeBasePage';

export default function PublicHelpPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="cyforce-public-page">
            <div className="cyforce-public-page-inner">
                <LegalBackLink label="Return to home" fallbackTo="/" />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <img
                            src={logo}
                            alt="CyForce Technologies"
                            style={{ height: '60px', width: 'auto', marginBottom: '20px' }}
                        />
                    </Link>
                    <h1 className="cyforce-public-hero-title">
                        Help Center
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(15,23,42,0.55)' }}>
                        Browse answers before opening a support ticket
                    </p>
                </div>

                <div className="cyforce-public-card">
                    <KnowledgeBaseContent publicMode />
                </div>
            </div>
        </div>
    );
}
