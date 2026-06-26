import { useEffect, useState } from 'react';
import { quoteApi } from '../utils/apiClient';
import { getQuotePortalSession, clearQuotePortalSession } from '../utils/quotePortalStorage';
import { QuoteGuestChat } from './QuoteGuestChat';
import { FONT_BODY, FONT_DISPLAY } from '../styles/landingFonts';

export function QuoteChatResume() {
    const [token, setToken] = useState(null);
    const [agentName, setAgentName] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const session = getQuotePortalSession();
        if (!session?.token) {
            setChecking(false);
            return;
        }
        quoteApi.getPortal(session.token)
            .then((data) => {
                setToken(session.token);
                setAgentName(data.conversation?.salesAgentName || session.agentName || 'your sales agent');
            })
            .catch(() => {
                clearQuotePortalSession();
                setToken(null);
            })
            .finally(() => setChecking(false));
    }, []);

    const handleInvalid = () => {
        setToken(null);
        setExpanded(false);
    };

    if (checking || !token) return null;

    return (
        <div id="quote-chat" className="quote-chat-resume">
            <div className="quote-chat-resume-inner">
                <div className="quote-chat-resume-head">
                    <div>
                        <span className="quote-chat-resume-label">Your quote conversation</span>
                        <h3 style={{ fontFamily: FONT_DISPLAY, color: '#fff', fontSize: 18, margin: '6px 0 4px' }}>
                            Chat with {agentName}
                        </h3>
                        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                            Continue here anytime — no need to open your email link.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="quote-chat-resume-toggle"
                        onClick={() => setExpanded((open) => !open)}
                    >
                        {expanded ? 'Hide chat' : 'Open chat'}
                    </button>
                </div>
                {expanded && (
                    <div style={{ marginTop: 16 }}>
                        <QuoteGuestChat token={token} compact onInvalidToken={handleInvalid} />
                    </div>
                )}
            </div>
            <style>{`
                .quote-chat-resume {
                    margin-top: 32px;
                    font-family: ${FONT_BODY};
                }
                .quote-chat-resume-inner {
                    background: #0D1830;
                    border: 0.5px solid rgba(167,139,250,0.28);
                    border-radius: 14px;
                    padding: 22px 20px;
                }
                .quote-chat-resume-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .quote-chat-resume-label {
                    font-size: 10px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #A78BFA;
                    font-weight: 600;
                }
                .quote-chat-resume-toggle {
                    flex-shrink: 0;
                    padding: 10px 18px;
                    border-radius: 9px;
                    border: none;
                    background: linear-gradient(135deg, #7C3AED, #A78BFA);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: ${FONT_BODY};
                }
            `}</style>
        </div>
    );
}
