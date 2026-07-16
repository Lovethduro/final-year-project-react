import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { PhoneWithCountryCode } from './components/PhoneWithCountryCode';
import { authApi, getSession } from './utils/apiClient';
import { formatInternationalPhone, isValidLocalPhone } from './utils/phoneFormat';
import { getDashboardPath, getPostAuthPath, storeAuthSession } from './utils/authFlow';

const CUSTOMER_TYPES = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
    { value: 'enterprise', label: 'Enterprise' },
];

const fieldStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(51,65,85,1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
};

export default function CompleteProfilePage() {
    const navigate = useNavigate();
    const session = getSession();
    const [customerType, setCustomerType] = useState('individual');
    const [companyName, setCompanyName] = useState('');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+234');
    const [phone, setPhone] = useState('');
    const [hearAboutUs, setHearAboutUs] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const needsCompany = customerType === 'business' || customerType === 'enterprise';

    useEffect(() => {
        if (session.profileComplete) {
            navigate(getDashboardPath(session.role), { replace: true });
        }
    }, [navigate, session.profileComplete, session.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidLocalPhone(phone)) {
            setError('Please enter a valid phone number with country code.');
            return;
        }
        if (needsCompany && !companyName.trim()) {
            setError('Company name is required for business and enterprise accounts.');
            return;
        }
        if (!agreeToTerms) {
            setError('You must agree to the terms and conditions.');
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.completeProfile({
                phone: formatInternationalPhone(phoneCountryCode, phone),
                customerType,
                companyName: needsCompany ? companyName.trim() : null,
                hearAboutUs: hearAboutUs || null,
                referralCode: referralCode.trim() || null,
            });
            storeAuthSession(data, session.rememberMe);
            navigate(getPostAuthPath(data), { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        <div style={{
            minHeight: '100vh',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            fontFamily: "'DM Sans', sans-serif",
        }}
        >
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{
                    backdropFilter: 'blur(12px)',
                    background: 'rgba(15,23,42,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '32px',
                }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <img src={logo} alt="CyForce" style={{ height: 48, objectFit: 'contain' }} />
                        <h1 style={{ color: '#0F172A', fontSize: 24, margin: '16px 0 8px' }}>Finish your profile</h1>
                        <p style={{ color: 'rgba(15,23,42,0.55)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                            Signed in as <strong style={{ color: '#0F172A' }}>{session.fullName || session.email}</strong>.
                            {' '}Add the details we need to set up your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                Customer type *
                            </label>
                            <select
                                value={customerType}
                                onChange={(e) => setCustomerType(e.target.value)}
                                style={fieldStyle}
                                required
                            >
                                {CUSTOMER_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        {needsCompany && (
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                    Company name *
                                </label>
                                <input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Your Company Ltd"
                                    style={fieldStyle}
                                    required
                                />
                            </div>
                        )}

                        <PhoneWithCountryCode
                            label="Phone number"
                            countryCode={phoneCountryCode}
                            localNumber={phone}
                            onCountryCodeChange={setPhoneCountryCode}
                            onLocalNumberChange={setPhone}
                            required
                            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                            inputStyle={{
                                background: 'rgba(15,23,42,0.5)',
                                border: '1px solid rgba(51,65,85,1)',
                                color: '#0F172A',
                            }}
                        />

                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                How did you hear about us?
                            </label>
                            <select
                                value={hearAboutUs}
                                onChange={(e) => setHearAboutUs(e.target.value)}
                                style={fieldStyle}
                            >
                                <option value="">Select an option</option>
                                <option value="website">Website / Search</option>
                                <option value="referral">Referral</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="event">Event</option>
                                <option value="social">Social media</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                                Referral code (optional)
                            </label>
                            <input
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                placeholder="Enter a friend's code"
                                style={fieldStyle}
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'rgba(15,23,42,0.55)' }}>
                            <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                style={{ marginTop: 3, accentColor: '#1A4A9E' }}
                            />
                            <span>
                                I agree to the{' '}
                                <Link to="/terms" style={{ color: '#1A4A9E' }}>Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" style={{ color: '#1A4A9E' }}>Privacy Policy</Link>
                            </span>
                        </label>

                        {error && (
                            <p style={{ color: '#F87171', fontSize: 13, margin: 0 }}>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #002D72, #1A4A9E)',
                                color: '#0F172A',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Saving…' : 'Continue to dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>
    );
}