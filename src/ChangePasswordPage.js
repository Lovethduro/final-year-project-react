import { theme } from './styles/theme';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { authApi, getSession } from './utils/apiClient';
import { getPostAuthPath, storeAuthSession } from './utils/authFlow';
import { SecurePasswordInput, AutofillTrapFields } from './components/SecurePasswordInput';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#FFFFFF',
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    color: theme.text,
    outline: 'none',
};

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const session = getSession();
    const forced = session.mustChangePassword;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword(currentPassword, newPassword);
            storeAuthSession({
                ...session,
                userId: session.userId,
                email: session.email,
                fullName: session.fullName,
                phone: session.phone,
                token: session.token,
                role: session.role,
                mfaEnabled: session.mfaEnabled,
                emailVerified: session.emailVerified,
                mustChangePassword: false,
            }, session.rememberMe);
            navigate(getPostAuthPath({
                emailVerified: session.emailVerified,
                mustChangePassword: false,
                mfaEnabled: session.mfaEnabled,
                role: session.role,
            }), { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        <div style={{
            minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: theme.fontBody, padding: 16,
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{
                    background: '#FFFFFF',
                    border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32,
                    boxShadow: '0 12px 32px rgba(0,45,114,0.1)',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <img src={logo} alt="CyForce" style={{ height: 48, marginBottom: 12 }} />
                        <h1 style={{ fontSize: 22, color: '#0F172A', marginBottom: 8 }}>
                            {forced ? 'Update your password' : 'Change password'}
                        </h1>
                        <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.55)' }}>
                            {forced
                                ? 'Your account uses a temporary password. Set a new one before continuing.'
                                : 'Enter your current password and choose a new one.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                        <AutofillTrapFields />
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                                {forced ? 'Temporary password' : 'Current password'}
                            </label>
                            <SecurePasswordInput
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                style={inputStyle}
                                autoComplete="off"
                                name="cyforce-current-password"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                                New password
                            </label>
                            <SecurePasswordInput
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                style={inputStyle}
                                autoComplete="new-password"
                                name="cyforce-new-password"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                                Confirm new password
                            </label>
                            <SecurePasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                style={inputStyle}
                                autoComplete="new-password"
                                name="cyforce-confirm-password"
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '10px 12px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '10px',
                            }}>
                                <p style={{ fontSize: 12, color: '#F87171', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: 12, border: 'none', borderRadius: 10,
                                background: 'linear-gradient(135deg, #002D72, #1A4A9E)',
                                color: '#FFFFFF', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Saving...' : 'Save new password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>
    );
}