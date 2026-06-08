// src/RegisterPage.jsx
import React, { useState, useEffect, useRef } from 'react';
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

const CUSTOMER_TYPES = [
    { value: "individual", label: "Individual", icon: "👤", description: "Personal account" },
    { value: "business", label: "Business", icon: "🏢", description: "Small to medium business" },
    { value: "enterprise", label: "Enterprise", icon: "🏭", description: "Large organization" }
];

const COUNTRY_CODES = [
    // Africa
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+233", country: "Ghana", flag: "🇬🇭" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+212", country: "Morocco", flag: "🇲🇦" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
    { code: "+255", country: "Tanzania", flag: "🇹🇿" },
    { code: "+256", country: "Uganda", flag: "🇺🇬" },
    { code: "+260", country: "Zambia", flag: "🇿🇲" },
    { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
    { code: "+222", country: "Mauritania", flag: "🇲🇷" },
    { code: "+223", country: "Mali", flag: "🇲🇱" },
    { code: "+224", country: "Guinea", flag: "🇬🇳" },
    { code: "+225", country: "Ivory Coast", flag: "🇨🇮" },
    { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
    { code: "+227", country: "Niger", flag: "🇳🇪" },
    { code: "+228", country: "Togo", flag: "🇹🇬" },
    { code: "+229", country: "Benin", flag: "🇧🇯" },
    { code: "+230", country: "Mauritius", flag: "🇲🇺" },
    { code: "+231", country: "Liberia", flag: "🇱🇷" },
    { code: "+232", country: "Sierra Leone", flag: "🇸🇱" },
    { code: "+235", country: "Chad", flag: "🇹🇩" },
    { code: "+236", country: "Central African Republic", flag: "🇨🇫" },
    { code: "+237", country: "Cameroon", flag: "🇨🇲" },
    { code: "+238", country: "Cape Verde", flag: "🇨🇻" },
    { code: "+239", country: "Sao Tome and Principe", flag: "🇸🇹" },
    { code: "+240", country: "Equatorial Guinea", flag: "🇬🇶" },
    { code: "+241", country: "Gabon", flag: "🇬🇦" },
    { code: "+242", country: "Republic of Congo", flag: "🇨🇬" },
    { code: "+243", country: "DR Congo", flag: "🇨🇩" },
    { code: "+244", country: "Angola", flag: "🇦🇴" },
    { code: "+245", country: "Guinea-Bissau", flag: "🇬🇼" },
    { code: "+248", country: "Seychelles", flag: "🇸🇨" },
    { code: "+249", country: "Sudan", flag: "🇸🇩" },
    { code: "+250", country: "Rwanda", flag: "🇷🇼" },
    { code: "+252", country: "Somalia", flag: "🇸🇴" },
    { code: "+253", country: "Djibouti", flag: "🇩🇯" },
    { code: "+257", country: "Burundi", flag: "🇧🇮" },
    { code: "+258", country: "Mozambique", flag: "🇲🇿" },
    { code: "+261", country: "Madagascar", flag: "🇲🇬" },
    { code: "+264", country: "Namibia", flag: "🇳🇦" },
    { code: "+265", country: "Malawi", flag: "🇲🇼" },
    { code: "+266", country: "Lesotho", flag: "🇱🇸" },
    { code: "+267", country: "Botswana", flag: "🇧🇼" },
    { code: "+268", country: "Eswatini", flag: "🇸🇿" },
    { code: "+269", country: "Comoros", flag: "🇰🇲" },
    { code: "+290", country: "Saint Helena", flag: "🇸🇭" },
    { code: "+291", country: "Eritrea", flag: "🇪🇷" },

    // North America
    { code: "+1", country: "United States", flag: "🇺🇸" },
    { code: "+1", country: "Canada", flag: "🇨🇦" },
    { code: "+52", country: "Mexico", flag: "🇲🇽" },
    { code: "+1", country: "Jamaica", flag: "🇯🇲" },
    { code: "+1", country: "Bahamas", flag: "🇧🇸" },
    { code: "+1", country: "Barbados", flag: "🇧🇧" },
    { code: "+1", country: "Trinidad and Tobago", flag: "🇹🇹" },
    { code: "+501", country: "Belize", flag: "🇧🇿" },
    { code: "+502", country: "Guatemala", flag: "🇬🇹" },
    { code: "+503", country: "El Salvador", flag: "🇸🇻" },
    { code: "+504", country: "Honduras", flag: "🇭🇳" },
    { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
    { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
    { code: "+507", country: "Panama", flag: "🇵🇦" },
    { code: "+509", country: "Haiti", flag: "🇭🇹" },
    { code: "+53", country: "Cuba", flag: "🇨🇺" },
    { code: "+1", country: "Dominican Republic", flag: "🇩🇴" },
    { code: "+1", country: "Puerto Rico", flag: "🇵🇷" },

    // South America
    { code: "+55", country: "Brazil", flag: "🇧🇷" },
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+56", country: "Chile", flag: "🇨🇱" },
    { code: "+57", country: "Colombia", flag: "🇨🇴" },
    { code: "+58", country: "Venezuela", flag: "🇻🇪" },
    { code: "+51", country: "Peru", flag: "🇵🇪" },
    { code: "+593", country: "Ecuador", flag: "🇪🇨" },
    { code: "+591", country: "Bolivia", flag: "🇧🇴" },
    { code: "+595", country: "Paraguay", flag: "🇵🇾" },
    { code: "+598", country: "Uruguay", flag: "🇺🇾" },
    { code: "+592", country: "Guyana", flag: "🇬🇾" },
    { code: "+597", country: "Suriname", flag: "🇸🇷" },
    { code: "+594", country: "French Guiana", flag: "🇬🇫" },

    // Europe
    { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+32", country: "Belgium", flag: "🇧🇪" },
    { code: "+41", country: "Switzerland", flag: "🇨🇭" },
    { code: "+46", country: "Sweden", flag: "🇸🇪" },
    { code: "+47", country: "Norway", flag: "🇳🇴" },
    { code: "+45", country: "Denmark", flag: "🇩🇰" },
    { code: "+358", country: "Finland", flag: "🇫🇮" },
    { code: "+354", country: "Iceland", flag: "🇮🇸" },
    { code: "+353", country: "Ireland", flag: "🇮🇪" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+30", country: "Greece", flag: "🇬🇷" },
    { code: "+48", country: "Poland", flag: "🇵🇱" },
    { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
    { code: "+36", country: "Hungary", flag: "🇭🇺" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+40", country: "Romania", flag: "🇷🇴" },
    { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
    { code: "+385", country: "Croatia", flag: "🇭🇷" },
    { code: "+381", country: "Serbia", flag: "🇷🇸" },
    { code: "+386", country: "Slovenia", flag: "🇸🇮" },
    { code: "+421", country: "Slovakia", flag: "🇸🇰" },
    { code: "+372", country: "Estonia", flag: "🇪🇪" },
    { code: "+371", country: "Latvia", flag: "🇱🇻" },
    { code: "+370", country: "Lithuania", flag: "🇱🇹" },
    { code: "+373", country: "Moldova", flag: "🇲🇩" },
    { code: "+355", country: "Albania", flag: "🇦🇱" },
    { code: "+389", country: "North Macedonia", flag: "🇲🇰" },
    { code: "+382", country: "Montenegro", flag: "🇲🇪" },
    { code: "+387", country: "Bosnia and Herzegovina", flag: "🇧🇦" },
    { code: "+377", country: "Monaco", flag: "🇲🇨" },
    { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
    { code: "+356", country: "Malta", flag: "🇲🇹" },
    { code: "+350", country: "Gibraltar", flag: "🇬🇮" },
    { code: "+376", country: "Andorra", flag: "🇦🇩" },

    // Asia
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+60", country: "Malaysia", flag: "🇲🇾" },
    { code: "+62", country: "Indonesia", flag: "🇮🇩" },
    { code: "+63", country: "Philippines", flag: "🇵🇭" },
    { code: "+66", country: "Thailand", flag: "🇹🇭" },
    { code: "+84", country: "Vietnam", flag: "🇻🇳" },
    { code: "+95", country: "Myanmar", flag: "🇲🇲" },
    { code: "+855", country: "Cambodia", flag: "🇰🇭" },
    { code: "+856", country: "Laos", flag: "🇱🇦" },
    { code: "+673", country: "Brunei", flag: "🇧🇳" },
    { code: "+670", country: "East Timor", flag: "🇹🇱" },
    { code: "+977", country: "Nepal", flag: "🇳🇵" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
    { code: "+960", country: "Maldives", flag: "🇲🇻" },
    { code: "+98", country: "Iran", flag: "🇮🇷" },
    { code: "+964", country: "Iraq", flag: "🇮🇶" },
    { code: "+962", country: "Jordan", flag: "🇯🇴" },
    { code: "+961", country: "Lebanon", flag: "🇱🇧" },
    { code: "+965", country: "Kuwait", flag: "🇰🇼" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+967", country: "Yemen", flag: "🇾🇪" },
    { code: "+968", country: "Oman", flag: "🇴🇲" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+972", country: "Israel", flag: "🇮🇱" },
    { code: "+970", country: "Palestine", flag: "🇵🇸" },
    { code: "+963", country: "Syria", flag: "🇸🇾" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+993", country: "Turkmenistan", flag: "🇹🇲" },
    { code: "+992", country: "Tajikistan", flag: "🇹🇯" },
    { code: "+996", country: "Kyrgyzstan", flag: "🇰🇬" },
    { code: "+998", country: "Uzbekistan", flag: "🇺🇿" },
    { code: "+7", country: "Kazakhstan", flag: "🇰🇿" },
    { code: "+374", country: "Armenia", flag: "🇦🇲" },
    { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
    { code: "+995", country: "Georgia", flag: "🇬🇪" },

    // Oceania
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+679", country: "Fiji", flag: "🇫🇯" },
    { code: "+675", country: "Papua New Guinea", flag: "🇵🇬" },
    { code: "+677", country: "Solomon Islands", flag: "🇸🇧" },
    { code: "+678", country: "Vanuatu", flag: "🇻🇺" },
    { code: "+682", country: "Cook Islands", flag: "🇨🇰" },
    { code: "+685", country: "Samoa", flag: "🇼🇸" },
    { code: "+686", country: "Kiribati", flag: "🇰🇮" },
    { code: "+687", country: "New Caledonia", flag: "🇳🇨" },
    { code: "+688", country: "Tuvalu", flag: "🇹🇻" },
    { code: "+689", country: "French Polynesia", flag: "🇵🇫" },
    { code: "+691", country: "Micronesia", flag: "🇫🇲" },
    { code: "+692", country: "Marshall Islands", flag: "🇲🇭" },
    { code: "+674", country: "Nauru", flag: "🇳🇷" },
    { code: "+676", country: "Tonga", flag: "🇹🇴" },

    // Middle East
    { code: "+973", country: "Bahrain", flag: "🇧🇭" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" }
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

// Password Requirements Component
function PasswordRequirements({ password }) {
    const requirements = [
        { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
        { label: "At least 1 uppercase letter (A-Z)", test: (pwd) => /[A-Z]/.test(pwd) },
        { label: "At least 1 lowercase letter (a-z)", test: (pwd) => /[a-z]/.test(pwd) },
        { label: "At least 1 number (0-9)", test: (pwd) => /[0-9]/.test(pwd) },
        { label: "At least 1 special character (!@#$%^&*)", test: (pwd) => /[!@#$%^&*]/.test(pwd) }
    ];

    return (
        <div style={{
            marginTop: "8px",
            padding: "12px",
            background: "rgba(15,23,42,0.3)",
            borderRadius: "10px",
            border: "1px solid rgba(51,65,85,0.5)"
        }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                Password must contain:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {requirements.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                                fontSize: "12px",
                                color: isMet ? "#22C55E" : "rgba(255,255,255,0.3)"
                            }}>
                                {isMet ? "✓" : "○"}
                            </span>
                            <span style={{
                                fontSize: "11px",
                                color: isMet ? "#22C55E" : "rgba(255,255,255,0.5)",
                                textDecoration: isMet ? "none" : "none"
                            }}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
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
    const [selectedCustomerType, setSelectedCustomerType] = useState("");
    const [customerTypeOpen, setCustomerTypeOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Country code states
    const [selectedCountryCode, setSelectedCountryCode] = useState("+234");
    const [countryCodeOpen, setCountryCodeOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    // Find the selected country object for display
    const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCountryCode);

    const selectedCustomerTypeData = CUSTOMER_TYPES.find(ct => ct.value === selectedCustomerType);
    const needsCompanyName = selectedCustomerType === "business" || selectedCustomerType === "enterprise";

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle name change with auto-capitalization
    const handleNameChange = (value) => {
        const capitalized = value.split(' ').map(word => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word;
        }).join(' ');
        handleChange("fullName", capitalized);
    };

    // Handle company name change with auto-capitalization
    const handleCompanyNameChange = (value) => {
        const capitalized = value.split(' ').map(word => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }).join(' ');
        handleChange("companyName", capitalized);
    };

    const validateForm = () => {
        if (!selectedCustomerType) {
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
        if (phoneNumber.length < 6) {
            setError("Please enter a valid phone number (minimum 6 digits)");
            return false;
        }
        if (needsCompanyName && !formData.companyName.trim()) {
            setError("Company name is required");
            return false;
        }

        // Enhanced password validation
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return false;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError("Password must contain at least one uppercase letter");
            return false;
        }
        if (!/[a-z]/.test(formData.password)) {
            setError("Password must contain at least one lowercase letter");
            return false;
        }
        if (!/[0-9]/.test(formData.password)) {
            setError("Password must contain at least one number");
            return false;
        }
        if (!/[!@#$%^&*]/.test(formData.password)) {
            setError("Password must contain at least one special character (!@#$%^&*)");
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

        const fullPhoneNumber = selectedCountryCode + phoneNumber;
        handleChange("phone", fullPhoneNumber);

        if (!validateForm()) return;

        setIsLoading(true);

        const registrationData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: fullPhoneNumber,
            companyName: needsCompanyName ? formData.companyName : null,
            customerType: selectedCustomerType,
            password: formData.password
        };

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (response.ok) {
                storeAuthSession(data);
                navigate(getPostAuthPath(data));
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
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

    // Group countries by continent for better organization
    const groupedCountries = {
        "🌍 Africa": COUNTRY_CODES.filter(c => ["+234", "+233", "+254", "+27", "+212", "+20", "+251", "+255", "+256", "+260", "+263", "+222", "+223", "+224", "+225", "+226", "+227", "+228", "+229", "+230", "+231", "+232", "+235", "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243", "+244", "+245", "+248", "+249", "+250", "+252", "+253", "+257", "+258", "+261", "+264", "+265", "+266", "+267", "+268", "+269", "+290", "+291"].includes(c.code)),
        "🌎 North America": COUNTRY_CODES.filter(c => ["+1", "+52", "+501", "+502", "+503", "+504", "+505", "+506", "+507", "+509", "+53"].includes(c.code)),
        "🌎 South America": COUNTRY_CODES.filter(c => ["+55", "+54", "+56", "+57", "+58", "+51", "+593", "+591", "+595", "+598", "+592", "+597", "+594"].includes(c.code)),
        "🌍 Europe": COUNTRY_CODES.filter(c => ["+44", "+49", "+33", "+39", "+34", "+31", "+32", "+41", "+46", "+47", "+45", "+358", "+354", "+353", "+351", "+30", "+48", "+420", "+36", "+43", "+40", "+359", "+385", "+381", "+386", "+421", "+372", "+371", "+370", "+373", "+355", "+389", "+382", "+387", "+377", "+352", "+356", "+350", "+376"].includes(c.code)),
        "🌏 Asia": COUNTRY_CODES.filter(c => ["+91", "+86", "+81", "+82", "+65", "+60", "+62", "+63", "+66", "+84", "+95", "+855", "+856", "+673", "+670", "+977", "+92", "+94", "+880", "+960", "+98", "+964", "+962", "+961", "+965", "+966", "+967", "+968", "+971", "+972", "+970", "+963", "+90", "+993", "+992", "+996", "+998", "+7", "+374", "+994", "+995"].includes(c.code)),
        "🌏 Oceania": COUNTRY_CODES.filter(c => ["+61", "+64", "+679", "+675", "+677", "+678", "+682", "+685", "+686", "+687", "+688", "+689", "+691", "+692", "+674", "+676"].includes(c.code)),
        "🌍 Middle East": COUNTRY_CODES.filter(c => ["+973", "+974"].includes(c.code))
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
            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                maxWidth: "540px",
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
                            Create Your Account
                        </h1>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                            Join CyForce to access our platform
                        </p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: "0 32px 32px 32px" }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Customer Type Selector */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>🏢</span> Account Type
                                </label>
                                <div style={{ position: "relative" }}>
                                    <button
                                        type="button"
                                        onClick={() => setCustomerTypeOpen(!customerTypeOpen)}
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
                                            transition: "all 0.2s",
                                            cursor: "pointer",
                                            color: selectedCustomerType ? "#fff" : "rgba(255,255,255,0.5)"
                                        }}
                                    >
                                        <span>{selectedCustomerTypeData ? selectedCustomerTypeData.label : "Select account type..."}</span>
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
                                                        cursor: "pointer",
                                                        transition: "background 0.2s"
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

                            {/* Full Name with auto-capitalization */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px" }}>
                                    Full Name
                                </label>
                                <div style={{ position: "relative" }}>
                                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <span style={{ fontSize: "16px" }}>👤</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleNameChange(e.target.value)}
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
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
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
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                        onBlur={(e) => e.target.style.borderColor = "rgba(51,65,85,1)"}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Phone Number with Country Code Dropdown */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px" }}>
                                    Phone Number
                                </label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    {/* Country Code Dropdown */}
                                    <div style={{ position: "relative", width: "130px" }}>
                                        <button
                                            type="button"
                                            onClick={() => setCountryCodeOpen(!countryCodeOpen)}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "10px 12px",
                                                background: "rgba(15,23,42,0.5)",
                                                border: "1px solid rgba(51,65,85,1)",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                color: "#fff",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <span>{selectedCountry?.flag} {selectedCountryCode}</span>
                                            <span style={{ fontSize: "12px", color: "#2DD4BF" }}>{countryCodeOpen ? "▲" : "▼"}</span>
                                        </button>

                                        {countryCodeOpen && (
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
                                                maxHeight: "300px",
                                                overflowY: "auto"
                                            }}>
                                                {Object.entries(groupedCountries).map(([continent, countries]) => (
                                                    countries.length > 0 && (
                                                        <div key={continent}>
                                                            <div style={{
                                                                padding: "8px 12px",
                                                                background: "rgba(45,212,191,0.1)",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                color: "#2DD4BF",
                                                                borderBottom: "1px solid rgba(51,65,85,0.5)"
                                                            }}>
                                                                {continent}
                                                            </div>
                                                            {countries.map((country) => (
                                                                <button
                                                                    key={country.code + country.country}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCountryCode(country.code);
                                                                        setCountryCodeOpen(false);
                                                                    }}
                                                                    style={{
                                                                        width: "100%",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        padding: "8px 12px",
                                                                        background: "transparent",
                                                                        border: "none",
                                                                        color: "#fff",
                                                                        cursor: "pointer",
                                                                        textAlign: "left"
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(51,65,85,0.5)"}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                                >
                                                                    <span style={{ fontSize: "16px" }}>{country.flag}</span>
                                                                    <span style={{ fontSize: "13px" }}>{country.code}</span>
                                                                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{country.country}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Number Input */}
                                    <div style={{ position: "relative", flex: 1 }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>📞</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 10) {
                                                    setPhoneNumber(value);
                                                }
                                            }}
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
                                            placeholder="800 000 0000"
                                        />
                                    </div>
                                </div>
                                {phoneNumber && phoneNumber.length < 6 && (
                                    <p style={{ fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
                                        Please enter at least 6 digits
                                    </p>
                                )}
                            </div>

                            {/* Company Name with auto-capitalization (conditional) */}
                            {needsCompanyName && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)", marginLeft: "4px" }}>
                                        Company Name
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                            <span style={{ fontSize: "16px" }}>🏢</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => handleCompanyNameChange(e.target.value)}
                                            required={needsCompanyName}
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
                                            placeholder="Your Company Ltd"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password with requirements */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "4px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>
                                        Password <span style={{ color: "#EF4444" }}>*</span>
                                    </label>
                                    {formData.password && (
                                        <span style={{
                                            fontSize: "10px",
                                            color: formData.password.length >= 8 ? "#22C55E" : "#F87171"
                                        }}>
                                            {formData.password.length}/8+ characters
                                        </span>
                                    )}
                                </div>
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
                                            border: `1px solid ${
                                                formData.password && formData.password.length < 8
                                                    ? "#EF4444"
                                                    : formData.password && formData.password.length >= 8
                                                        ? "#22C55E"
                                                        : "rgba(51,65,85,1)"
                                            }`,
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                        onBlur={(e) => {
                                            if (formData.password && formData.password.length < 8) {
                                                e.target.style.borderColor = "#EF4444";
                                            } else if (formData.password && formData.password.length >= 8) {
                                                e.target.style.borderColor = "#22C55E";
                                            } else {
                                                e.target.style.borderColor = "rgba(51,65,85,1)";
                                            }
                                        }}
                                        placeholder="Enter your password"
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

                                {/* Password Strength Indicator */}
                                <PasswordStrengthIndicator password={formData.password} />

                                {/* Password Requirements List */}
                                <PasswordRequirements password={formData.password} />

                                {formData.password && formData.password.length < 8 && (
                                    <p style={{ fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
                                        ⚠️ Password must be at least 8 characters
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "4px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>
                                        Confirm Password <span style={{ color: "#EF4444" }}>*</span>
                                    </label>
                                    {formData.confirmPassword && (
                                        <span style={{
                                            fontSize: "10px",
                                            color: formData.password === formData.confirmPassword ? "#22C55E" : "#F87171"
                                        }}>
                                            {formData.password === formData.confirmPassword ? "✓ Matches" : "✗ Doesn't match"}
                                        </span>
                                    )}
                                </div>
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
                                            border: `1px solid ${
                                                formData.confirmPassword && formData.password !== formData.confirmPassword
                                                    ? "#EF4444"
                                                    : formData.confirmPassword && formData.password === formData.confirmPassword
                                                        ? "#22C55E"
                                                        : "rgba(51,65,85,1)"
                                            }`,
                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            outline: "none",
                                            transition: "all 0.2s"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#2DD4BF"}
                                        onBlur={(e) => {
                                            if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                                                e.target.style.borderColor = "#EF4444";
                                            } else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
                                                e.target.style.borderColor = "#22C55E";
                                            } else {
                                                e.target.style.borderColor = "rgba(51,65,85,1)";
                                            }
                                        }}
                                        placeholder="Confirm your password"
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
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p style={{ fontSize: "10px", color: "#F87171", marginTop: "4px" }}>
                                        ⚠️ Passwords do not match
                                    </p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px"
                            }}>
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        marginRight: "4px",
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

                            {/* Error Message - No bullet point */}
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

                    {/* Footer inside card */}
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

export default RegisterPage;