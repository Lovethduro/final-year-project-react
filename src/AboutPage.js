// src/AboutPage.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import meeting from './images/meeting.jpg'

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

function AboutPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ background: "#060B1A", minHeight: "100vh", paddingTop: "100px", overflowX: "hidden" }}>

            {/* Hero Section with Animations */}
            <div style={{
                background: "linear-gradient(135deg, #0D1830, #060B1A)",
                padding: "80px 48px",
                textAlign: "center",
                borderBottom: "0.5px solid rgba(99,179,237,0.1)",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Animated Background */}
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
                        📖 Our Story
                    </div>

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
                        About CyForce Technologies
                    </h1>

                    <p style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        maxWidth: 600,
                        margin: "0 auto",
                        animation: "fadeInUp 0.6s ease-out 0.2s both"
                    }}>
                        Specialist in CCTV, ICT & Cyber Security Services
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: "80px 48px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                    {/* Company Description with Animation */}
                    <CompanyDescription />

                    {/* Vision Statement with Animation */}
                    <VisionStatement />

                    {/* Mission & Values with Animation */}
                    <MissionValues />

                    {/* Why Choose Us Section */}
                    <WhyChooseUs />

                    {/* Net Guarding You Tagline */}
                    <NetGuardingTagline />
                </div>
            </div>

            {/* CTA Section */}
            <CTASection />
        </div>
    );
}

function CompanyDescription() {
    const [ref, inView] = useInView(0.2);

    return (
        <div
            ref={ref}
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "60px",
                alignItems: "center",
                marginBottom: "80px",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(60px)",
                transition: "all 0.8s ease-out"
            }}
        >
            <div>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "32px",
                    color: "#fff",
                    marginBottom: "20px",
                    background: "linear-gradient(135deg, #fff, #38BDF8)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Experience, Expertise and Honesty
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: "1.8",
                    marginBottom: "20px"
                }}>
                    With more than 4002 sales and service centers across Nigeria, CyForce Technologies
                    has achieved a distinguished name in security, ICT & surveillance industry within a few years.
                </p>
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: "1.8",
                    marginBottom: "30px"
                }}>
                    CyForce provides a comprehensive and versatile portfolio of security tools to support
                    the fight against today's complex security threats.
                </p>
                <div style={{
                    display: "flex",
                    gap: "40px",
                    flexWrap: "wrap"
                }}>
                    <StatCard number="4000+" label="Sales & Service Centers" />
                    <StatCard number="7+" label="Years of Experience" />
                    <StatCard number="100+" label="Sales Centers" />
                </div>
            </div>
            <div>
                <div style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "0.5px solid rgba(99,179,237,0.2)",
                    background: "#0D1830",
                    transition: "transform 0.5s ease"
                }}>
                    <img
                        src={meeting}
                        alt="CyForce Technologies Team"
                        style={{
                            width: "100%",
                            height: "400px",
                            objectFit: "cover",
                            transition: "transform 0.5s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ number, label }) {
    const [ref, inView] = useInView(0.2);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (inView) {
            const target = parseInt(number) || 0;
            const duration = 1500;
            const step = duration / target;
            let current = 0;
            const timer = setInterval(() => {
                current++;
                setCount(current);
                if (current >= target) clearInterval(timer);
            }, step);
            return () => clearInterval(timer);
        }
    }, [inView, number]);

    return (
        <div ref={ref} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#38BDF8" }}>
                {number.includes('+') ? `${count}+` : number}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{label}</div>
        </div>
    );
}

function VisionStatement() {
    const [ref, inView] = useInView(0.2);

    return (
        <div
            ref={ref}
            style={{
                background: "#0D1830",
                borderRadius: "20px",
                padding: "50px",
                marginBottom: "80px",
                textAlign: "center",
                border: "0.5px solid rgba(56,189,248,0.2)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.8s ease-out",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.05) 0%, transparent 70%)",
                animation: "pulse 4s ease-in-out infinite"
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>👁️</div>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "28px",
                    color: "#38BDF8",
                    marginBottom: "20px"
                }}>
                    Our Vision
                </h2>
                <p style={{
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1.8",
                    maxWidth: "800px",
                    margin: "0 auto 30px",
                    fontStyle: "italic"
                }}>
                    "Our goal to become a more intentional organization extends beyond mere words on our materials.
                    Vision represents a daring yet attainable objective that will demand our complete attention and
                    leverage all the inherent strengths of CyForce Technologies Ltd. It is fully within our reach."
                </p>
                <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>
                        DR. DAIMAN, YAKUBU CHIBOK (III), PH.D, DSS, MCSDF, MCPN, MNCS, CTIA
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Group Chief Executive Officer</div>
                </div>
            </div>
        </div>
    );
}

