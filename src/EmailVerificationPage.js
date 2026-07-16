import { theme } from './styles/theme';
// src/EmailVerificationPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';

import { API_BASE, getPostAuthPath } from './utils/authFlow';

// Animated Particle Background
function ParticleBackground() {
    const canvasRef = useRef(null);

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
                    color: `rgba(0, 45, 114, ${Math.random() * 0.2 + 0.05})`
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

function EmailVerificationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const userEmail = localStorage.getItem('userEmail') || '';
    const token = searchParams.get('token');

    const completeVerification = useCallback(() => {
        localStorage.setItem('emailVerified', 'true');
        setIsVerified(true);
        setTimeout(() => {
            navigate(getPostAuthPath({
                emailVerified: true,
                mustChangePassword: localStorage.getItem('mustChangePassword') === 'true',
                mfaEnabled: localStorage.getItem('mfaEnabled') === 'true',
                role: localStorage.getItem('userRole'),
            }));
        }, 2000);
    }, [navigate]);

    const verifyWithToken = useCallback(async (verificationToken) => {
        const response = await fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(verificationToken)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Verification failed');
        }

        completeVerification();
    }, [completeVerification]);

    const checkVerificationStatus = async () => {
        if (!userEmail) {
            throw new Error('No email found. Please register again.');
        }

        const response = await fetch(`${API_BASE}/verification-status?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Could not check verification status');
        }

        if (data.verified) {
            completeVerification();
            return;
        }

        throw new Error('Email not verified yet. Please click the link in your inbox first.');
    };

    useEffect(() => {
        if (!token) return;

        const autoVerify = async () => {
            setIsVerifying(true);
            setError("");

            try {
                await verifyWithToken(token);
            } catch (verifyError) {
                setError(verifyError.message);
            } finally {
                setIsVerifying(false);
            }
        };

        autoVerify();
    }, [token, verifyWithToken]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const handleVerify = async () => {
        setIsVerifying(true);
        setError("");
        setResendMessage("");

        try {
            if (token) {
                await verifyWithToken(token);
            } else {
                await checkVerificationStatus();
            }
        } catch (verifyError) {
            setError(verifyError.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        if (!userEmail) {
            setError('No email found. Please register again.');
            return;
        }

        setError("");
        setResendMessage("");
        setCanResend(false);
        setResendCooldown(60);

        try {
            const response = await fetch(`${API_BASE}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend verification email');
            }

            setResendMessage('Verification email sent. Check your inbox.');
        } catch (resendError) {
            setError(resendError.message);
            setCanResend(true);
            setResendCooldown(0);
        }
    };

    if (isVerified) {
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

                <div style={{
                    position: "relative",
                    zIndex: 10,
                    width: "100%",
                    maxWidth: "420px",
                    margin: "0 16px"
                }}>
                    <div style={{
                        backdropFilter: "blur(12px)",
                        background: "rgba(15,23,42,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                        overflow: "hidden"
                    }}>
                        <div style={{ padding: "32px", textAlign: "center" }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "24px"
                            }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    background: "rgba(45,212,191,0.1)",
                                    border: "1px solid rgba(45,212,191,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    animation: "pulse 2s ease-in-out infinite"
                                }}>
                                    <span style={{ fontSize: "32px" }}>✓</span>
                                </div>
                            </div>
                            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0F172A", marginBottom: "12px" }}>
                                Email Verified!
                            </h1>
                            <p style={{ fontSize: "14px", color: "rgba(15,23,42,0.55)", marginBottom: "8px" }}>
                                Your email has been successfully verified.
                            </p>
                            <p style={{ fontSize: "12px", color: "rgba(15,23,42,0.45)", marginBottom: "24px" }}>
                                Redirecting you to your dashboard...
                            </p>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    border: "2px solid rgba(45,212,191,0.3)",
                                    borderTopColor: "#1A4A9E",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite"
                                }} />
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

            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                maxWidth: "480px",
                margin: "0 16px"
            }}>
                <div style={{
                    backdropFilter: "blur(12px)",
                    background: "rgba(15,23,42,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                    overflow: "hidden"
                }}>
                    <div style={{ padding: "32px 32px 24px 32px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <img
                                src={logo}
                                alt="CyForce Technologies"
                                style={{
                                    height: "55px",
                                    width: "auto",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 0 8px rgba(0,45,114,0.4))"
                                }}
                            />
                            <div style={{ textAlign: "center" }}>
                                <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", color: "#0F172A" }}>CyForce</span>
                                <div style={{ fontSize: "10px", fontWeight: "500", letterSpacing: "0.2em", color: "#1A4A9E", textTransform: "uppercase" }}>
                                    Technologies
                                </div>
                            </div>
                        </div>
                        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0F172A", marginTop: "24px", marginBottom: "8px" }}>
                            Verify Your Email
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(15,23,42,0.55)" }}>
                            We sent a verification email to
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A", marginTop: "4px" }}>
                            {userEmail || 'your email address'}
                        </p>
                    </div>

                    <div style={{ padding: "0 32px 32px 32px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(45,212,191,0.2))",
                                    border: "1px solid rgba(45,212,191,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <span style={{ fontSize: "40px" }}>✉️</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(15,23,42,0.3)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(51,65,85,0.5)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            background: "rgba(45,212,191,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1A4A9E" }}>1</span>
                                        </div>
                                        <p style={{ fontSize: "12px", color: "rgba(15,23,42,0.55)", lineHeight: "1.5" }}>
                                            Check your inbox for an email from CyForce Technologies
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(15,23,42,0.3)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(51,65,85,0.5)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            background: "rgba(45,212,191,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1A4A9E" }}>2</span>
                                        </div>
                                        <p style={{ fontSize: "12px", color: "rgba(15,23,42,0.55)", lineHeight: "1.5" }}>
                                            Click the verification link in the email
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(15,23,42,0.3)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(51,65,85,0.5)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            background: "rgba(45,212,191,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1A4A9E" }}>3</span>
                                        </div>
                                        <p style={{ fontSize: "12px", color: "rgba(15,23,42,0.55)", lineHeight: "1.5" }}>
                                            Return here and click "I've Verified My Email"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {resendMessage && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 12px",
                                    background: "rgba(45,212,191,0.1)",
                                    border: "1px solid rgba(45,212,191,0.3)",
                                    borderRadius: "10px"
                                }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1A4A9E", flexShrink: 0 }} />
                                    <p style={{ fontSize: "12px", color: "#5EEAD4" }}>{resendMessage}</p>
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    padding: "10px 12px",
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: "10px"
                                }}>
                                    <p style={{ fontSize: "12px", color: "#F87171", margin: 0 }}>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: "10px 16px",
                                    background: "linear-gradient(135deg, #002D72, #1A4A9E)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#0F172A",
                                    cursor: isVerifying ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    opacity: isVerifying ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isVerifying) {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(45,212,191,0.3)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {isVerifying ? (
                                    <>
                                        <span style={{
                                            display: "inline-block",
                                            width: "14px",
                                            height: "14px",
                                            border: "2px solid white",
                                            borderTop: "2px solid transparent",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                            animation: "spin 1s linear infinite"
                                        }} />
                                        Verifying...
                                    </>
                                ) : (
                                    "I've Verified My Email"
                                )}
                            </button>

                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontSize: "11px", color: "rgba(15,23,42,0.55)", marginBottom: "8px" }}>
                                    Didn't receive the email?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={!canResend}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        color: canResend ? "#1A4A9E" : "rgba(255,255,255,0.3)",
                                        cursor: canResend ? "pointer" : "not-allowed",
                                        transition: "color 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (canResend) e.currentTarget.style.color = "#14b8a6";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (canResend) e.currentTarget.style.color = "#1A4A9E";
                                    }}
                                >
                                    <span style={{ marginRight: "6px" }}>↻</span>
                                    {canResend
                                        ? "Resend Verification Email"
                                        : `Resend in ${resendCooldown}s`}
                                </button>
                            </div>

                            <div style={{
                                padding: "12px",
                                background: "rgba(37,99,235,0.05)",
                                border: "1px solid rgba(37,99,235,0.2)",
                                borderRadius: "10px"
                            }}>
                                <p style={{ fontSize: "11px", color: "rgba(15,23,42,0.55)", lineHeight: "1.4" }}>
                                    <strong style={{ color: theme.textMuted }}>Note:</strong> Check your spam or
                                    junk folder if you don't see the email within a few minutes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: "16px 32px",
                        background: "rgba(15,23,42,0.3)",
                        borderTop: "1px solid rgba(15,23,42,0.04)",
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: "12px", color: "rgba(15,23,42,0.55)" }}>
                            Wrong email?{" "}
                            <Link to="/register" style={{ color: "#1A4A9E", textDecoration: "none", fontWeight: "500" }}>
                                Create a new account
                            </Link>
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: "32px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    fontSize: "11px",
                    color: "rgba(15,23,42,0.45)"
                }}>
                    <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
                    <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
                    <Link to="/help" style={{ color: "inherit", textDecoration: "none" }}>Help Center</Link>
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

export default EmailVerificationPage;