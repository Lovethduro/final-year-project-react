import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { authApi } from './utils/apiClient';
import { PasswordInput } from './components/SecurePasswordInput';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(51,65,85,1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
};

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = (searchParams.get('token') || '').trim();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Reset link is invalid. Please request a new password reset.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(token, password);
            navigate('/login', { replace: true, state: { message: 'Password updated. You can sign in now.' } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        <div style={{
            minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 16,
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{
                    backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32,
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <img src={logo} alt="CyForce" style={{ height: 48, marginBottom: 12 }} />
                        <h1 style={{ fontSize: 22, color: '#fff', marginBottom: 8 }}>Set new password</h1>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                            Choose a strong password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                New password
                            </label>
                            <PasswordInput
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                style={inputStyle}
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                Confirm password
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                style={inputStyle}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
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
                                background: 'linear-gradient(135deg, #2563EB, #2DD4BF)',
                                color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Updating...' : 'Update password'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
                        <Link to="/forgot-password" style={{ color: '#2DD4BF', textDecoration: 'none' }}>Request a new link</Link>
                    </p>
                </div>
            </div>
        </div>
    </>
    );
}