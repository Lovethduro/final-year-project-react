import { useState } from 'react';
import { Mail } from 'lucide-react';
import { authApi } from './utils/apiClient';
import {
    AuthSplitLayout,
    AuthUnderlineField,
    AuthPillButton,
    AuthError,
    AuthInfo,
} from './components/AuthSplitLayout';
import cyber from './images/CyberSec.jpg';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetUrl, setResetUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setResetUrl('');
        setLoading(true);
        try {
            const data = await authApi.forgotPassword(email.trim().toLowerCase());
            setSuccess(data.message || 'If an account exists for that email, a password reset link has been sent.');
            if (data.resetUrl) {
                setResetUrl(data.resetUrl);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthSplitLayout
            title="Forgot password"
            subtitle="Enter your email and we will send you a reset link."
            panelTitle="Secure access"
            panelText="Protecting what matters with security, ICT, and smart tech built for Nigeria."
            panelImage={cyber}
            footerPrompt="Remember your password?"
            footerLinkTo="/login"
            footerLinkLabel="Sign in"
        >
            <form onSubmit={handleSubmit}>
                <AuthUnderlineField
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email address"
                    required
                    autoComplete="email"
                />

                <AuthError message={error} />
                <AuthInfo message={success} />
                {success && resetUrl && (
                    <p style={{ textAlign: 'center', margin: '-4px 0 16px', fontSize: 13 }}>
                        <a href={resetUrl} className="auth-link" style={{ wordBreak: 'break-all' }}>
                            Open password reset page
                        </a>
                    </p>
                )}

                <AuthPillButton loading={loading}>Send reset link</AuthPillButton>
            </form>
        </AuthSplitLayout>
    );
}
