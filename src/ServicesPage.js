// src/ServicesPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FONT_BODY, FONT_DISPLAY } from './styles/landingFonts';

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
                <div className="svc-banner-bg" style={{ backgroundImage: `url(${ict})` }} />
                <div className="svc-banner-overlay" />
                <AnimatedParticles />
                <div className="svc-banner-content">
                    <span className="svc-eyebrow">What We Do</span>
                    <h1>Our Services</h1>
                    <p>
                        Security, ICT, solar, CCTV, automation, and more — supplied, installed, and supported
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
                        <a key={s.id} href={`#service-${s.id}`} style={{ borderColor: `${s.accent}44`, color: s.accent }}>
                            {s.short}
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
                        <p>Discuss your requirements with our team — we will recommend the right approach for your project.</p>
                    </div>
                    <div className="svc-cta-actions">
                        <Link to={{ pathname: '/', hash: '#contact' }} className="svc-cta-primary">Contact Us</Link>
                        <Link to="/products" className="svc-cta-ghost">Browse Products</Link>
                    </div>
                </div>
            </section>

            <style>{`
                .services-page { background: #060B1A; min-height: 100vh; padding-top: 88px; font-family: ${FONT_BODY}; overflow-x: hidden; }
                .svc-banner { position: relative; min-height: 420px; display: flex; align-items: flex-end; overflow: hidden; }
                .svc-banner-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
                .svc-banner-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(180deg, rgba(6,11,26,0.3) 0%, rgba(6,11,26,0.92) 75%);
                }
                .svc-banner-content {
                    position: relative; z-index: 1; width: 100%; max-width: 1180px; margin: 0 auto;
                    padding: clamp(48px, 8vw, 72px) clamp(20px, 4vw, 48px);
                }
                .svc-eyebrow {
                    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #34D399;
                    font-weight: 700; margin-bottom: 12px; display: block;
                }
                .svc-banner h1 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(40px, 6vw, 56px); font-weight: 800;
                    color: #fff; margin: 0 0 14px; line-height: 1.05;
                }
                .svc-banner p { font-size: 16px; color: rgba(255,255,255,0.55); max-width: 560px; line-height: 1.7; margin: 0 0 28px; }
                .svc-banner-stats { display: flex; flex-wrap: wrap; gap: 24px; }
                .svc-banner-stats strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 24px; color: #fff; }
                .svc-banner-stats span { font-size: 11px; color: rgba(255,255,255,0.4); }
                .svc-nav {
                    position: sticky; top: 72px; z-index: 50;
                    background: rgba(6,11,26,0.92); backdrop-filter: blur(10px);
                    border-bottom: 0.5px solid rgba(99,179,237,0.12);
                }
                .svc-nav-inner {
                    max-width: 1180px; margin: 0 auto; padding: 12px clamp(20px, 4vw, 48px);
                    display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
                }
                .svc-nav a {
                    padding: 8px 16px; border-radius: 20px; border: 0.5px solid;
                    font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s ease;
                    background: rgba(255,255,255,0.03);
                }
                .svc-nav a:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
                .svc-list { padding: clamp(56px, 8vw, 80px) clamp(20px, 4vw, 48px); }
                .svc-list-inner { max-width: 1180px; margin: 0 auto; }
                .svc-cta-band {
                    margin: 0 clamp(20px, 4vw, 48px) clamp(56px, 8vw, 80px);
                    border-radius: 16px; overflow: hidden;
                    background: linear-gradient(135deg, #1e3a8a 0%, #2B5CE6 50%, #38BDF8 100%);
                }
                .svc-cta-inner {
                    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
                    padding: clamp(32px, 5vw, 44px) clamp(28px, 4vw, 40px);
                }
                .svc-cta-inner h2 { font-family: ${FONT_DISPLAY}; font-size: clamp(22px, 3vw, 28px); color: #fff; margin: 0 0 8px; }
                .svc-cta-inner p { font-size: 14px; color: rgba(255,255,255,0.88); margin: 0; max-width: 480px; line-height: 1.6; }
                .svc-cta-actions { display: flex; flex-wrap: wrap; gap: 12px; }
                .svc-cta-primary {
                    padding: 13px 26px; border-radius: 10px; background: #fff; color: #2B5CE6;
                    font-size: 14px; font-weight: 600; text-decoration: none;
                }
                .svc-cta-ghost {
                    padding: 13px 26px; border-radius: 10px; color: #fff; border: 0.5px solid rgba(255,255,255,0.4);
                    font-size: 14px; font-weight: 600; text-decoration: none;
                }
                @media (max-width: 768px) {
                    .service-card { grid-template-columns: 1fr !important; }
                    .service-card > div { order: unset !important; }
                }
                .service-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
                .service-card:hover { transform: translateY(-8px); }
                .image-zoom { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
                .image-zoom:hover { transform: scale(1.08); }
                .feature-item { transition: all 0.3s ease; }
                .feature-item:hover { transform: translateX(5px); }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
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
                <div style={{ marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        background: `linear-gradient(135deg, ${service.accent}20, ${service.accent}10)`,
                        borderRadius: "20px",
                        fontSize: "11px",
                        color: service.accent,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        border: `0.5px solid ${service.accent}33`,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 500,
                    }}>
                        {service.tag}
                    </div>
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
                <Link
                    to={{ pathname: '/', hash: '#contact' }}
                    style={{
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
                    textDecoration: "none",
                    display: "inline-block",
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
                    Get in Touch &rarr;
                </Link>
            </div>
        </div>
    );
}

export default ServicesPage;