// src/MFASetupPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';

import { QRCodeSVG } from 'qrcode.react';
import { API_BASE, getPostAuthPath, LOGIN_MFA_ENABLED } from './utils/authFlow';
import { getSession } from './utils/apiClient';

// Animated Particle Background
function ParticleBackground() {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const initParticles = () => {
            const particleCount = 80;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.3 + 0.1,
                    color: `rgba(56, 189, 248, ${Math.random() * 0.2 + 0.05})`
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();

                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
            });

            animationId = requestAnimationFrame(drawParticles);
        };

        resizeCanvas();
        initParticles();
        drawParticles();

        window.addEventListener('resize', () => {
            resizeCanvas();
            particles = [];
            initParticles();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none"
            }}
        />
    );
}

// OTP Input Component
function OTPInput({ value, onChange, length = 6 }) {
    const handleChange = (e, index) => {
        const val = e.target.value;
        if (val.length > 1) return;
        if (!/^\d*$/.test(val)) return;

        const newOtp = value.split('');
        newOtp[index] = val;
        onChange(newOtp.join(''));

        // Auto-focus next input
        if (val && index < length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, length);
        onChange(pastedNumbers);
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }} onPaste={handlePaste}>
            {[...Array(length)].map((_, index) => (
                <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    style={{
                        width: "48px",
                        height: "56px",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                        background: "rgba(15,23,42,0.5)",
                        border: `1px solid ${value[index] ? "#2DD4BF" : "rgba(51,65,85,1)"}`,
                        borderRadius: "10px",
                        color: "#fff",
                        outline: "none",
                        transition: "all 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                    onBlur={(e) => e.target.style.borderColor = value[index] ? "#2DD4BF" : "rgba(51,65,85,1)"}
                />
            ))}
        </div>
    );
}

const MFA_SETUP_STORAGE_KEY = 'cyforce_mfa_setup';

function saveMfaSetupState(userId, secret, otpAuthUrl) {
    sessionStorage.setItem(MFA_SETUP_STORAGE_KEY, JSON.stringify({ userId, secret, otpAuthUrl }));
}

