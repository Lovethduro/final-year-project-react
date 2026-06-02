// src/ServicesPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// Import your local images
import cyber from './images/CyberSec.jpg';
import ict from './images/IctServices.jpg';
import cctv from './images/cctv.jpg';
import solar from './images/solar.jpg';
import sbImg from './images/s&b.jpg';
import alarm from './images/almarm.jpg';

// Custom hook for scroll animations
function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    return [ref, inView];
}

// Animated Particles Component
function AnimatedParticles() {
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
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.2,
                    color: `rgba(56, 189, 248, ${Math.random() * 0.3 + 0.1})`
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

                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around screen
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

const SERVICES = [
    {
        id: 0,
        title: "Cyber Security",
        icon: "🛡️",
        accent: "#38BDF8",
        tag: "Security",
        desc: "Our solutions for cybersecurity, anti-fraud, and brand protection leverage intelligence-driven technologies to ensure monitoring and proactive protection of critical data and assets.",
        img: cyber,
        features: [
            "Intelligence-driven threat detection",
            "Anti-fraud and brand protection",
            "Proactive data monitoring",
            "Critical asset protection",
            "24/7 security operations"
        ]
    },
    {
        id: 1,
        title: "CCTV & Access Control",
        icon: "📹",
        accent: "#34D399",
        tag: "Surveillance",
        desc: "Access control system integration with employee and visitor management. Tailored security products and services designed to meet your unique needs.",
        img: cctv,
        features: [
            "Access control system integration",
            "Employee and visitor management",
            "High-definition CCTV systems",
            "Remote monitoring capabilities",
            "24/7 surveillance coverage"
        ]
    },
    {
        id: 2,
        title: "Alarm Systems",
        icon: "🚨",
        accent: "#FBBF24",
        tag: "Security",
        desc: "Fire Alarm solutions for old or new buildings, no matter how complicated. We deal in Gents, Chloride-UK, EMS, and others.",
        img: alarm,
        features: [
            "Conventional Fire Alarm Systems",
            "Addressable Fire Alarm Systems",
            "Wireless Fire Alarm Systems",
            "Installation for any building type",
            "Premium brands: Gents, Chloride-UK, EMS"
        ]
    },
    {
        id: 3,
        title: "ICT Services",
        icon: "💻",
        accent: "#F97316",
        tag: "Technology",
        desc: "Leverage technology to revolutionize your business operations. Our IT consulting services are tailored to equip you for the digital age.",
        img: ict,
        features: [
            "IT consulting services",
            "Network setup and management",
            "Hardware maintenance",
            "Website design and development",
            "Software solutions"
        ]
    },
    {
        id: 4,
        title: "Automation & Solar Energy",
        icon: "⚙️",
        accent: "#A78BFA",
        tag: "Energy",
        desc: "CyForce focuses on security systems, products, and services. We provide a range of automation solutions and solar energy systems.",
        img: solar,
        features: [
            "Industrial automation",
            "Solar Inverter Systems",
            "Solar street lights",
            "Electric fences",
            "Smart building automation"
        ]
    },
    {
        id: 5,
        title: "Additional Services",
        icon: "🔧",
        accent: "#F472B6",
        tag: "Solutions",
        desc: "Complete technology solutions including security doors, POS terminals, training, and hardware maintenance.",
        img: sbImg,
        features: [
            "Security doors installation",
            "POS Terminal setup",
            "Networking solutions",
            "Professional training",
            "Hardware maintenance"
        ]
    }
];

function ServicesPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ background: "#060B1A", minHeight: "100vh", paddingTop: "100px", overflowX: "hidden" }}>
            {/* Animated Hero Section with Background Animation */}
            {/* Animated Hero Section with Background Animation */}
            <div style={{
                background: "linear-gradient(135deg, #0D1830, #060B1A)",
                padding: "80px 48px",
                textAlign: "center",
                borderBottom: "0.5px solid rgba(99,179,237,0.1)",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Animated Gradient Background */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle at 20% 50%, rgba(56,189,248,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(43,92,230,0.1) 0%, transparent 50%)",
                    animation: "gradientShift 8s ease-in-out infinite"
                }} />

                {/* Floating Orbs */}
                <div style={{
                    position: "absolute",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
                    top: "10%",
                    left: "-5%",
                    animation: "floatOrb1 12s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(43,92,230,0.15) 0%, transparent 70%)",
                    bottom: "-20%",
                    right: "-10%",
                    animation: "floatOrb2 15s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
                    top: "60%",
                    right: "20%",
                    animation: "floatOrb3 10s ease-in-out infinite"
                }} />

                {/* Animated Particles */}
                <AnimatedParticles />

                {/* Grid Pattern Overlay */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    animation: "gridMove 20s linear infinite"
                }} />

                <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
                    {/* Badge */}
                    <div style={{
                        fontSize: 11,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#38BDF8",
                        marginBottom: 16,
                        animation: "fadeInUp 0.6s ease-out",
                        display: "inline-block",
                        padding: "4px 16px",
                        background: "rgba(56,189,248,0.1)",
                        borderRadius: "30px",
                        backdropFilter: "blur(10px)",
                        border: "0.5px solid rgba(56,189,248,0.2)"
                    }}>
                        ✨ What We Do ✨
                    </div>

                    {/* Title - Fixed: animation combined */}
                    <h1 style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(40px, 5vw, 56px)",
                        color: "#fff",
                        marginBottom: 20,
                        background: "linear-gradient(135deg, #fff, #38BDF8, #2B5CE6)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundSize: "200% auto",
                        animation: "gradientText 3s ease-in-out infinite, fadeInUp 0.6s ease-out 0.1s both"
                    }}>
                        Our Services
                    </h1>

                    {/* Subtitle 1 */}
                    <p style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        maxWidth: 600,
                        margin: "0 auto 20px",
                        animation: "fadeInUp 0.6s ease-out 0.2s both"
                    }}>
                        Take Your Business to the Next Level
                    </p>

                    {/* Subtitle 2 */}
                    <p style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.4)",
                        animation: "fadeInUp 0.6s ease-out 0.3s both"
                    }}>
                        Tailored security products and services designed to meet your unique needs
                    </p>

                    {/* Animated bouncing arrow */}
                    <div style={{
                        marginTop: "40px",
                        animation: "bounce 2s ease-in-out infinite",
                        opacity: 0.6,
                        cursor: "pointer",
                        transition: "opacity 0.3s ease"
                    }}
                         onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                         onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                         onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div style={{ padding: "80px 48px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {SERVICES.map((service, index) => (
                        <ServiceDetailCard key={service.id} service={service} index={index} />
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div style={{
                background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                margin: "40px 48px 80px",
                borderRadius: "24px",
                padding: "60px 48px",
                textAlign: "center",
                animation: "fadeInUp 0.8s ease-out",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Animated particles in CTA */}
                <div style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    overflow: "hidden"
                }}>
                    {[...Array(15)].map((_, i) => (
                        <div key={i} style={{
                            position: "absolute",
                            width: "6px",
                            height: "6px",
                            background: "rgba(255,255,255,0.6)",
                            borderRadius: "50%",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `floatParticle ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`
                        }} />
                    ))}
                </div>

                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "32px",
                    color: "#fff",
                    marginBottom: "16px",
                    position: "relative",
                    zIndex: 1
                }}>
                    Ready to Get Started?
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: "30px",
                    position: "relative",
                    zIndex: 1
                }}>
                    Contact us today for a free consultation
                </p>
                <Link to="/#contact">
                    <button style={{
                        background: "#fff",
                        color: "#2B5CE6",
                        border: "none",
                        borderRadius: "40px",
                        padding: "14px 34px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                        zIndex: 1
                    }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                            }}>
                        Chat With Us →
                    </button>
                </Link>
            </div>

            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes floatOrb1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, 20px) scale(1.1);
          }
        }
        
        @keyframes floatOrb2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, -30px) scale(1.15);
          }
        }
        
        @keyframes floatOrb3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.08);
          }
        }
        
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
        
        @keyframes gradientText {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
        
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        
        .service-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .service-card:hover {
          transform: translateY(-8px);
        }
        
        .image-zoom {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .image-zoom:hover {
          transform: scale(1.08);
        }
        
        .feature-item {
          transition: all 0.3s ease;
        }
        
        .feature-item:hover {
          transform: translateX(5px);
        }
      `}</style>
        </div>
    );
}

function ServiceDetailCard({ service, index }) {
    const [ref, inView] = useInView(0.2);
    const [isHovered, setIsHovered] = useState(false);

    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className="service-card"
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "60px",
                marginBottom: "80px",
                alignItems: "center",
                opacity: inView ? 1 : 0,
                transform: inView
                    ? "translateY(0)"
                    : "translateY(60px)",
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div
                style={{
                    order: isEven ? 1 : 2,
                    overflow: "hidden",
                    borderRadius: "24px",
                    boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.4)" : "0 10px 30px rgba(0,0,0,0.2)",
                    transition: "box-shadow 0.3s ease"
                }}
            >
                <div style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    border: `0.5px solid ${service.accent}33`,
                }}>
                    <img
                        src={service.img}
                        alt={service.title}
                        className="image-zoom"
                        style={{
                            width: "100%",
                            height: "380px",
                            objectFit: "cover",
                            transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                </div>
            </div>

            {/* Content Section */}
            <div
                style={{
                    order: isEven ? 2 : 1,
                    animation: inView
                        ? (isEven ? "fadeInRight 0.8s ease-out" : "fadeInLeft 0.8s ease-out")
                        : "none",
                }}
            >
                {/* Icon and Tag */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-block",
                        fontSize: "48px",
                        transition: "transform 0.3s ease",
                        transform: isHovered ? "scale(1.1) rotate(5deg)" : "scale(1)",
                    }}>
                        {service.icon}
                    </div>
                    <div style={{
                        display: "inline-block",
                        marginLeft: "12px",
                        padding: "4px 12px",
                        background: `linear-gradient(135deg, ${service.accent}20, ${service.accent}10)`,
                        borderRadius: "20px",
                        fontSize: "11px",
                        color: service.accent,
                        verticalAlign: "middle",
                        border: `0.5px solid ${service.accent}33`,
                    }}>
                        {service.tag}
                    </div>
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "36px",
                    color: "#fff",
                    marginBottom: "16px",
                    background: `linear-gradient(135deg, #fff, ${service.accent})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    transition: "all 0.3s ease",
                }}>
                    {service.title}
                </h2>

                {/* Description */}
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: "1.8",
                    marginBottom: "24px",
                }}>
                    {service.desc}
                </p>

                {/* Features List */}
                <div style={{ marginBottom: "30px" }}>
                    <h4 style={{
                        color: service.accent,
                        marginBottom: "16px",
                        fontSize: "16px",
                        fontWeight: "600"
                    }}>
                        Key Services:
                    </h4>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {service.features.map((feature, i) => (
                            <li
                                key={i}
                                className="feature-item"
                                style={{
                                    marginBottom: "10px",
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    transition: "all 0.3s ease",
                                    cursor: "default",
                                }}
                            >
                <span style={{
                    color: service.accent,
                    fontSize: "16px",
                    transition: "transform 0.3s ease",
                    display: "inline-block",
                }}>
                  ✓
                </span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Button */}
                <button style={{
                    background: `linear-gradient(135deg, ${service.accent}20, transparent)`,
                    color: service.accent,
                    border: `1px solid ${service.accent}`,
                    borderRadius: "40px",
                    padding: "12px 28px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = service.accent;
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.transform = "translateX(5px)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${service.accent}20, transparent)`;
                            e.currentTarget.style.color = service.accent;
                            e.currentTarget.style.transform = "translateX(0)";
                        }}>
                    Request a Quote →
                </button>
            </div>
        </div>
    );
}

export default ServicesPage;