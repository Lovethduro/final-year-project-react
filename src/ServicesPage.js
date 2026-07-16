// src/ServicesPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FONT_BODY, FONT_DISPLAY, FONT_SERIF } from './styles/landingFonts';
import { ArrowRight } from 'lucide-react';

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

        const observed = ref.current;
        if (observed) {
            observer.observe(observed);
        }

        return () => {
            if (observed) {
                observer.unobserve(observed);
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
                    color: `rgba(255, 255, 255, ${Math.random() * 0.25 + 0.08})`
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
        accent: "#002D72",
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
        accent: "#1A4A9E",
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
        accent: "#003B8E",
        tag: "Alarms",
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
        accent: "#002D72",
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
        accent: "#1A4A9E",
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
        accent: "#003B8E",
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

const HERO_STATS = [
    { value: '500+', label: 'Installations' },
    { value: '12+', label: 'Years' },
    { value: '30+', label: 'Cities' },
    { value: '99.8%', label: 'Uptime SLA' },
];

function ServicesPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="services-page">
            <section className="svc-banner">
                <AnimatedParticles />
                <div className="svc-banner-diagonal" aria-hidden="true" />
                <div className="svc-banner-content">
                    <span className="svc-eyebrow">Welcome to CyForce Technologies</span>
                    <h1>Our Services</h1>
                    <p>
                        Security, ICT, solar, CCTV, automation, and more - supplied, installed, and supported
                        nationwide by certified CyForce engineers.
                    </p>
                    <div className="svc-banner-stats">
                        {HERO_STATS.map((s) => (
                            <div key={s.label}>
                                <strong>{s.value}</strong>
                                <span>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <nav className="svc-nav">
                <div className="svc-nav-inner">
                    {SERVICES.map((s) => (
                        <a key={s.id} href={`#service-${s.id}`}>
                            {s.tag}
                        </a>
                    ))}
                </div>
            </nav>

            <section className="svc-list">
                <div className="svc-list-inner">
                    {SERVICES.map((service, index) => (
                        <ServiceDetailCard key={service.id} service={service} index={index} />
                    ))}
                </div>
            </section>

            <section className="svc-cta-band">
                <div className="svc-cta-inner">
                    <div>
                        <h2>Plan your next project</h2>
                        <p>Discuss your requirements with our team - we will recommend the right approach for your project.</p>
                    </div>
                    <div className="svc-cta-actions">
                        <Link to={{ pathname: '/', hash: '#contact' }} className="svc-cta-primary">Contact US</Link>
                        <Link to="/products" className="svc-cta-ghost">Browse Products <ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></Link>
                    </div>
                </div>
            </section>

            <style>{`
                .services-page { background: #FFFFFF; min-height: 100vh; padding-top: 88px; font-family: ${FONT_BODY}; overflow-x: hidden; }
                .svc-banner {
                    position: relative; min-height: clamp(380px, 52vh, 480px); display: flex; align-items: center;
                    overflow: hidden; background: linear-gradient(135deg, #001A44 0%, #002D72 42%, #0B3A8C 100%);
                }
                .svc-banner-diagonal {
                    position: absolute; top: 0; right: 0; bottom: 0; width: 42%; opacity: 0.9; pointer-events: none;
                    background: linear-gradient(160deg, #1A56C4 0%, #0D3F9A 55%, #002D72 100%);
                    clip-path: polygon(28% 0, 100% 0, 100% 100%, 0% 100%);
                }
                .svc-banner-content {
                    position: relative; z-index: 1; width: 100%; max-width: 820px; margin: 0 auto; text-align: center;
                    padding: clamp(56px, 8vw, 88px) clamp(20px, 5vw, 32px);
                }
                .svc-eyebrow {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(11px, 2vw, 13px); letter-spacing: 0.22em;
                    text-transform: uppercase; color: rgba(255,255,255,0.92); font-weight: 500; margin-bottom: 18px; display: block;
                }
                .svc-banner h1 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(28px, 5.2vw, 48px); font-weight: 800;
                    color: #FFFFFF; margin: 0 0 18px; line-height: 1.15; text-transform: uppercase; letter-spacing: -0.01em;
                }
                .svc-banner p {
                    font-family: ${FONT_SERIF}; font-style: italic; font-size: clamp(16px, 2.4vw, 19px);
                    color: rgba(255,255,255,0.9); max-width: 580px; line-height: 1.7; margin: 0 auto 28px;
                }
                .svc-banner-stats { display: flex; flex-wrap: wrap; gap: 28px; justify-content: center; }
                .svc-banner-stats strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 22px; color: #FFFFFF; }
                .svc-banner-stats span { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.65); }
                .svc-nav {
                    position: sticky; top: 72px; z-index: 50;
                    background: rgba(255,255,255,0.96); backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0,45,114,0.12);
                }
                .svc-nav-inner {
                    max-width: 1180px; margin: 0 auto; padding: 14px clamp(20px, 4vw, 48px);
                    display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
                }
                .svc-nav a {
                    padding: 8px 16px; border-radius: 24px; border: 1px solid rgba(0,45,114,0.18);
                    font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s ease;
                    background: #FFFFFF; color: #002D72; font-family: ${FONT_DISPLAY}; letter-spacing: 0.04em;
                }
                .svc-nav a:hover { background: #002D72; color: #fff; border-color: #002D72; }
                .svc-list { padding: clamp(56px, 8vw, 80px) clamp(20px, 4vw, 48px); }
                .svc-list-inner { max-width: 1180px; margin: 0 auto; }
                .svc-cta-band {
                    margin: 0 clamp(20px, 4vw, 48px) clamp(56px, 8vw, 80px);
                    border-radius: 4px; overflow: hidden;
                    background: linear-gradient(135deg, #001A44 0%, #002D72 50%, #1A4A9E 100%);
                }
                .svc-cta-inner {
                    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
                    padding: clamp(32px, 5vw, 44px) clamp(28px, 4vw, 40px);
                }
                .svc-cta-inner h2 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(22px, 3vw, 28px); color: #FFFFFF;
                    margin: 0 0 8px; text-transform: uppercase; font-weight: 800;
                }
                .svc-cta-inner p { font-family: ${FONT_SERIF}; font-style: italic; font-size: 15px; color: rgba(255,255,255,0.88); margin: 0; max-width: 480px; line-height: 1.65; }
                .svc-cta-actions { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
                .svc-cta-primary {
                    padding: 13px 28px; border-radius: 28px; background: #1A56C4; color: #fff;
                    font-size: 13px; font-weight: 600; text-decoration: none; font-family: ${FONT_DISPLAY}; letter-spacing: 0.04em;
                }
                .svc-cta-ghost {
                    padding: 10px 0; color: #FFFFFF; border: none;
                    font-size: 14px; font-weight: 500; text-decoration: none; font-family: ${FONT_DISPLAY};
                    display: inline-flex; align-items: center; gap: 8px;
                }
                @media (max-width: 768px) {
                    .service-card { grid-template-columns: 1fr !important; }
                    .service-card > div { order: unset !important; }
                }
                .service-card { transition: transform 0.35s ease; }
                .feature-item { transition: transform 0.25s ease; }
                .feature-item:hover { transform: translateX(4px); }
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
            id={`service-${service.id}`}
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
                    borderTop: `3px solid ${service.accent}`,
                    boxShadow: isHovered ? "0 16px 40px rgba(0,45,114,0.14)" : "0 4px 16px rgba(0,45,114,0.08)",
                    transition: "box-shadow 0.3s ease",
                    border: "1px solid rgba(0,45,114,0.12)",
                }}
            >
                <img
                    src={service.img}
                    alt={service.title}
                    style={{
                        width: "100%",
                        height: "360px",
                        objectFit: "cover",
                        display: "block",
                        transform: isHovered ? "scale(1.03)" : "scale(1)",
                        transition: "transform 0.6s ease",
                        filter: "saturate(0.92) contrast(1.05)",
                    }}
                />
            </div>

            <div style={{ order: isEven ? 2 : 1 }}>
                <div style={{
                    display: "inline-block",
                    padding: "5px 12px",
                    background: "#002D72",
                    color: "#fff",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    marginBottom: 16,
                }}>
                    {service.tag}
                </div>

                <h2 style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(26px, 4vw, 34px)",
                    color: "#002D72",
                    marginBottom: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                }}>
                    {service.title}
                </h2>

                <p style={{
                    fontSize: 16,
                    color: "rgba(10,31,68,0.72)",
                    lineHeight: 1.75,
                    marginBottom: 22,
                    fontFamily: FONT_SERIF,
                    fontStyle: "italic",
                }}>
                    {service.desc}
                </p>

                <div style={{ marginBottom: 28 }}>
                    <h4 style={{
                        color: "#002D72",
                        marginBottom: 14,
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: FONT_DISPLAY,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}>
                        Key Services
                    </h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {service.features.map((feature, i) => (
                            <li
                                key={i}
                                className="feature-item"
                                style={{
                                    marginBottom: 10,
                                    color: "rgba(10,31,68,0.75)",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontFamily: FONT_BODY,
                                }}
                            >
                                <span style={{ color: "#002D72", fontWeight: 700 }}>✓</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link
                    to={{ pathname: '/', hash: '#contact' }}
                    style={{
                        background: "#1A56C4",
                        color: "#fff",
                        border: "none",
                        borderRadius: 28,
                        padding: "13px 28px",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: FONT_DISPLAY,
                        letterSpacing: "0.04em",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "background 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#2563D4";
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#1A56C4";
                        e.currentTarget.style.transform = "none";
                    }}
                >
                    Contact US <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}

export default ServicesPage;