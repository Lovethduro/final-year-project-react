// src/RegisterPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';

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
    { value: "customer", label: "Customer", icon: "👤", description: "Access customer portal & support", requiresCustomerType: true },
    { value: "sales_agent", label: "Sales Agent", icon: "📊", description: "Sales & pipeline management", requiresCustomerType: false },
    { value: "support_agent", label: "Support Agent", icon: "🎫", description: "Customer support & tickets", requiresCustomerType: false },
    { value: "supervisor", label: "Supervisor", icon: "👥", description: "Team oversight & reporting", requiresCustomerType: false },
    { value: "admin", label: "Administrator", icon: "⚙️", description: "Full system access", requiresCustomerType: false }
];

const CUSTOMER_TYPES = [
    { value: "individual", label: "Individual", icon: "👤", description: "Personal account" },
    { value: "business", label: "Business", icon: "🏢", description: "Small to medium business" },
    { value: "enterprise", label: "Enterprise", icon: "🏭", description: "Large organization" }
];

// Password Strength Indicator Component
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
    const getColor = () => {
        if (strength <= 1) return "#EF4444";
        if (strength <= 3) return "#EAB308";
        return "#22C55E";
    };

    const getLabel = () => {
        if (strength <= 1) return "Weak";
        if (strength <= 3) return "Medium";
        return "Strong";
    };

    if (!password) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "4px",
                            background: level <= strength ? getColor() : "rgba(51,65,85,1)",
                            transition: "all 0.2s"
                        }}
                    />
                ))}
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                Password strength: <span style={{ fontWeight: "500", color: getColor() }}>{getLabel()}</span>
            </p>
        </div>
    );
}

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        password: "",
        confirmPassword: "",
    });
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedCustomerType, setSelectedCustomerType] = useState("");
    const [roleOpen, setRoleOpen] = useState(false);
    const [customerTypeOpen, setCustomerTypeOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedRoleData = ROLES.find(r => r.value === selectedRole);
    const selectedCustomerTypeData = CUSTOMER_TYPES.find(ct => ct.value === selectedCustomerType);
    const isCustomerRole = selectedRoleData?.requiresCustomerType;
    const needsCompanyName = selectedCustomerType === "business" || selectedCustomerType === "enterprise";

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!selectedRole) {
            setError("Please select your role");
            return false;
        }
        if (isCustomerRole && !selectedCustomerType) {
            setError("Please select your customer type");
            return false;
        }
        if (!formData.fullName.trim()) {
            setError("Full name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (needsCompanyName && !formData.companyName.trim()) {
            setError("Company name is required");
            return false;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (!agreeToTerms) {
            setError("You must agree to the terms and conditions");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            console.log("Registration:", { ...formData, role: selectedRole, customerType: selectedCustomerType });
            navigate("/verify-email");
        }, 2000);
    };

    const handleSSORegister = (provider) => {
        console.log(`SSO Register with ${provider}`);
    };

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            background: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "100px",
            paddingBottom: "60px",
            paddingLeft: "20px",
            paddingRight: "20px",
            fontFamily: "'DM Sans', sans-serif",
            position: "relative"
        }}>
            {/* Background Effects */}
            <div style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(circle at 50% 120%, rgba(15,23,42,0.5), rgba(15,23,42,1))",
                zIndex: 0
            }} />
            <div style={{
                position: "fixed",
                top: "-20%",
                left: "-10%",
                width: "500px",
                height: "500px",
                background: "rgba(37,99,235,0.2)",
                borderRadius: "50%",
                filter: "blur(120px)",
                animation: "pulse 4s ease-in-out infinite",
                zIndex: 0
            }} />
            <div style={{
                position: "fixed",
                bottom: "-20%",
                right: "-10%",
                width: "500px",
                height: "500px",
                background: "rgba(20,184,166,0.1)",
                borderRadius: "50%",
                filter: "blur(120px)",
                animation: "pulse 4s ease-in-out infinite 2s",
                zIndex: 0
            }} />

            <ParticleBackground />

            {/* Main Card */}
            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                maxWidth: "700px",
                margin: "0 auto"
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
                    <div style={{ padding: "32px 32px 24px 32px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
                            Create Your Account
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                            Join CyForce to access our platform
                        </p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: "32px" }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Role & Customer Type Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isCustomerRole ? "1fr 1fr" : "1fr",
                                gap: "16px"
                            }}>
                                {/* Role Selector */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span>👤</span> Select Your Role
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRoleOpen(!roleOpen);
                                                setCustomerTypeOpen(false);
                                            }}
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
                                                cursor: "pointer",
                                                color: selectedRole ? "#fff" : "rgba(255,255,255,0.5)"
                                            }}
                                        >
                                            <span>{selectedRoleData ? selectedRoleData.label : "Choose role..."}</span>
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
                                                            if (!role.requiresCustomerType) {
                                                                setSelectedCustomerType("");
                                                            }
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            alignItems: "flex-start",
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            borderBottom: "1px solid rgba(51,65,85,0.5)",
                                                            background: selectedRole === role.value ? "rgba(45,212,191,0.1)" : "transparent",
                                                            cursor: "pointer"
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

                                {/* Customer Type Selector (only for customer role) */}
                                {isCustomerRole && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span>🏢</span> Customer Type
                                        </label>
                                        <div style={{ position: "relative" }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomerTypeOpen(!customerTypeOpen);
                                                    setRoleOpen(false);
                                                }}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 12px",
                                                    background: "rgba(15,23,42,0.5)",
                                                    border: customerTypeOpen ? "1px solid #2DD4BF" : (selectedCustomerType ? "1px solid rgba(45,212,191,0.6)" : "1px solid rgba(51,65,85,1)"),
                                                    borderRadius: "10px",
                                                    fontSize: "14px",
                                                    cursor: "pointer",
                                                    color: selectedCustomerType ? "#fff" : "rgba(255,255,255,0.5)"
                                                }}
                                            >
                                                <span>{selectedCustomerTypeData ? selectedCustomerTypeData.label : "Choose type..."}</span>
                                                <span style={{ fontSize: "12px", color: "#2DD4BF" }}>{customerTypeOpen ? "▲" : "▼"}</span>
                                            </button>

                                            {customerTypeOpen && (
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
                                                    {CUSTOMER_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCustomerType(type.value);
                                                                setCustomerTypeOpen(false);
                                                                setError("");
                                                            }}
                                                            style={{
                                                                width: "100%",
                                                                display: "flex",
                                                                alignItems: "flex-start",
                                                                padding: "12px 16px",
                                                                textAlign: "left",
                                                                borderBottom: "1px solid rgba(51,65,85,0.5)",
                                                                background: selectedCustomerType === type.value ? "rgba(45,212,191,0.1)" : "transparent",
                                                                cursor: "pointer"
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51,65,85,0.5)"}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = selectedCustomerType === type.value ? "rgba(45,212,191,0.1)" : "transparent"}
                                                        >
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: "14px", fontWeight: "500", color: selectedCustomerType === type.value ? "#2DD4BF" : "#fff", marginBottom: "2px" }}>
                                                                    <span style={{ marginRight: "8px" }}>{type.icon}</span>
                                                                    {type.label}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{type.description}</div>
                                                            </div>
                                                            {selectedCustomerType === type.value && (
                                                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2DD4BF", marginTop: "6px" }} />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Name & Email Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {/* Full Name */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Full Name</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>👤</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleChange("fullName", e.target.value)}
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px 10px 38px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                outline: "none"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                            onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Email Address</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>✉️</span>
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px 10px 38px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                outline: "none"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                            onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone & Company Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: needsCompanyName ? "1fr 1fr" : "1fr",
                                gap: "16px"
                            }}>
                                {/* Phone */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Phone Number</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>📞</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px 10px 38px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                outline: "none"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                            onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                            placeholder="+234 800 000 0000"
                                        />
                                    </div>
                                </div>

                                {/* Company Name (conditional) */}
                                {needsCompanyName && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Company Name</label>
                                        <div style={{ position: "relative" }}>
                                            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                                <span style={{ fontSize: "16px" }}>🏢</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => handleChange("companyName", e.target.value)}
                                                required={needsCompanyName}
                                                style={{
                                                    width: "100%",
                                                    padding: "10px 12px 10px 38px",
                                                    background: "rgba(15,23,42,0.5)",
                                                    border: "1px solid rgba(51,65,85,1)",
                                                    borderRadius: "10px",
                                                    fontSize: "14px",
                                                    color: "#fff",
                                                    outline: "none"
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                                onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                                placeholder="Your Company Ltd"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Password Fields */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {/* Password */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Password</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>🔒</span>
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px 10px 38px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                outline: "none"
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

                                {/* Confirm Password */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Confirm Password</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>🔒</span>
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px 10px 38px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                outline: "none"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                            onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                            {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            <PasswordStrengthIndicator password={formData.password} />

                            {/* Terms and Conditions */}
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                padding: "12px",
                                background: "rgba(15,23,42,0.3)",
                                borderRadius: "10px",
                                border: "1px solid rgba(51,65,85,0.5)"
                            }}>
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    style={{
                                        marginTop: "2px",
                                        width: "16px",
                                        height: "16px",
                                        cursor: "pointer",
                                        accentColor: "#2DD4BF"
                                    }}
                                />
                                <label htmlFor="terms" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                                    I agree to the{" "}
                                    <Link to="/terms" style={{ color: "#2DD4BF", textDecoration: "none" }}>Terms of Service</Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" style={{ color: "#2DD4BF", textDecoration: "none" }}>Privacy Policy</Link>
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
                                    padding: "12px 16px",
                                    background: "linear-gradient(135deg, #2563EB, #2DD4BF)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: "all 0.2s"
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
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
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
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        {/* SSO Buttons */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <button
                                type="button"
                                onClick={() => handleSSORegister("google")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 16px",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    background: "rgba(15,23,42,0.5)",
                                    cursor: "pointer",
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
                                <span style={{ fontSize: "18px" }}>G</span>
                                <span style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSSORegister("microsoft")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px 16px",
                                    border: "1px solid rgba(51,65,85,1)",
                                    borderRadius: "10px",
                                    background: "rgba(15,23,42,0.5)",
                                    cursor: "pointer",
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
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "#2DD4BF", textDecoration: "none", fontWeight: "500" }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
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

export default RegisterPage;