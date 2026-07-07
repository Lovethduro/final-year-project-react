import { useState } from 'react';
import logo from './images/CYFORCE 2-1.jpg';
import { authApi } from './utils/apiClient';
import { BackLink } from './components/BackLink';

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

const errorBoxStyle = {
    padding: '10px 12px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
};

const successBoxStyle = {
    padding: '10px 12px',
    background: 'rgba(45,212,191,0.1)',
    border: '1px solid rgba(45,212,191,0.3)',
    borderRadius: '10px',
};

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
                        <h1 style={{ fontSize: 22, color: '#fff', marginBottom: 8 }}>Forgot password</h1>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                            Enter your email and we will send you a reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                                placeholder="name@cyforce.ng"
                            />
                        </div>

                        {error && (
                            <div style={errorBoxStyle}>
                                <p style={{ fontSize: 12, color: '#F87171', margin: 0 }}>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div style={successBoxStyle}>
                                <p style={{ fontSize: 12, color: '#5EEAD4', margin: 0 }}>{success}</p>
                                {resetUrl && (
                                    <p style={{ fontSize: 12, color: '#5EEAD4', margin: '10px 0 0' }}>
                                        <a href={resetUrl} style={{ color: '#2DD4BF', wordBreak: 'break-all' }}>
                                            Open password reset page
                                        </a>
                                    </p>
                                )}
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
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20 }}>
                        <BackLink to="/login" label="Return to sign in" variant="subtle" centered style={{ color: '#2DD4BF' }} />
                    </p>
                </div>
            </div>
        </div>
    </>
    );
}