import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentApi, getSession } from './utils/apiClient';
import { refreshNotifications } from './utils/notifications';
import { shouldAutoCompletePayment } from './utils/paymentUtils';
import { PurchaseSurveyForm } from './components/PurchaseSurveyForm';
import { BackLink } from './components/BackLink';
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
    const returnPath = '/dashboard/billing';
    const isStaffUser = STAFF_ROLES.includes(session.role);

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
                if (result?.surveyToken && !isStaffUser) {
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
    }, [reference, provider, autoComplete, isStaffUser]);

    return (
    <>
        <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ ...cardStyle, maxWidth: 520, width: '100%', textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}</div>
                {autoComplete && status === 'success' && (
                    <p style={{ color: theme.warning, fontSize: 13, marginBottom: 16, padding: '10px 12px', background: 'rgba(251,191,36,0.1)', borderRadius: 8 }}>
                        Test mode — no real payment was taken. Add Paystack or Flutterwave API keys on the server for live checkout.
                    </p>
                )}
                <h1 style={{ color: theme.text, fontSize: 22, marginBottom: 12 }}>Payment {status === 'verifying' ? 'Processing' : status === 'success' ? 'Complete' : 'Failed'}</h1>
                <p style={{ color: theme.textMuted, marginBottom: 24 }}>{message}</p>
                {reference && <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 24 }}>Ref: {reference}</p>}
                {status === 'success' && surveyToken && !surveyDone && !isStaffUser && (
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
                <BackLink
                    to={returnPath}
                    label={isStaffUser ? 'View billing and purchases' : 'Return to billing'}
                />
            </div>
        </div>
    </>
    );
}