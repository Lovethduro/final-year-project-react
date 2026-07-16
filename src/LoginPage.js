import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import {
    API_BASE,
    getPostAuthPath,
    isOAuthLoginMethod,
    loadRememberedLogin,
    saveRememberedLogin,
    storeAuthSession,
} from './utils/authFlow';
import { authApi, getSession } from './utils/apiClient';
import { BackLink } from './components/BackLink';
import {
    AuthSplitLayout,
    AuthUnderlineField,
    AuthPillButton,
    AuthError,
    AuthInfo,
    AuthSelect,
} from './components/AuthSplitLayout';
import cyber from './images/CyberSec.jpg';

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

function MicrosoftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
    );
}

const ROLES = [
    { value: 'customer', label: 'Customer', description: 'Access customer portal & support' },
    { value: 'sales_agent', label: 'Sales Agent', description: 'Sales & pipeline management' },
    { value: 'support_agent', label: 'Support Agent', description: 'Customer support & tickets' },
    { value: 'supervisor', label: 'Supervisor', description: 'Team oversight & reporting' },
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
];

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const loginMessage = location.state?.message || '';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [roleOpen, setRoleOpen] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loginStep, setLoginStep] = useState('credentials');
    const [mfaChallenge, setMfaChallenge] = useState(null);
    const [mfaCode, setMfaCode] = useState('');

    useEffect(() => {
        const remembered = loadRememberedLogin();
        if (!remembered) return;
        setRememberMe(true);
        if (remembered.role) setSelectedRole(remembered.role);
        if (isOAuthLoginMethod(remembered.loginMethod)) return;
        if (remembered.email) setEmail(remembered.email);
    }, []);

    const selectedRoleData = ROLES.find((r) => r.value === selectedRole);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError('Please select your role to continue.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    role: selectedRole,
                }),
            });
            let data = {};
            try { data = await response.json(); } catch { data = {}; }
            if (!response.ok) throw new Error(data.error || `Login failed (${response.status})`);
            if (data.mfaRequired) {
                setMfaChallenge(data);
                setLoginStep('mfa');
                setMfaCode('');
                return;
            }
            storeAuthSession(data, rememberMe);
            saveRememberedLogin({
                email: email.trim().toLowerCase(),
                role: selectedRole,
                remember: rememberMe,
                loginMethod: 'password',
            });
            navigate(getPostAuthPath(data));
        } catch (loginError) {
            setError(loginError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await authApi.verifyMfaLogin(mfaChallenge.mfaChallengeToken, mfaCode.replace(/\D/g, ''));
            storeAuthSession(data, rememberMe);
            saveRememberedLogin({
                email: email.trim().toLowerCase() || data.email,
                role: data.role || selectedRole,
                remember: rememberMe,
                loginMethod: 'password',
            });
            navigate(getPostAuthPath(data));
        } catch (err) {
            setError(err.message);
            setMfaCode('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaResend = async () => {
        setError('');
        try {
            await authApi.resendMfaLogin(mfaChallenge.mfaChallengeToken);
        } catch (err) {
            setError(err.message);
        }
    };

    const mfaMethodLabel = () => {
        const method = mfaChallenge?.mfaMethod || 'authenticator';
        if (method === 'email') return `Enter the code sent to ${mfaChallenge?.email || 'your email'}`;
        return 'Enter the 6-digit code from your authenticator app';
    };

    const handleSSOLogin = async (provider) => {
        setError('');
        setIsLoading(true);
        try {
            const { signInWithGoogle, signInWithMicrosoft } = await import('./utils/sso');
            const result = provider === 'google'
                ? await signInWithGoogle(null, rememberMe)
                : await signInWithMicrosoft(null, rememberMe);
            if (result.data?.mfaRequired) {
                setMfaChallenge(result.data);
                setLoginStep('mfa');
                setMfaCode('');
                return;
            }
            const accountRole = result.data?.role || selectedRole;
            if (rememberMe && result.data?.email) {
                saveRememberedLogin({
                    email: result.data.email,
                    role: accountRole,
                    remember: true,
                    loginMethod: provider,
                });
            } else {
                saveRememberedLogin({ remember: false });
            }
            navigate(result.nextPath);
        } catch (loginError) {
            setError(loginError.message || 'Sign-in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const session = getSession();
    if (session.userId && session.token) {
        return <Navigate to={getPostAuthPath(session)} replace />;
    }

    return (
        <AuthSplitLayout
            title="Login"
            subtitle="Sign in to access your CyForce dashboard"
            panelTitle="Secure access"
            panelText="Protecting what matters with security, ICT, and smart tech built for Nigeria."
            panelImage={cyber}
            footerPrompt="Don't have an account yet?"
            footerLinkTo="/register"
            footerLinkLabel="Sign up"
        >
            {loginStep === 'mfa' ? (
                <form onSubmit={handleMfaVerify}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Shield size={36} strokeWidth={1.5} color="#002D72" style={{ marginBottom: 8 }} />
                        <p style={{ fontSize: 14, color: 'rgba(10,31,68,0.65)', margin: 0 }}>{mfaMethodLabel()}</p>
                    </div>
                    <AuthUnderlineField
                        icon={Lock}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: 20, paddingRight: 36 }}
                    />
                    <AuthError message={error} />
                    <AuthPillButton loading={isLoading} disabled={mfaCode.length < 6}>
                        Verify & Sign In
                    </AuthPillButton>
                    {mfaChallenge?.mfaMethod === 'email' && (
                        <button type="button" className="auth-link" onClick={handleMfaResend} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Resend code
                        </button>
                    )}
                    <BackLink
                        variant="subtle"
                        label="Return to sign in"
                        onClick={() => { setLoginStep('credentials'); setMfaChallenge(null); setMfaCode(''); setError(''); }}
                        centered
                        style={{ marginTop: 16 }}
                    />
                </form>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <AuthSelect
                            open={roleOpen}
                            onOpenChange={setRoleOpen}
                            placeholder="Select your role"
                            displayValue={selectedRoleData?.label}
                        >
                            {ROLES.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRole(role.value);
                                        setRoleOpen(false);
                                        setError('');
                                    }}
                                >
                                    <strong style={{ display: 'block', fontWeight: 600 }}>{role.label}</strong>
                                    <span style={{ fontSize: 11, color: 'rgba(10,31,68,0.5)' }}>{role.description}</span>
                                </button>
                            ))}
                        </AuthSelect>

                        <AuthUnderlineField
                            icon={User}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username/email"
                            required
                            autoComplete="email"
                        />

                        <AuthUnderlineField
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            required
                            autoComplete="current-password"
                            endAdornment={(
                                <button
                                    type="button"
                                    className="auth-field-end"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        />

                        <div className="auth-row">
                            <label className="auth-check">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                        </div>

                        <AuthInfo message={loginMessage} />
                        <AuthError message={error} />

                        <AuthPillButton loading={isLoading}>Login</AuthPillButton>
                    </form>

                    <div className="auth-divider">Or continue with</div>
                    <div className="auth-oauth">
                        <button type="button" className="auth-oauth-btn" onClick={() => handleSSOLogin('google')} disabled={isLoading}>
                            <GoogleIcon /> Google
                        </button>
                        <button type="button" className="auth-oauth-btn" onClick={() => handleSSOLogin('microsoft')} disabled={isLoading}>
                            <MicrosoftIcon /> Microsoft
                        </button>
                    </div>
                </>
            )}
        </AuthSplitLayout>
    );
}

export default LoginPage;
