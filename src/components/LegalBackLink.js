import { Link } from 'react-router-dom';

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function LegalBackLink({ to = '/register', label = 'Back to Register' }) {
    return (
        <Link
            to={to}
            aria-label={label}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 28,
                padding: '6px 0',
                color: 'rgba(255,255,255,0.72)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.01em',
                transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                const icon = e.currentTarget.querySelector('[data-back-icon]');
                if (icon) {
                    icon.style.borderColor = 'rgba(45,212,191,0.45)';
                    icon.style.background = 'rgba(45,212,191,0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                const icon = e.currentTarget.querySelector('[data-back-icon]');
                if (icon) {
                    icon.style.borderColor = 'rgba(255,255,255,0.1)';
                    icon.style.background = 'rgba(255,255,255,0.04)';
                }
            }}
        >
            <span
                data-back-icon
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#2DD4BF',
                    flexShrink: 0,
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
            >
                <ChevronLeftIcon />
            </span>
            {label}
        </Link>
    );
}
