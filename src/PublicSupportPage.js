import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { LegalBackLink } from './components/LegalBackLink';
import { ContactSupportContent } from './components/ContactSupportContent';

export default function PublicSupportPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="cyforce-public-page">
            <div className="cyforce-public-page-inner" style={{ maxWidth: 1100 }}>
                <LegalBackLink to="/" label="Return to home" />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <img
                            src={logo}
                            alt="CyForce Technologies"
                            style={{ height: '60px', width: 'auto', marginBottom: '20px' }}
                        />
                    </Link>
                    <h1 className="cyforce-public-hero-title">
                        Contact Support
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                        Submit a ticket and our team will respond as soon as possible
                    </p>
                </div>

                <div className="cyforce-public-card">
                    <ContactSupportContent publicMode />
                </div>
            </div>
        </div>
    );
}
