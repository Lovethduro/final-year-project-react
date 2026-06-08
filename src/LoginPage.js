// src/LoginPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { API_BASE, getPostAuthPath, storeAuthSession } from './utils/authFlow';

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

// Microsoft SVG Icon
function MicrosoftIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
    );
}

const ROLES = [
    { value: "customer", label: "Customer", icon: "👤", description: "Access customer portal & support" },
    { value: "sales_agent", label: "Sales Agent", icon: "📊", description: "Sales & pipeline management" },
    { value: "support_agent", label: "Support Agent", icon: "🎫", description: "Customer support & tickets" },
    { value: "supervisor", label: "Supervisor", icon: "👥", description: "Team oversight & reporting" },
    { value: "admin", label: "Administrator", icon: "⚙️", description: "Full system access" }
];

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [roleOpen, setRoleOpen] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const selectedRoleData = ROLES.find(r => r.value === selectedRole);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError("Please select your role to continue.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    role: selectedRole,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            storeAuthSession(data);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            }

            navigate(getPostAuthPath(data));
        } catch (loginError) {
            setError(loginError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSSOLogin = async (provider) => {
        if (!selectedRole) {
            setError("Please select your role before using SSO.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const { signInWithGoogle, signInWithMicrosoft } = await import('./utils/sso');
            const result = provider === 'google'
                ? await signInWithGoogle(selectedRole)
                : await signInWithMicrosoft(selectedRole);

            navigate(result.nextPath);
        } catch (loginError) {
            setError(loginError.message || 'Sign-in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
            paddingTop: "80px",  // Add this line
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
            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                maxWidth: "420px",
                margin: "0 16px"
            }}>
                <div style={{
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                    overflow: "hidden"
                }}>
                    {/* Header */}
                    <div style={{ padding: "32px 32px 24px 32px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <img
                                src={logo}
                                alt="CyForce Technologies"
                                style={{
                                    height: "55px",
                                    width: "auto",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 0 8px rgba(56,189,248,0.4))"
                                }}
                            />
                            <div style={{ textAlign: "center" }}>
                                <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px", color: "#fff" }}>CyForce</span>
                                <div style={{ fontSize: "10px", fontWeight: "500", letterSpacing: "0.2em", color: "#2DD4BF", textTransform: "uppercase" }}>
                                    Technologies
                                </div>
                            </div>
                        </div>
                        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#fff", marginTop: "24px", marginBottom: "8px" }}>
                            Welcome Back
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                            Sign in to access your Cyforce dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: "0 32px 32px 32px" }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Role Selector */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>👤</span> Select Your Role
                                </label>
                                <div style={{ position: "relative" }}>
                                    <button
                                        type="button"
                                        onClick={() => setRoleOpen(!roleOpen)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "10px 12px",
                                            background: "rgba(15,23,42,0.5)",
                                            border: roleOpen ? "1px solid #2DD4BF" : (selectedRole ? "1px solid rgba(45,212,191,0.6)" : "1px solid rgba(51,65,85,1)"),
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            transition: "all 0.2s",
                                            cursor: "pointer",
                                            color: selectedRole ? "#fff" : "rgba(255,255,255,0.5)"
                                        }}
                                    >
                                        <span>{selectedRoleData ? selectedRoleData.label : "Choose your access role..."}</span>
                                        <span style={{ fontSize: "12px", color: "#2DD4BF" }}>{roleOpen ? "▲" : "▼"}</span>
                                    </button>

                                    {roleOpen && (
                                        <div style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            marginTop: "4px",
                                            background: "#0F172A",
                                            border: "1px solid rgba(51,65,85,1)",
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            zIndex: 50,
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                                        }}>
                                            {ROLES.map((role) => (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRole(role.value);
                                                        setRoleOpen(false);
                                                        setError("");
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        padding: "12px 16px",
                                                        textAlign: "left",
                                                        borderBottom: "1px solid rgba(51,65,85,0.5)",
                                                        background: selectedRole === role.value ? "rgba(45,212,191,0.1)" : "transparent",
                                                        cursor: "pointer",
                                                        transition: "background 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51,65,85,0.5)"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = selectedRole === role.value ? "rgba(45,212,191,0.1)" : "transparent"}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: "14px", fontWeight: "500", color: selectedRole === role.value ? "#2DD4BF" : "#fff", marginBottom: "2px" }}>
                                                            <span style={{ marginRight: "8px" }}>{role.icon}</span>
                                                            {role.label}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{role.description}</div>
                                                    </div>
                                                    {selectedRole === role.value && (
                                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2DD4BF", marginTop: "6px" }} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px" }}>
                                    Email Address
                                </label>
                                <div style={{ position: "relative" }}>
                                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <span style={{ fontSize: "16px" }}>✉️</span>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px 10px 38px",
                                            background: "rgba(15,23,42,0.5)",
                                            border: "1px solid rgba(51,65,85,1)",
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                        onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                        placeholder="name@cyforce.ng"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "4px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: "11px", fontWeight: "500", color: "#2DD4BF", textDecoration: "none" }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <span style={{ fontSize: "16px" }}>🔒</span>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px 10px 38px",
                                            background: "rgba(15,23,42,0.5)",
                                            border: "1px solid rgba(51,65,85,1)",
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                        onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "16px"
                                        }}
                                    >
                                        {showPassword ? "👁️‍🗨️" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "8px",
                                        cursor: "pointer",
                                        accentColor: "#2DD4BF"
                                    }}
                                />
                                <label htmlFor="remember-me" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                                    Remember me
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 12px",
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: "10px"
                                }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                                    <p style={{ fontSize: "12px", color: "#F87171" }}>{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: "10px 16px",
                                    background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    opacity: isLoading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(45,212,191,0.3)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {isLoading ? (
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
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in to Account"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ position: "relative", marginTop: "32px", marginBottom: "24px" }}>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                                <div style={{ width: "100%", borderTop: "1px solid rgba(51,65,85,0.5)" }}></div>
                            </div>
                            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <span style={{ background: "#162032", padding: "0 8px", fontSize: "11px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", borderRadius: "4px" }}>
                  Or continue with
                </span>
                            </div>
                        </div>

                        {/* SSO Login */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <button
                                type="button"
                                onClick={() => handleSSOLogin("google")}
                                disabled={isLoading}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 16px",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    background: "rgba(15,23,42,0.5)",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    gap: "8px",
                                    opacity: isLoading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) e.currentTarget.style.background = "rgba(51,65,85,0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(15,23,42,0.5)";
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>G</span>
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSSOLogin("microsoft")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 16px",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    background: "rgba(15,23,42,0.5)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    gap: "8px"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(51,65,85,0.5)";
                                    e.currentTarget.style.borderColor = "rgba(71,85,105,1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(15,23,42,0.5)";
                                    e.currentTarget.style.borderColor = "rgba(51,65,85,1)";
                                }}
                            >
                                <MicrosoftIcon />
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Microsoft</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: "16px 32px",
                        background: "rgba(15,23,42,0.3)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                            Don't have an account?{" "}
                            <Link to="/register" style={{ color: "#2DD4BF", textDecoration: "none", fontWeight: "500" }}>
                                Create an account
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

export default LoginPage;