function MissionValues() {
    const [ref, inView] = useInView(0.2);

    return (
        <div
            ref={ref}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "40px",
                marginBottom: "80px",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.8s ease-out 0.2s"
            }}
        >
            <div style={{
                background: "#0D1830",
                borderRadius: "20px",
                padding: "40px",
                textAlign: "center",
                border: "0.5px solid rgba(99,179,237,0.1)",
                transition: "transform 0.3s ease"
            }}
                 onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎯</div>
                <h3 style={{ fontSize: "22px", color: "#38BDF8", marginBottom: "16px" }}>Our Mission</h3>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
                    To provide comprehensive security and ICT solutions that protect and empower
                    businesses across Nigeria with integrity and excellence.
                </p>
            </div>
            <div style={{
                background: "#0D1830",
                borderRadius: "20px",
                padding: "40px",
                textAlign: "center",
                border: "0.5px solid rgba(99,179,237,0.1)",
                transition: "transform 0.3s ease"
            }}
                 onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>💎</div>
                <h3 style={{ fontSize: "22px", color: "#38BDF8", marginBottom: "16px" }}>Our Values</h3>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)" }}>
                    Experience, Expertise, and Honesty - The three pillars that guide every solution we deliver.
                </p>
            </div>
        </div>
    );
}

function WhyChooseUs() {
    const [ref, inView] = useInView(0.2);

    const features = [
        { icon: "🏢", title: "Extensive Network", desc: "4000+ sales and service centers across Nigeria" },
        { icon: "🔒", title: "Comprehensive Security", desc: "From CCTV to Cyber Security, we cover all your needs" },
        { icon: "💡", title: "Expert Team", desc: "Led by industry veterans with decades of experience" },
        { icon: "🛡️", title: "Proven Track Record", desc: "Distinguished name in security & surveillance industry" },
        { icon: "🤝", title: "Customer First", desc: "Committed to integrity and honest service" },
        { icon: "🚀", title: "Innovation Driven", desc: "Leveraging intelligence-driven technologies" }
    ];

    return (
        <div ref={ref} style={{ marginBottom: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <div style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "rgba(56,189,248,0.1)",
                    borderRadius: "20px",
                    fontSize: "11px",
                    color: "#38BDF8",
                    marginBottom: "20px"
                }}>
                    Why Choose Us
                </div>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "32px",
                    color: "#fff",
                    marginBottom: "16px"
                }}>
                    What Sets Us Apart
                </h2>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "30px",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.8s ease-out"
            }}>
                {features.map((item, idx) => (
                    <div key={idx} style={{
                        background: "#0D1830",
                        borderRadius: "16px",
                        padding: "30px",
                        textAlign: "center",
                        border: "0.5px solid rgba(99,179,237,0.1)",
                        transition: "all 0.3s ease"
                    }}
                         onMouseEnter={e => {
                             e.currentTarget.style.transform = "translateY(-5px)";
                             e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                         }}
                         onMouseLeave={e => {
                             e.currentTarget.style.transform = "translateY(0)";
                             e.currentTarget.style.borderColor = "rgba(99,179,237,0.1)";
                         }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{item.icon}</div>
                        <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px" }}>{item.title}</h3>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NetGuardingTagline() {
    const [ref, inView] = useInView(0.2);

    return (
        <div
            ref={ref}
            style={{
                textAlign: "center",
                padding: "60px",
                background: "linear-gradient(135deg, rgba(43,92,230,0.1), rgba(56,189,248,0.1))",
                borderRadius: "20px",
                border: "0.5px solid rgba(56,189,248,0.2)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.8s ease-out",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{
                position: "absolute",
                width: "200%",
                height: "200%",
                top: "-50%",
                left: "-50%",
                background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
                animation: "rotate 20s linear infinite"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse 2s ease-in-out infinite" }}>🛡️</div>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "36px",
                    color: "#38BDF8",
                    marginBottom: "16px"
                }}>
                    ...Net Guarding you
                </h2>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)" }}>
                    Your trusted partner in security, ICT, and surveillance solutions
                </p>
            </div>
        </div>
    );
}

function CTASection() {
    const [ref, inView] = useInView(0.2);

    return (
        <div
            ref={ref}
            style={{
                background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                margin: "40px 48px 80px",
                borderRadius: "24px",
                padding: "60px 48px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.8s ease-out"
            }}
        >
            {/* Animated particles */}
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
    );
}

// Add animations to the page
const style = document.createElement('style');
style.textContent = `
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
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
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
`;
document.head.appendChild(style);

export default AboutPage;