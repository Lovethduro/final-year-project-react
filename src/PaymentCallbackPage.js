import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentApi, getSession } from './utils/apiClient';
import { refreshNotifications } from './utils/notifications';
import { shouldAutoCompletePayment } from './utils/paymentUtils';
import { PurchaseSurveyForm } from './components/PurchaseSurveyForm';
import { theme, cardStyle } from './styles/theme';

const STAFF_ROLES = ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'];

export default function PaymentCallbackPage() {
    const [params] = useSearchParams();
    const reference = params.get('reference');
    const provider = params.get('provider') || 'paystack';
    const autoComplete = params.get('autoComplete');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [surveyToken, setSurveyToken] = useState(null);
    const [surveyDone, setSurveyDone] = useState(false);
    const verifiedRef = useRef(false);

    const session = getSession();
    const returnPath = STAFF_ROLES.includes(session.role) ? '/staff/shop' : '/dashboard/billing';

    useEffect(() => {
        if (!reference || verifiedRef.current) {
            if (!reference) {
                setStatus('error');
                setMessage('Missing payment reference.');
            }
            return;
        }
        verifiedRef.current = true;

        const verify = async () => {
            try {
                let result;
                if (autoComplete || shouldAutoCompletePayment({ autoComplete: true, authorizationUrl: window.location.href })) {
                    result = await paymentApi.completeLocalPayment(reference);
                } else if (provider === 'flutterwave') {
                    result = await paymentApi.verifyFlutterwave(reference);
                } else {
                    result = await paymentApi.verifyPaystack(reference);
                }
                localStorage.removeItem('cart');
                setStatus('success');
                setMessage('Payment verified successfully! Your order has been confirmed.');
                if (result?.surveyToken) {
                    setSurveyToken(result.surveyToken);
                }
                refreshNotifications();
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed.');
                refreshNotifications();
            }
        };

        verify();
    }, [reference, provider, autoComplete]);

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ ...cardStyle, maxWidth: 520, width: '100%', textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}</div>
                <h1 style={{ color: theme.text, fontSize: 22, marginBottom: 12 }}>Payment {status === 'verifying' ? 'Processing' : status === 'success' ? 'Complete' : 'Failed'}</h1>
                <p style={{ color: theme.textMuted, marginBottom: 24 }}>{message}</p>
                {reference && <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 24 }}>Ref: {reference}</p>}
                {status === 'success' && surveyToken && !surveyDone && (
                    <div style={{ textAlign: 'left', marginBottom: 24 }}>
                        <h2 style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Rate your purchase</h2>
                        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>Tell us how your experience went.</p>
                        <PurchaseSurveyForm
                            token={surveyToken}
                            compact
                            onComplete={() => {
                                setSurveyDone(true);
                                setSurveyToken(null);
                                refreshNotifications();
                            }}
                        />
                    </div>
                )}
                {status === 'success' && surveyDone && (
                    <p style={{ color: theme.success, fontSize: 14, marginBottom: 24 }}>Thank you for your feedback!</p>
                )}
                <Link to={returnPath} style={{ color: theme.accent }}>
                    {STAFF_ROLES.includes(session.role) ? 'Back to Staff Store →' : 'Back to Billing →'}
                </Link>
            </div>
        </div>
    );
}