function loadMfaSetupState(userId) {
    try {
        const raw = sessionStorage.getItem(MFA_SETUP_STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data.userId === userId ? data : null;
    } catch {
        return null;
    }
}

function clearMfaSetupState() {
    sessionStorage.removeItem(MFA_SETUP_STORAGE_KEY);
}

function formatSecretKey(secret) {
    if (!secret) return '';
    return secret.replace(/\s/g, '').toUpperCase().match(/.{1,4}/g)?.join(' ') || secret;
}

const MFA_METHODS = [
    { value: "authenticator", label: "Authenticator App", description: "Google Authenticator, Authy, etc. — use setup key if QR scan fails", icon: "📱", recommended: true },
    { value: "email", label: "Email Verification", description: "Receive codes via email", icon: "✉️", recommended: false },
];

function MFASetupPage() {
    const navigate = useNavigate();
    const session = getSession();
    const userId = session.userId;
    const userEmail = session.email || '';
    const isProfileSetup = !LOGIN_MFA_ENABLED;

    const dismissSetup = () => navigate('/profile', { replace: true });

    const cardDismiss = isProfileSetup ? (
        <button
            type="button"
            onClick={dismissSetup}
            aria-label="Close"
            style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.45)',
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s, border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
        >
            ×
        </button>
    ) : null;

    const [selectedMethod, setSelectedMethod] = useState("authenticator");
    const [step, setStep] = useState("select");
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [otpAuthUrl, setOtpAuthUrl] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate('/login', { replace: true });
            return;
        }
        if (session.mustChangePassword) {
            navigate('/change-password', { replace: true });
            return;
        }
        const saved = loadMfaSetupState(userId);
        if (saved?.secret && saved?.otpAuthUrl) {
            setSecretKey(saved.secret);
            setOtpAuthUrl(saved.otpAuthUrl);
            setSelectedMethod('authenticator');
            setStep('setup');
        }

        return () => {
            setOtp('');
        };
    }, [userId, navigate, session.mustChangePassword]);

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secretKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const startAuthenticatorSetup = async (forceNew = false) => {
        setError("");
        setInfoMessage("");
        setIsLoading(true);

        try {
            if (forceNew) {
                clearMfaSetupState();
                await fetch(`${API_BASE}/mfa/setup/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, method: 'authenticator' }),
                });
            }

            let response = await fetch(`${API_BASE}/mfa/setup/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, method: selectedMethod }),
            });

            let data = await response.json();

            if (!response.ok && data.error?.toLowerCase().includes('already enabled')) {
                await fetch(`${API_BASE}/mfa/setup/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, method: selectedMethod }),
                });
                response = await fetch(`${API_BASE}/mfa/setup/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, method: selectedMethod }),
                });
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start MFA setup');
            }

            if (selectedMethod === 'authenticator') {
                const secret = data.secret || '';
                const authUrl = data.otpAuthUrl || '';
                setSecretKey(secret);
                setOtpAuthUrl(authUrl);
                saveMfaSetupState(userId, secret, authUrl);
                setInfoMessage(data.message || '');
                setStep('setup');
            } else if (selectedMethod === 'email') {
                setInfoMessage(data.message || `A code was sent to ${userEmail}`);
                setStep('verify');
            }
        } catch (setupError) {
            setError(setupError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => startAuthenticatorSetup(false);

    const handleStartOver = async () => {
        setOtp('');
        await startAuthenticatorSetup(true);
    };

    const handleVerify = async () => {
        const code = otp.replace(/\D/g, '');
        if (code.length !== 6) return;

        if (selectedMethod === 'authenticator' && !secretKey) {
            setError('Setup session expired. Please start over and enter the setup key again.');
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            const payload = { userId, code };
            if (selectedMethod === 'authenticator' && secretKey) {
                payload.secret = secretKey;
            }

            const response = await fetch(`${API_BASE}/mfa/setup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            clearMfaSetupState();
            const storage = session.rememberMe ? localStorage : sessionStorage;
            storage.setItem('mfaEnabled', 'true');
            setStep('complete');
        } catch (verifyError) {
            setError(verifyError.message);
            setOtp('');
        } finally {
            setIsVerifying(false);
        }
    };

    const pageShellStyle = {
        minHeight: "100vh",
        width: "100%",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px 16px",
    };

    if (step === "complete") {
        return (
            <div style={pageShellStyle}>
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 50% 120%, rgba(15,23,42,0.5), rgba(15,23,42,1))"
                }} />
                <div style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-10%",
                    width: "500px",
                    height: "500px",
                    background: "rgba(37,99,235,0.2)",
                    borderRadius: "50%",
                    filter: "blur(120px)",
                    animation: "pulse 4s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute",
                    bottom: "-20%",
                    right: "-10%",
                    width: "500px",
                    height: "500px",
                    background: "rgba(20,184,166,0.1)",
                    borderRadius: "50%",
                    filter: "blur(120px)",
                    animation: "pulse 4s ease-in-out infinite 2s"
                }} />

                <ParticleBackground />

                <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 16px" }}>
                    <div style={{
                        position: "relative",
                        backdropFilter: "blur(12px)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                        overflow: "hidden"
                    }}>
                        {cardDismiss}
                        <div style={{ padding: "32px", textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    background: "rgba(45,212,191,0.1)",
                                    border: "1px solid rgba(45,212,191,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <span style={{ fontSize: "32px" }}>✓</span>
                                </div>
                            </div>
                            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginBottom: "12px" }}>
                                MFA Enabled Successfully!
                            </h1>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px", lineHeight: "1.5" }}>
                                Your account is now protected with multi-factor authentication.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <button
                                    onClick={() => navigate(isProfileSetup ? '/profile' : getPostAuthPath({
                                        emailVerified: true,
                                        mustChangePassword: false,
                                        mfaEnabled: true,
                                        role: session.role,
                                    }), { replace: true })}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#fff",
                                        cursor: "pointer",
                                        transition: "transform 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    {isProfileSetup ? 'Done' : 'Continue to Dashboard'}
                                </button>
                                {!isProfileSetup && (
                                <Link to="/login" style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "rgba(255,255,255,0.7)",
                                    textAlign: "center",
                                    textDecoration: "none",
                                    transition: "background 0.2s"
                                }}
                                      onMouseEnter={(e) => e.target.style.background = "rgba(51,65,85,0.5)"}
                                      onMouseLeave={(e) => e.target.style.background = "transparent"}>
                                    Back to Login
                                </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageShellStyle}>
            {/* Background Effects */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 50% 120%, rgba(15,23,42,0.5), rgba(15,23,42,1))"
            }} />
            <div style={{
                position: "absolute",
                top: "-20%",
                left: "-10%",
                width: "500px",
                height: "500px",
                background: "rgba(37,99,235,0.2)",
                borderRadius: "50%",
                filter: "blur(120px)",
                animation: "pulse 4s ease-in-out infinite"
            }} />
            <div style={{
                position: "absolute",
                bottom: "-20%",
                right: "-10%",
                width: "500px",
                height: "500px",
                background: "rgba(20,184,166,0.1)",
                borderRadius: "50%",
                filter: "blur(120px)",
                animation: "pulse 4s ease-in-out infinite 2s"
            }} />

            <ParticleBackground />

            {/* Main Card */}
            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "480px", margin: "0 16px" }}>
                <div style={{
                    position: "relative",
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                    overflow: "hidden"
                }}>
                    {cardDismiss}
                    {/* Header */}
                    <div style={{ padding: "32px 32px 24px 32px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <img src={logo} alt="CyForce Technologies" style={{ height: "55px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(56,189,248,0.4))" }} />
                            <div style={{ textAlign: "center" }}>
                                <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", color: "#fff" }}>CyForce</span>
                                <div style={{ fontSize: "10px", fontWeight: "500", letterSpacing: "0.2em", color: "#2DD4BF", textTransform: "uppercase" }}>Technologies</div>
                            </div>
                        </div>
                        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginTop: "24px", marginBottom: "8px" }}>
                            {step === "select" && (isProfileSetup ? "Enable Two-Factor Authentication" : "Setup Two-Factor Authentication")}
                            {step === "setup" && "Add CyForce to your authenticator app"}
                            {step === "verify" && (
                                selectedMethod === "email" ? "Verify Email Code" : "Verify Your Code"
                            )}
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                            {step === "select" && (isProfileSetup
                                ? "Protect your account with an authenticator app or email codes"
                                : "Add an extra layer of security to your account")}
                            {step === "setup" && "On a laptop? Enter the setup key manually — Google Authenticator often cannot scan desktop screens."}
                            {step === "verify" && (
                                selectedMethod === "email" ? "Enter the code we sent to your email"
                                    : "Enter the 6-digit code from your app"
                            )}
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "32px" }}>
                        {/* Step 1: Method Selection */}
                        {error && (
                            <div style={{
                                padding: "10px 12px",
                                marginBottom: "16px",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "10px"
                            }}>
                                <p style={{ fontSize: "12px", color: "#F87171", margin: 0 }}>{error}</p>
                            </div>
                        )}

                        {infoMessage && step !== "select" && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 12px",
                                marginBottom: "16px",
                                background: "rgba(45,212,191,0.1)",
                                border: "1px solid rgba(45,212,191,0.3)",
                                borderRadius: "10px"
                            }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2DD4BF", flexShrink: 0 }} />
                                <p style={{ fontSize: "12px", color: "#5EEAD4" }}>{infoMessage}</p>
                            </div>
                        )}

                        {step === "select" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {MFA_METHODS.map((method) => (
                                    <button
                                        key={method.value}
                                        onClick={() => setSelectedMethod(method.value)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            padding: "16px",
                                            borderRadius: "10px",
                                            border: `1px solid ${selectedMethod === method.value ? "rgba(45,212,191,0.5)" : "rgba(51,65,85,1)"}`,
                                            background: selectedMethod === method.value ? "rgba(45,212,191,0.1)" : "rgba(15,23,42,0.3)",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: selectedMethod === method.value ? "rgba(45,212,191,0.2)" : "rgba(51,65,85,0.5)"
                                        }}>
                                            <span style={{ fontSize: "20px" }}>{method.icon}</span>
                                        </div>
                                        <div style={{ flex: 1, marginLeft: "16px", textAlign: "left" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                <span style={{ fontSize: "14px", fontWeight: "500", color: selectedMethod === method.value ? "#fff" : "rgba(255,255,255,0.7)" }}>
                                                    {method.label}
                                                </span>
                                                {method.recommended && (
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        fontSize: "10px",
                                                        fontWeight: "600",
                                                        background: "rgba(45,212,191,0.2)",
                                                        color: "#2DD4BF",
                                                        borderRadius: "20px"
                                                    }}>
                                                        RECOMMENDED
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{method.description}</p>
                                        </div>
                                        {selectedMethod === method.value && (
                                            <span style={{ fontSize: "18px", color: "#2DD4BF", marginLeft: "8px" }}>✓</span>
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={handleContinue}
                                    disabled={isLoading}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        marginTop: "8px",
                                        background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#fff",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        opacity: isLoading ? 0.7 : 1,
                                        transition: "transform 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) e.currentTarget.style.transform = "scale(1.02)";
                                    }}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    {isLoading ? "Starting setup..." : "Continue"}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Setup Authenticator */}
                        {step === "setup" && selectedMethod === "authenticator" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{
                                    padding: "14px 16px",
                                    borderRadius: "10px",
                                    background: "rgba(251,191,36,0.12)",
                                    border: "1px solid rgba(251,191,36,0.35)",
                                }}>
                                    <p style={{ fontSize: "13px", color: "#FDE68A", margin: 0, lineHeight: 1.55 }}>
                                        <strong>Can&apos;t scan the code?</strong> Google Authenticator on phones often shows
                                        &quot;Try using camera on your iPhone or iPad&quot; when the QR code is on a laptop screen.
                                        Use <strong>Enter a setup key</strong> below instead — or choose Email on the previous step.
                                    </p>
                                </div>

                                <div style={{
                                    padding: "16px",
                                    background: "rgba(15,23,42,0.45)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(45,212,191,0.35)",
                                }}>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#2DD4BF", margin: "0 0 12px" }}>
                                        Recommended: Enter setup key manually
                                    </p>
                                    <ol style={{ margin: "0 0 14px", paddingLeft: "18px", fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                                        <li>Open Google Authenticator (or Authy / Microsoft Authenticator)</li>
                                        <li>Tap <strong>+</strong> → <strong>Enter a setup key</strong> (not &quot;Scan QR code&quot;)</li>
                                        <li>Account name: <strong>CyForce</strong> {userEmail ? `(${userEmail})` : ''}</li>
                                        <li>Paste the key below · Type: <strong>Time based</strong></li>
                                    </ol>
                                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", margin: "0 0 8px" }}>Your setup key</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,1)", borderRadius: "10px" }}>
                                        <code style={{ flex: 1, fontSize: "15px", color: "#fff", fontFamily: "monospace", letterSpacing: "0.08em", wordBreak: "break-all" }}>
                                            {formatSecretKey(secretKey)}
                                        </code>
                                        <button type="button" onClick={handleCopySecret} style={{ padding: "8px 12px", background: "rgba(43,92,230,0.35)", border: "none", cursor: "pointer", borderRadius: "6px", color: "#fff", fontSize: "12px", whiteSpace: "nowrap" }}>
                                            {copied ? "Copied!" : "Copy key"}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
                                        Optional — scan with iPhone/iPad camera (point at this screen)
                                    </p>
                                    <div style={{ display: "inline-block", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
                                        {otpAuthUrl ? (
                                            <QRCodeSVG value={otpAuthUrl} size={220} level="H" includeMargin bgColor="#FFFFFF" fgColor="#000000" />
                                        ) : (
                                            <div style={{ width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                                                Loading QR…
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="button" onClick={() => { setOtp(''); setStep('verify'); }} style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    cursor: "pointer",
                                    transition: "transform 0.2s"
                                }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                                    Continue to Verification
                                </button>
                                <button type="button" onClick={() => { setOtp(''); setStep('select'); }} style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: "transparent",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    fontSize: "13px",
                                    color: "rgba(255,255,255,0.55)",
                                    cursor: "pointer",
                                }}>
                                    Use Email instead
                                </button>
                                <button type="button" onClick={handleStartOver} disabled={isLoading} style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: "transparent",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    fontSize: "13px",
                                    color: "rgba(255,255,255,0.55)",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                }}>
                                    {isLoading ? "Resetting…" : "Start over (new setup key)"}
                                </button>
                            </div>
                        )}

                        {step === "verify" && selectedMethod === "email" && (
                            <div style={{
                                padding: "16px",
                                marginBottom: "16px",
                                background: "rgba(15,23,42,0.3)",
                                borderRadius: "10px",
                                border: "1px solid rgba(51,65,85,0.5)",
                                textAlign: "center"
                            }}>
                                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                                    Enter the 6-digit code sent to{" "}
                                    <strong style={{ color: "#fff" }}>{userEmail}</strong>
                                </p>
                            </div>
                        )}

                        {/* Step 3: Verify Code */}
                        {step === "verify" && selectedMethod === "authenticator" && (
                            <div style={{
                                padding: "12px",
                                marginBottom: "8px",
                                background: "rgba(15,23,42,0.3)",
                                borderRadius: "10px",
                                border: "1px solid rgba(51,65,85,0.5)",
                                textAlign: "center",
                            }}>
                                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
                                    Use the 6-digit code for <strong style={{ color: "#fff" }}>CyForce</strong> ({userEmail})
                                </p>
                                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                                    If codes keep failing, tap “Start over”, delete old CyForce entries in your app, then add the account again with a new setup key.
                                </p>
                            </div>
                        )}

                        {step === "verify" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <div style={{
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "50%",
                                        background: "rgba(45,212,191,0.1)",
                                        border: "1px solid rgba(45,212,191,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <span style={{ fontSize: "32px" }}>
                                            {selectedMethod === "email" ? "✉️" : "🔑"}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "12px" }}>
                                        {selectedMethod === "email" ? "Enter Email Code" : "Enter 6-Digit Code"}
                                    </label>
                                    <OTPInput value={otp} onChange={setOtp} length={6} />
                                </div>

                                <button onClick={handleVerify} disabled={otp.length !== 6 || isVerifying} style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    cursor: otp.length === 6 && !isVerifying ? "pointer" : "not-allowed",
                                    opacity: otp.length === 6 && !isVerifying ? 1 : 0.7,
                                    transition: "transform 0.2s"
                                }}>
                                    {isVerifying ? "Verifying..." : "Verify & Enable MFA"}
                                </button>

                                <button type="button" onClick={() => { setOtp(''); setStep(selectedMethod === "authenticator" ? "setup" : "select"); }} style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    color: "rgba(255,255,255,0.4)",
                                    cursor: "pointer",
                                    transition: "color 0.2s"
                                }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                                    Back to Setup
                                </button>
                                {selectedMethod === "authenticator" && (
                                    <button type="button" onClick={handleStartOver} disabled={isLoading} style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "13px",
                                        color: "#2DD4BF",
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                    }}>
                                        Start over with a new setup key
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: "16px 32px",
                        background: "rgba(15,23,42,0.3)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                            Need help?{" "}
                            <Link to="/help" style={{ color: "#2DD4BF", textDecoration: "none" }}>
                                Visit Help Center
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                {!isProfileSetup && (
                <div style={{
                    marginTop: "32px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)"
                }}>
                    <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
                    <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
                    <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>Back to Login</Link>
                </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default MFASetupPage;