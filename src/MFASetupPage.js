// src/MFASetupPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';

import { API_BASE } from './utils/authFlow';

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

const MFA_METHODS = [
    { value: "authenticator", label: "Authenticator App", description: "Use Google Authenticator, Authy, or similar", icon: "📱", recommended: true },
    { value: "email", label: "Email Verification", description: "Receive codes via email", icon: "✉️", recommended: false },
    { value: "sms", label: "SMS Verification", description: "Receive codes via text message", icon: "💬", recommended: false }
];

function MFASetupPage() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail') || '';
    const userPhone = localStorage.getItem('userPhone') || '';

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

    const qrCodeUrl = otpAuthUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`
        : "";

    useEffect(() => {
        if (!userId) {
            navigate('/register');
        }
    }, [userId, navigate]);

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secretKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleContinue = async () => {
        setError("");
        setInfoMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/mfa/setup/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, method: selectedMethod }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start MFA setup');
            }

            if (selectedMethod === 'authenticator') {
                setSecretKey(data.secret || '');
                setOtpAuthUrl(data.otpAuthUrl || '');
                setInfoMessage(data.message || '');
                setStep('setup');
            } else if (selectedMethod === 'email' || selectedMethod === 'sms') {
                setInfoMessage(data.message || (
                    selectedMethod === 'sms'
                        ? `A code was sent to ${userPhone || 'your phone'}`
                        : `A code was sent to ${userEmail}`
                ));
                setStep('verify');
            }
        } catch (setupError) {
            setError(setupError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) return;

        setIsVerifying(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE}/mfa/setup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            localStorage.setItem('mfaEnabled', 'true');
            setStep('complete');
        } catch (verifyError) {
            setError(verifyError.message);
        } finally {
            setIsVerifying(false);
        }
    };

    if (step === "complete") {
        return (
            <div style={{
                minHeight: "100vh",
                width: "100%",
                background: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'DM Sans', sans-serif"
            }}>
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
                        backdropFilter: "blur(12px)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                        overflow: "hidden"
                    }}>
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
                                    onClick={() => navigate("/login")}
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
                                    Continue to Login
                                </button>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            background: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif",
            paddingTop: "80px",
            paddingBottom: "40px"
        }}>
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
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                    overflow: "hidden"
                }}>
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
                            {step === "select" && "Setup Two-Factor Authentication"}
                            {step === "setup" && "Configure Authenticator App"}
                            {step === "verify" && (
                                selectedMethod === "email" ? "Verify Email Code"
                                    : selectedMethod === "sms" ? "Verify SMS Code"
                                    : "Verify Your Code"
                            )}
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                            {step === "select" && "Add an extra layer of security to your account"}
                            {step === "setup" && "Scan the QR code with your authenticator app"}
                            {step === "verify" && (
                                selectedMethod === "email" ? "Enter the code we sent to your email"
                                    : selectedMethod === "sms" ? "Enter the code we sent to your phone"
                                    : "Enter the 6-digit code from your app"
                            )}
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "32px" }}>
                        {/* Step 1: Method Selection */}
                        {error && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 12px",
                                marginBottom: "16px",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "10px"
                            }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                                <p style={{ fontSize: "12px", color: "#F87171" }}>{error}</p>
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
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <div style={{ padding: "16px", background: "#fff", borderRadius: "12px" }}>
                                        <img src={qrCodeUrl} alt="QR Code" style={{ width: "180px", height: "180px" }} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "rgba(15,23,42,0.3)", borderRadius: "10px", border: "1px solid rgba(51,65,85,0.5)" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(45,212,191,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</div>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Download an authenticator app like Google Authenticator or Authy</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "rgba(15,23,42,0.3)", borderRadius: "10px", border: "1px solid rgba(51,65,85,0.5)" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(45,212,191,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Scan the QR code above with your authenticator app</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "rgba(15,23,42,0.3)", borderRadius: "10px", border: "1px solid rgba(51,65,85,0.5)" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(45,212,191,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
                                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Or manually enter this secret key:</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,1)", borderRadius: "10px" }}>
                                    <code style={{ flex: 1, fontSize: "14px", color: "#fff", fontFamily: "monospace" }}>{secretKey}</code>
                                    <button onClick={handleCopySecret} style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", borderRadius: "6px", transition: "background 0.2s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51,65,85,0.5)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                        {copied ? "✓" : "📋"}
                                    </button>
                                </div>

                                <button onClick={() => setStep("verify")} style={{
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
                            </div>
                        )}

                        {step === "verify" && (selectedMethod === "email" || selectedMethod === "sms") && (
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
                                    <strong style={{ color: "#fff" }}>
                                        {selectedMethod === "sms" ? (userPhone || "your phone") : userEmail}
                                    </strong>
                                </p>
                            </div>
                        )}

                        {/* Step 3: Verify Code */}
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
                                            {selectedMethod === "email" ? "✉️" : selectedMethod === "sms" ? "💬" : "🔑"}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: "center" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "12px" }}>
                                        {selectedMethod === "email" ? "Enter Email Code"
                                            : selectedMethod === "sms" ? "Enter SMS Code"
                                            : "Enter 6-Digit Code"}
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

                                <button onClick={() => setStep(selectedMethod === "authenticator" ? "setup" : "select")} style={{
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