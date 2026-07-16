import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Eye, EyeOff, Building2, Phone, Ticket } from 'lucide-react';
import { API_BASE, getPostAuthPath, storeAuthSession } from './utils/authFlow';
import { COUNTRY_CODES } from './constants/countryCodes';
import {
    AuthSplitLayout,
    AuthUnderlineField,
    AuthPillButton,
    AuthError,
    AuthSelect,
} from './components/AuthSplitLayout';
import solar from './images/solar.jpg';

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

const CUSTOMER_TYPES = [
    { value: 'individual', label: 'Individual', description: 'Personal account' },
    { value: 'business', label: 'Business', description: 'Small to medium business' },
    { value: 'enterprise', label: 'Enterprise', description: 'Large organization' },
];

function PasswordStrengthIndicator({ password }) {
    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };
    const strength = getStrength();
    const color = strength <= 1 ? '#EF4444' : strength <= 3 ? '#EAB308' : '#22C55E';
    if (!password) return null;
    return (
        <div className="auth-strength" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((level) => (
                <span key={level} style={{ background: level <= strength ? color : undefined }} />
            ))}
        </div>
    );
}

function PasswordRequirements({ password }) {
    const requirements = [
        { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
        { label: '1 uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
        { label: '1 lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
        { label: '1 number', test: (pwd) => /[0-9]/.test(pwd) },
        { label: '1 special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*]/.test(pwd) },
    ];
    if (!password) return null;
    return (
        <div className="auth-req-box">
            <p>Password must contain:</p>
            {requirements.map((req) => {
                const isMet = req.test(password);
                return (
                    <div key={req.label} className="auth-req-item" style={{ color: isMet ? '#0F766E' : 'rgba(10,31,68,0.45)' }}>
                        <span>{isMet ? '✓' : '○'}</span>
                        <span>{req.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        password: '',
        confirmPassword: '',
        hearAboutUs: '',
        referralCode: '',
    });
    const [selectedCustomerType, setSelectedCustomerType] = useState('');
    const [customerTypeOpen, setCustomerTypeOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('+234');
    const [countryCodeOpen, setCountryCodeOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode);
    const selectedCustomerTypeData = CUSTOMER_TYPES.find((ct) => ct.value === selectedCustomerType);
    const needsCompanyName = selectedCustomerType === 'business' || selectedCustomerType === 'enterprise';

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNameChange = (value) => {
        const capitalized = value.split(' ').map((word) => (
            word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
        )).join(' ');
        handleChange('fullName', capitalized);
    };

    const handleCompanyNameChange = (value) => {
        const capitalized = value.split(' ').map((word) => (
            word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )).join(' ');
        handleChange('companyName', capitalized);
    };

    const capitalizeWords = (value) => value.split(' ').map((word) => {
        if (!word) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    const validateForm = () => {
        if (!selectedCustomerType) { setError('Please select your customer type'); return false; }
        if (!formData.fullName.trim()) { setError('Full name is required'); return false; }
        if (!formData.email.trim()) { setError('Email is required'); return false; }
        if (phoneNumber.length < 6) { setError('Please enter a valid phone number (minimum 6 digits)'); return false; }
        if (needsCompanyName && !formData.companyName.trim()) { setError('Company name is required'); return false; }
        if (formData.password.length < 8) { setError('Password must be at least 8 characters long'); return false; }
        if (!/[A-Z]/.test(formData.password)) { setError('Password must contain at least one uppercase letter'); return false; }
        if (!/[a-z]/.test(formData.password)) { setError('Password must contain at least one lowercase letter'); return false; }
        if (!/[0-9]/.test(formData.password)) { setError('Password must contain at least one number'); return false; }
        if (!/[!@#$%^&*]/.test(formData.password)) { setError('Password must contain at least one special character (!@#$%^&*)'); return false; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
        if (!agreeToTerms) { setError('You must agree to the terms and conditions'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const fullPhoneNumber = selectedCountryCode + phoneNumber;
        handleChange('phone', fullPhoneNumber);
        if (!validateForm()) return;
        setIsLoading(true);
        const registrationData = {
            fullName: capitalizeWords(formData.fullName.trim()),
            email: formData.email.trim().toLowerCase(),
            phone: fullPhoneNumber,
            companyName: needsCompanyName ? capitalizeWords(formData.companyName.trim()) : null,
            customerType: selectedCustomerType,
            password: formData.password,
            hearAboutUs: formData.hearAboutUs || null,
            referralCode: formData.referralCode?.trim() || null,
        };
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });
            const data = await response.json();
            if (response.ok) {
                storeAuthSession(data, false);
                navigate(getPostAuthPath(data));
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please check if the backend server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSSORegister = async (provider) => {
        setError('');
        setIsLoading(true);
        try {
            const { signInWithGoogle, signInWithMicrosoft } = await import('./utils/sso');
            const result = provider === 'google'
                ? await signInWithGoogle('customer')
                : await signInWithMicrosoft('customer');
            navigate(result.nextPath);
        } catch (registerError) {
            setError(registerError.message || 'Sign-up failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const africaCodes = COUNTRY_CODES.filter((c) => (
        ['+234', '+233', '+254', '+27', '+212', '+20', '+251', '+255', '+256'].includes(c.code)
    ));
    const otherCodes = COUNTRY_CODES.filter((c) => !africaCodes.includes(c));

    return (
        <AuthSplitLayout
            wide
            title="Sign Up"
            subtitle="Create your CyForce customer account"
            panelTitle="Join CyForce"
            panelText="Dedicated to ensuring your safety with customized security solutions that meet your unique requirements."
            panelImage={solar}
            footerPrompt="Already have an account?"
            footerLinkTo="/login"
            footerLinkLabel="Sign in"
        >
            <form onSubmit={handleSubmit} className="auth-form-landscape">
                <AuthSelect
                    className="auth-span-2"
                    open={customerTypeOpen}
                    onOpenChange={setCustomerTypeOpen}
                    placeholder="Account type"
                    displayValue={selectedCustomerTypeData?.label}
                >
                    {CUSTOMER_TYPES.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                                setSelectedCustomerType(type.value);
                                setCustomerTypeOpen(false);
                                setError('');
                            }}
                        >
                            <strong style={{ display: 'block', fontWeight: 600 }}>{type.label}</strong>
                            <span style={{ fontSize: 11, color: 'rgba(10,31,68,0.5)' }}>{type.description}</span>
                        </button>
                    ))}
                </AuthSelect>

                <AuthUnderlineField
                    icon={User}
                    value={formData.fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="full name"
                    required
                    autoComplete="name"
                />

                <AuthUnderlineField
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email address"
                    required
                    autoComplete="email"
                />

                <div className="auth-phone-row" style={{ marginBottom: 22 }}>
                    <AuthSelect
                        style={{ marginBottom: 0 }}
                        open={countryCodeOpen}
                        onOpenChange={setCountryCodeOpen}
                        placeholder="Code"
                        displayValue={selectedCountry ? `${selectedCountry.flag || ''} ${selectedCountry.code}` : selectedCountryCode}
                    >
                        {[...africaCodes, ...otherCodes].slice(0, 40).map((c) => (
                            <button
                                key={`${c.code}-${c.country}`}
                                type="button"
                                onClick={() => {
                                    setSelectedCountryCode(c.code);
                                    setCountryCodeOpen(false);
                                }}
                            >
                                {c.flag || ''} {c.code} {c.country}
                            </button>
                        ))}
                    </AuthSelect>
                    <AuthUnderlineField
                        icon={Phone}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="phone number"
                        required
                        inputMode="numeric"
                    />
                </div>

                {needsCompanyName && (
                    <AuthUnderlineField
                        className="auth-span-2"
                        icon={Building2}
                        value={formData.companyName}
                        onChange={(e) => handleCompanyNameChange(e.target.value)}
                        placeholder="company name"
                        required
                        autoComplete="organization"
                    />
                )}

                <div className="auth-select-wrap">
                    <select
                        value={formData.hearAboutUs}
                        onChange={(e) => handleChange('hearAboutUs', e.target.value)}
                        style={{
                            width: '100%',
                            border: 'none',
                            borderBottom: '1.5px solid rgba(0,45,114,0.2)',
                            background: 'transparent',
                            padding: '10px 0',
                            fontSize: 14,
                            color: formData.hearAboutUs ? '#0A1F44' : 'rgba(10,31,68,0.4)',
                            outline: 'none',
                        }}
                    >
                        <option value="">How did you hear about us?</option>
                        <option value="search">Search engine</option>
                        <option value="social">Social media</option>
                        <option value="referral">Referral</option>
                        <option value="event">Event / conference</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <AuthUnderlineField
                    icon={Ticket}
                    value={formData.referralCode}
                    onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
                    placeholder="referral code (optional)"
                />

                <AuthUnderlineField
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="password"
                    required
                    autoComplete="new-password"
                    endAdornment={(
                        <button
                            type="button"
                            className="auth-field-end"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                />

                <AuthUnderlineField
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="confirm password"
                    required
                    autoComplete="new-password"
                    endAdornment={(
                        <button
                            type="button"
                            className="auth-field-end"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                />

                <PasswordStrengthIndicator password={formData.password} />
                <PasswordRequirements password={formData.password} />

                <label className="auth-check" style={{ marginBottom: 16 }}>
                    <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                    <span>
                        I agree to the <Link to="/terms" state={{ from: '/register' }} className="auth-link">Terms</Link>
                        {' '}and <Link to="/privacy" state={{ from: '/register' }} className="auth-link">Privacy Policy</Link>
                    </span>
                </label>

                <AuthError message={error} />
                <AuthPillButton loading={isLoading}>Sign Up</AuthPillButton>
            </form>

            <div className="auth-divider">Or sign up with</div>
            <div className="auth-oauth">
                <button type="button" className="auth-oauth-btn" onClick={() => handleSSORegister('google')} disabled={isLoading}>
                    <GoogleIcon /> Google
                </button>
                <button type="button" className="auth-oauth-btn" onClick={() => handleSSORegister('microsoft')} disabled={isLoading}>
                    <MicrosoftIcon /> Microsoft
                </button>
            </div>
        </AuthSplitLayout>
    );
}

export default RegisterPage;
