import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentApi, getSession } from './utils/apiClient';
import { refreshNotifications } from './utils/notifications';
import { shouldAutoCompletePayment } from './utils/paymentUtils';
import { theme, cardStyle } from './styles/theme';

const STAFF_ROLES = ['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT'];

export default function PaymentCallbackPage() {
    const [params] = useSearchParams();
    const reference = params.get('reference');
    const provider = params.get('provider') || 'paystack';
    const autoComplete = params.get('autoComplete');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    const session = getSession();
    const returnPath = STAFF_ROLES.includes(session.role) ? '/staff/shop' : '/dashboard/billing';

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('Missing payment reference.');
            return;
        }

        const verify = async () => {
            try {
                if (autoComplete || shouldAutoCompletePayment({ autoComplete: true, authorizationUrl: window.location.href })) {
                    await paymentApi.completeLocalPayment(reference);
                } else if (provider === 'flutterwave') {
                    await paymentApi.verifyFlutterwave(reference);
                } else {
                    await paymentApi.verifyPaystack(reference);
                }
                localStorage.removeItem('cart');
                setStatus('success');
                setMessage('Payment verified successfully! Your order has been confirmed.');
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
            <div style={{ ...cardStyle, maxWidth: 420, width: '100%', textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}</div>
                <h1 style={{ color: theme.text, fontSize: 22, marginBottom: 12 }}>Payment {status === 'verifying' ? 'Processing' : status === 'success' ? 'Complete' : 'Failed'}</h1>
                <p style={{ color: theme.textMuted, marginBottom: 24 }}>{message}</p>
                {reference && <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 24 }}>Ref: {reference}</p>}
                <Link to={returnPath} style={{ color: theme.accent }}>
                    {STAFF_ROLES.includes(session.role) ? 'Back to Staff Store →' : 'Back to Billing →'}
                </Link>
            </div>
        </div>
    );
}
