import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import meeting from './images/meeting.jpg';
import sbImg from './images/s&b.jpg';
import certi from './images/certificate.jpg';
import crt from './images/ctr.jpg';
import cli1 from './images/client1.jpg';
import cli2 from './images/client2.png';
import cli3 from './images/client3.png';
import cli4 from './images/client4.png';
import cli5 from './images/client5.jpg';
import part1 from './images/partner1.png';
import part2 from './images/partner2.jpg';
import part3 from './images/partner3.png';
import part4 from './images/partner4.png';
import part5 from './images/partner5.png';
import part6 from './images/partner6.jpg';
import cyber from './images/CyberSec.jpg';
import solar from './images/solar.jpg';
import ict from './images/IctServices.jpg';
import { QUOTE_OFFERINGS } from './constants/quoteOfferings';
import { FONT_BODY, FONT_DISPLAY } from './styles/landingFonts';

function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function AnimatedParticles() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        const init = () => {
            particles = Array.from({ length: 55 }, () => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.25,
                a: Math.random() * 0.35 + 0.08,
            }));
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x = (p.x + p.vx + canvas.width) % canvas.width;
                p.y = (p.y + p.vy + canvas.height) % canvas.height;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(56,189,248,${p.a})`;
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99,179,237,${(1 - d / 90) * 0.06})`;
                        ctx.stroke();
                    }
                }
            });
            animationId = requestAnimationFrame(draw);
        };
        resize(); init(); draw();
        const onResize = () => { resize(); init(); };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} className="about-particles" />;
}

const HERO_STATS = [
    { value: '500+', label: 'Installations' },
    { value: '12+', label: 'Years' },
    { value: '30+', label: 'Cities' },
    { value: '99.8%', label: 'Uptime SLA' },
];

const JOURNEY = [
    { year: '2012', title: 'Founded in Abuja', desc: 'Security and ICT solutions across the FCT.', accent: '#38BDF8' },
    { year: '2016', title: 'National expansion', desc: 'Partner-led centres nationwide.', accent: '#34D399' },
    { year: '2020', title: 'Solar & automation', desc: 'Clean energy joins the core portfolio.', accent: '#A78BFA' },
    { year: '2024', title: 'Enterprise platform', desc: 'Supply, install, and managed services.', accent: '#F472B6' },
];

const PILLARS = [
    { tag: 'Vision', title: 'Intentional growth', body: 'Leveraging every strength of CyForce to deliver security, energy, and enterprise technology at national scale.', accent: '#38BDF8' },
    { tag: 'Mission', title: 'Protect and empower', body: 'Solutions that safeguard businesses, homes, and institutions across Nigeria with integrity and excellence.', accent: '#34D399' },
    { tag: 'Values', title: 'Experience. Expertise. Honesty.', body: 'The three pillars behind every product we supply and every installation we commission.', accent: '#F472B6' },
];

const SHOWCASE = [
    {
        tag: 'Reach',
        accent: '#34D399',
        title: 'Nationwide presence',
        desc: 'Sales and service footprint across major cities with certified field engineers ready for survey, install, and commissioning.',
        bullets: ['Multi-city service centres', 'On-site installation teams', 'Responsive after-sales support'],
        image: ict,
    },
    {
        tag: 'Security',
        accent: '#38BDF8',
        title: 'Full-stack protection',
        desc: 'CCTV, access control, cyber defence, and surveillance under one accountable partner — designed for homes, SMEs, and enterprise.',
        bullets: ['Threat-aware architecture', 'Penetration testing & audits', '24/7 monitoring options'],
        image: cyber,
    },
    {
        tag: 'Energy',
        accent: '#FBBF24',
        title: 'Clean power solutions',
        desc: 'Commercial and residential solar design, supply, installation, and smart monitoring for reliable, efficient operations.',
        bullets: ['Solar & storage systems', 'Energy monitoring', 'Turnkey commissioning'],
        image: solar,
    },
];

const MINI_STRENGTHS = [
    { title: 'Turnkey delivery', desc: 'Products only, install only, or both.', accent: '#38BDF8' },
    { title: 'Trusted leadership', desc: 'Decades of combined industry experience.', accent: '#34D399' },
    { title: 'Long-term support', desc: 'Maintenance, upgrades, and care.', accent: '#A78BFA' },
];

const PARTNERS = [
    { name: 'Felicitysolar', logo: part1 },
    { name: 'Amaron Quanta', logo: part2 },
    { name: 'HikVision', logo: part3 },
    { name: 'Cisco', logo: part4 },
    { name: 'Microsoft', logo: part5 },
    { name: 'ATBTech', logo: part6 },
];

const CLIENTS = [
    { name: 'Stallion Luxury Suites', logo: cli1 },
    { name: 'Bethel Hotel', logo: cli2 },
    { name: 'NNPC', logo: cli3 },
    { name: 'Fed. Ministry of Education', logo: cli4 },
    { name: 'Federal University Wukari', logo: cli5 },
];

function Reveal({ children, delay = 0, className = '', direction = 'up' }) {
    const [ref, inView] = useInView(0.06);
    const transforms = {
        up: 'translateY(36px)',
        left: 'translateX(-40px)',
        right: 'translateX(40px)',
    };
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : transforms[direction],
                transition: `all 0.85s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

function SectionHeader({ eyebrow, title, subtitle, align = 'left' }) {
    return (
        <div className={`about-section-header about-section-header--${align}`}>
            <span className="about-eyebrow">{eyebrow}</span>
            <h2 className="about-title">{title}</h2>
            {subtitle && <p className="about-subtitle">{subtitle}</p>}
        </div>
    );
}

function ShowcaseRow({ item, index }) {
    const [ref, inView] = useInView(0.15);
    const even = index % 2 === 0;
    return (
        <div
            ref={ref}
            className="about-showcase"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(50px)',
                transition: `all 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
            }}
        >
            <div className="about-showcase-media" style={{ order: even ? 1 : 2 }}>
                <div className="about-showcase-frame" style={{ borderColor: `${item.accent}33` }}>
                    <img src={item.image} alt={item.title} />
                    <div className="about-showcase-frame-glow" style={{ background: `radial-gradient(circle at 30% 80%, ${item.accent}30, transparent 60%)` }} />
                </div>
                <div className="about-showcase-index" style={{ color: item.accent }}>0{index + 1}</div>
            </div>
            <div className="about-showcase-copy" style={{ order: even ? 2 : 1 }}>
                <span className="about-showcase-tag" style={{ color: item.accent, borderColor: `${item.accent}44`, background: `${item.accent}14` }}>
                    {item.tag}
                </span>
                <h3 style={{ background: `linear-gradient(135deg, #fff, ${item.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {item.title}
                </h3>
                <p>{item.desc}</p>
                <ul>
                    {item.bullets.map((b) => (
                        <li key={b}>
                            <span style={{ color: item.accent }}>✓</span> {b}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function LogoMarquee({ items, label }) {
    const doubled = [...items, ...items];
    return (
        <div className="about-marquee-block">
            <div className="about-marquee-label">{label}</div>
            <div className="about-marquee-mask">
                <div className="about-marquee-track">
                    {doubled.map((item, i) => (
                        <div key={`${item.name}-${i}`} className="about-marquee-item">
                            <img src={item.logo} alt={item.name} />
                            <span>{item.name}</span>
            </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AboutPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="about-hero-photo" style={{ backgroundImage: `url(${crt})` }} />
                <div className="about-hero-overlay" />
                <AnimatedParticles />
                <div className="about-hero-grid" />

                <div className="about-hero-layout">
                    <Reveal direction="left">
                        <span className="about-eyebrow">Who We Are</span>
                        <h1 className="about-hero-heading">
                            Engineering trust<br />
                            <span>one install at a time</span>
                        </h1>
                        <p className="about-hero-lead">
                            CyForce Technologies designs, supplies, and installs security, solar, and enterprise
                            systems for businesses, governments, and homeowners across Nigeria.
                        </p>
                        <div className="about-hero-actions">
                            <Link to={{ pathname: '/', hash: '#contact' }} className="about-btn about-btn--primary">
                                Contact Us
                            </Link>
                            <Link to="/services" className="about-btn about-btn--ghost">Our Services</Link>
                    </div>
                    </Reveal>

                    <Reveal direction="right" delay={0.15}>
                        <div className="about-hero-collage">
                            <div className="about-collage-main">
                                <img src={meeting} alt="CyForce team" />
                                <div className="about-collage-main-overlay" />
                </div>
                            <div className="about-collage-float about-collage-float--1">
                                <img src={cyber} alt="" />
            </div>
                            <div className="about-collage-float about-collage-float--2">
                                <img src={solar} alt="" />
        </div>
                            <div className="about-collage-badge">
                                <strong>12+</strong>
                                <span>Years of excellence</span>
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="about-hero-stats-bar">
                    {HERO_STATS.map((s) => (
                        <div key={s.label} className="about-hero-stat">
                            <div className="about-hero-stat-value">{s.value}</div>
                            <div className="about-hero-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="about-impact">
                <div className="about-impact-bg" style={{ backgroundImage: `url(${sbImg})` }} />
                <div className="about-impact-overlay" />
                <Reveal>
                    <div className="about-impact-inner">
                        <p className="about-impact-quote">
                            &ldquo;We provide a comprehensive portfolio spanning product supply, professional installation,
                            and ongoing support — so your operations stay protected, efficient, and future-ready.&rdquo;
                        </p>
                        <div className="about-impact-chips">
                            {['CCTV & Surveillance', 'Cyber Security', 'Solar Energy', 'ICT Infrastructure', 'Automation', 'Certificates'].map((t) => (
                                <span key={t}>{t}</span>
                            ))}
            </div>
                    </div>
                </Reveal>
            </section>

            <section className="about-section">
                <div className="about-container">
                    <div className="about-story-split">
                        <Reveal direction="left">
                            <SectionHeader
                                eyebrow="Our Story"
                                title={<>Experience, expertise<br />and honesty</>}
                                subtitle="A distinguished name in security, ICT, and surveillance — built on intelligence-driven tools that meet today's complex threats."
                            />
                            <p className="about-body">
                                With a growing network of sales and service centres across Nigeria, CyForce delivers
                                end-to-end technology partnerships — not just products on a shelf.
                            </p>
                            <div className="about-story-metrics">
                                <div className="about-metric-card">
                                    <strong>500+</strong><span>Projects delivered</span>
            </div>
                                <div className="about-metric-card">
                                    <strong>100+</strong><span>Service touchpoints</span>
        </div>
                </div>
                        </Reveal>
                        <Reveal direction="right" delay={0.12}>
                            <div className="about-cert-visual">
                                <img src={certi} alt="Certifications" />
                                <div className="about-cert-glow" />
                                <div className="about-cert-caption">Certified. Compliant. Accountable.</div>
            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <section className="about-section about-section--glow">
                <div className="about-container">
                    <Reveal>
                        <SectionHeader
                            align="center"
                            eyebrow="Our Journey"
                            title="A decade of deliberate growth"
                            subtitle="Milestones that shaped CyForce into a national technology partner."
                        />
                    </Reveal>
                    <div className="about-journey">
                        <div className="about-journey-line" />
                        {JOURNEY.map((item, i) => (
                            <Reveal key={item.year} delay={i * 0.1}>
                                <div className={`about-journey-node${i % 2 ? ' about-journey-node--alt' : ''}`}>
                                    <div className="about-journey-dot" style={{ borderColor: item.accent, boxShadow: `0 0 20px ${item.accent}55` }} />
                                    <div className="about-journey-card" style={{ borderTopColor: item.accent }}>
                                        <span style={{ color: item.accent }}>{item.year}</span>
                                        <h4>{item.title}</h4>
                                        <p>{item.desc}</p>
                    </div>
                                </div>
                            </Reveal>
                ))}
            </div>
        </div>
            </section>

            <section className="about-section">
                <div className="about-container">
                    <Reveal>
                        <SectionHeader eyebrow="What Guides Us" title="Vision, mission & values" />
                    </Reveal>
                    <div className="about-pillars">
                        {PILLARS.map((p, i) => (
                            <Reveal key={p.tag} delay={i * 0.1}>
                                <div className="about-pillar" style={{ '--accent': p.accent }}>
                                    <div className="about-pillar-bar" style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
                                    <span className="about-pillar-tag" style={{ color: p.accent }}>{p.tag}</span>
                                    <h3>{p.title}</h3>
                                    <p>{p.body}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.2}>
                        <div className="about-leader">
                            <div className="about-leader-mark">&ldquo;</div>
                            <blockquote>
                                Our goal to become a more intentional organisation extends beyond mere words.
                                Vision represents a daring yet attainable objective that will demand our complete attention
                                and leverage all the inherent strengths of CyForce Technologies Ltd.
                            </blockquote>
                            <div className="about-leader-info">
                                <div>
                                    <strong>Dr. Daiman Yakubu Chibok (III)</strong>
                                    <span>Group Chief Executive Officer</span>
            </div>
                                <div className="about-leader-creds">Ph.D, DSS, MCSDF, MCPN, MNCS, CTIA</div>
        </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="about-section about-section--alt">
                <div className="about-container">
                    <Reveal>
                        <SectionHeader
                            align="center"
                            eyebrow="Why CyForce"
                            title="What sets us apart"
                            subtitle="Depth, reach, and accountability — from first survey to final handover."
                        />
                    </Reveal>
                    {SHOWCASE.map((item, i) => (
                        <ShowcaseRow key={item.title} item={item} index={i} />
                    ))}
                    <div className="about-mini-grid">
                        {MINI_STRENGTHS.map((m, i) => (
                            <Reveal key={m.title} delay={i * 0.08}>
                                <div className="about-mini-card" style={{ borderColor: `${m.accent}33` }}>
                                    <div className="about-mini-accent" style={{ background: m.accent }} />
                                    <h4>{m.title}</h4>
                                    <p>{m.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="about-container">
                    <Reveal>
                        <SectionHeader
                            eyebrow="How We Work"
                            title="Supply, install, or both"
                            subtitle="The same flexible options on our homepage quote form."
                        />
                    </Reveal>
                    <div className="about-offerings">
                        {QUOTE_OFFERINGS.map((o, i) => (
                            <Reveal key={o.id} delay={i * 0.08}>
                                <div className="about-offering">
                                    <span className="about-offering-num">0{i + 1}</span>
                                    <span className="about-offering-tag">{o.tag}</span>
                                    <h3>{o.title}</h3>
                                    <p>{o.description}</p>
                                </div>
                            </Reveal>
                ))}
            </div>
                </div>
            </section>

            <section className="about-section about-section--alt">
                <div className="about-container">
                    <Reveal>
                        <SectionHeader
                            align="center"
                            eyebrow="Ecosystem"
                            title="Partners & clients"
                            subtitle="Technology brands and organisations we serve across Nigeria."
                        />
                    </Reveal>
                    <LogoMarquee items={PARTNERS} label="Technology partners" />
                    <LogoMarquee items={CLIENTS} label="Selected clients" />
                </div>
            </section>

            <section className="about-closing">
                <div className="about-container">
                    <Reveal>
                        <div className="about-closing-panel">
                            <div className="about-closing-promise">
                                <span className="about-eyebrow">Our Promise</span>
                                <h2>
                                    Net Guarding <span>you</span>
            </h2>
                                <p>
                                    Your trusted partner from consultation to commissioning — protecting what matters
                                    with security, energy, and enterprise technology built to last.
                                </p>
                                <ul className="about-closing-points">
                                    <li>Certified installation teams</li>
                                    <li>Nationwide sales &amp; support</li>
                                    <li>Products, install, or both</li>
                                </ul>
                            </div>

                            <div className="about-closing-action">
                                <h3>Ready to work with CyForce?</h3>
                                <p>
                                    Reach out to discuss your project — our team is ready to help with products,
                                    installations, and ongoing support.
                                </p>
                                <div className="about-closing-buttons">
                                    <Link to={{ pathname: '/', hash: '#contact' }} className="about-btn about-btn--primary">
                                        Contact Us
                                    </Link>
                                    <Link to="/services" className="about-btn about-btn--ghost">
                                        Our Services
            </Link>
        </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <style>{`
                .about-page { background: #060B1A; min-height: 100vh; padding-top: 88px; overflow-x: hidden; font-family: ${FONT_BODY}; }
                .about-container { max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 44px); }
                .about-section { padding: clamp(60px, 9vw, 96px) 0; position: relative; }
                .about-section--alt { background: #04080F; border-block: 0.5px solid rgba(99,179,237,0.07); }
                .about-section--glow::before {
                    content: ''; position: absolute; inset: 0; pointer-events: none;
                    background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(43,92,230,0.12), transparent);
                }
                .about-section-header { margin-bottom: 44px; }
                .about-section-header--center { text-align: center; max-width: 620px; margin-inline: auto; }
                .about-eyebrow {
                    display: inline-block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
                    color: #38BDF8; margin-bottom: 14px; padding: 5px 16px;
                    background: rgba(56,189,248,0.1); border: 0.5px solid rgba(56,189,248,0.25); border-radius: 24px; font-weight: 600;
                }
                .about-title { font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: clamp(28px, 4.5vw, 40px); color: #fff; line-height: 1.12; margin: 0 0 14px; }
                .about-subtitle { font-size: 15px; color: rgba(255,255,255,0.48); line-height: 1.7; margin: 0; max-width: 540px; }
                .about-section-header--center .about-subtitle { margin-inline: auto; }
                .about-body { font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.8; margin: 0 0 24px; max-width: 520px; }
                .about-particles { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

                .about-hero {
                    position: relative; min-height: 88vh; display: flex; flex-direction: column; justify-content: center;
                    padding: clamp(48px, 8vw, 80px) clamp(18px, 4vw, 44px) 0; overflow: hidden;
                }
                .about-hero-photo {
                    position: absolute; inset: 0; background-size: cover; background-position: center;
                    opacity: 0.14; transform: scale(1.05);
                }
                .about-hero-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(6,11,26,0.92) 0%, rgba(13,24,48,0.85) 50%, rgba(6,11,26,0.95) 100%);
                }
                .about-hero-grid {
                    position: absolute; inset: 0; opacity: 0.4;
                    background-image: linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .about-hero-layout {
                    position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; width: 100%;
                    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 64px); align-items: center;
                }
                .about-hero-heading {
                    font-family: ${FONT_DISPLAY}; font-weight: 800; font-size: clamp(36px, 5.5vw, 58px);
                    color: #fff; line-height: 1.05; margin: 0 0 20px;
                }
                .about-hero-heading span {
                    background: linear-gradient(135deg, #38BDF8, #2B5CE6);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                }
                .about-hero-lead { font-size: 16px; color: rgba(255,255,255,0.52); line-height: 1.75; max-width: 480px; margin: 0 0 28px; }
                .about-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
                .about-btn {
                    display: inline-flex; align-items: center; padding: 13px 26px; border-radius: 10px;
                    font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.25s ease;
                }
                .about-btn--primary { background: #2B5CE6; color: #fff; box-shadow: 0 0 28px rgba(43,92,230,0.4); }
                .about-btn--primary:hover { background: #3b6ef0; transform: translateY(-2px); }
                .about-btn--ghost { color: rgba(255,255,255,0.72); border: 0.5px solid rgba(255,255,255,0.2); }
                .about-btn--ghost:hover { border-color: rgba(56,189,248,0.5); color: #fff; }

                .about-hero-collage { position: relative; height: clamp(340px, 42vw, 460px); }
                .about-collage-main {
                    position: absolute; inset: 0; border-radius: 20px; overflow: hidden;
                    border: 0.5px solid rgba(99,179,237,0.2); box-shadow: 0 32px 64px rgba(0,0,0,0.45);
                }
                .about-collage-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .about-collage-main-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, transparent 40%, rgba(6,11,26,0.5) 100%); }
                .about-collage-float {
                    position: absolute; border-radius: 14px; overflow: hidden; border: 2px solid rgba(6,11,26,0.8);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5); transition: transform 0.4s ease;
                }
                .about-collage-float img { width: 100%; height: 100%; object-fit: cover; display: block; }
                .about-collage-float--1 { width: 38%; height: 32%; top: -6%; right: -4%; animation: aboutFloatA 8s ease-in-out infinite; }
                .about-collage-float--2 { width: 34%; height: 28%; bottom: 4%; left: -6%; animation: aboutFloatB 9s ease-in-out infinite; }
                .about-collage-badge {
                    position: absolute; bottom: 24px; right: -12px; z-index: 2;
                    background: #0D1F3C; border: 0.5px solid rgba(56,189,248,0.3); border-radius: 14px;
                    padding: 16px 22px; box-shadow: 0 20px 48px rgba(0,0,0,0.55);
                }
                .about-collage-badge strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 32px; color: #fff; }
                .about-collage-badge span { font-size: 11px; color: rgba(255,255,255,0.42); }

                .about-hero-stats-bar {
                    position: relative; z-index: 1; max-width: 1180px; margin: clamp(40px, 6vw, 56px) auto 0; width: 100%;
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
                    padding: 28px clamp(18px, 4vw, 36px); border-radius: 16px;
                    background: rgba(13,24,48,0.65); border: 0.5px solid rgba(99,179,237,0.15);
                    backdrop-filter: blur(12px);
                }
                .about-hero-stat { text-align: center; padding: 8px; border-right: 0.5px solid rgba(99,179,237,0.1); }
                .about-hero-stat:last-child { border-right: none; }
                .about-hero-stat-value { font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: clamp(22px, 3vw, 30px); color: #fff; }
                .about-hero-stat-label { font-size: 11px; color: rgba(255,255,255,0.38); margin-top: 4px; }

                .about-impact {
                    position: relative; padding: clamp(72px, 10vw, 110px) clamp(18px, 4vw, 44px); overflow: hidden;
                }
                .about-impact-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
                .about-impact-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(90deg, rgba(6,11,26,0.94) 0%, rgba(6,11,26,0.7) 50%, rgba(6,11,26,0.94) 100%);
                }
                .about-impact-inner { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; text-align: center; }
                .about-impact-quote {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(20px, 3.5vw, 28px); color: rgba(255,255,255,0.88);
                    line-height: 1.55; margin: 0 0 32px; font-style: italic;
                }
                .about-impact-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
                .about-impact-chips span {
                    padding: 8px 18px; border-radius: 24px; font-size: 12px; color: rgba(255,255,255,0.65);
                    background: rgba(43,92,230,0.15); border: 0.5px solid rgba(56,189,248,0.25);
                }

                .about-story-split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 72px); align-items: center; }
                .about-story-metrics { display: flex; gap: 16px; flex-wrap: wrap; }
                .about-metric-card {
                    flex: 1; min-width: 140px; padding: 20px 22px; border-radius: 14px;
                    background: linear-gradient(135deg, rgba(43,92,230,0.12), rgba(56,189,248,0.06));
                    border: 0.5px solid rgba(56,189,248,0.2);
                }
                .about-metric-card strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 28px; color: #38BDF8; }
                .about-metric-card span { font-size: 12px; color: rgba(255,255,255,0.42); margin-top: 4px; display: block; }
                .about-cert-visual { position: relative; border-radius: 20px; overflow: hidden; border: 0.5px solid rgba(99,179,237,0.18); }
                .about-cert-visual img { width: 100%; height: clamp(300px, 36vw, 400px); object-fit: cover; display: block; filter: brightness(0.85); }
                .about-cert-glow {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(6,11,26,0.85) 0%, transparent 50%);
                }
                .about-cert-caption {
                    position: absolute; bottom: 20px; left: 20px; right: 20px;
                    font-family: ${FONT_DISPLAY}; font-weight: 600; font-size: 15px; color: #fff;
                }

                .about-journey {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
                    position: relative; padding-top: 24px;
                }
                .about-journey-line {
                    position: absolute; top: 38px; left: 8%; right: 8%; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
                }
                .about-journey-node { position: relative; text-align: center; }
                .about-journey-node--alt .about-journey-card { margin-top: 48px; }
                .about-journey-dot {
                    width: 14px; height: 14px; border-radius: 50%; margin: 0 auto 20px;
                    background: #060B1A; border: 2px solid #38BDF8;
                }
                .about-journey-card {
                    background: #0D1830; border-radius: 14px; padding: 22px 18px; text-align: left;
                    border: 0.5px solid rgba(99,179,237,0.12); border-top: 2px solid #38BDF8;
                    min-height: 140px; transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .about-journey-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
                .about-journey-card span { font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: 13px; }
                .about-journey-card h4 { font-family: ${FONT_DISPLAY}; color: #fff; font-size: 15px; margin: 10px 0 8px; }
                .about-journey-card p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.55; }

                .about-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px; }
                .about-pillar {
                    position: relative; background: #0D1830; border-radius: 16px; padding: 28px 24px 24px;
                    border: 0.5px solid rgba(99,179,237,0.12); overflow: hidden;
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }
                .about-pillar:hover { transform: translateY(-5px); border-color: rgba(56,189,248,0.35); }
                .about-pillar-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
                .about-pillar-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
                .about-pillar h3 { font-family: ${FONT_DISPLAY}; font-size: 18px; color: #fff; margin: 14px 0 10px; }
                .about-pillar p { margin: 0; font-size: 14px; color: rgba(255,255,255,0.48); line-height: 1.65; }

                .about-leader {
                    position: relative; padding: clamp(32px, 5vw, 48px);
                    border-radius: 20px; overflow: hidden;
                    background: linear-gradient(135deg, rgba(43,92,230,0.18), rgba(13,24,48,0.9));
                    border: 0.5px solid rgba(56,189,248,0.25);
                }
                .about-leader-mark {
                    font-family: ${FONT_DISPLAY}; font-size: 72px; line-height: 0.6; color: rgba(56,189,248,0.25);
                    margin-bottom: 16px;
                }
                .about-leader blockquote {
                    margin: 0 0 28px; font-size: clamp(16px, 2.5vw, 19px); color: rgba(255,255,255,0.78);
                    line-height: 1.75; font-style: italic; max-width: 780px;
                }
                .about-leader-info strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 16px; color: #fff; }
                .about-leader-info span { font-size: 13px; color: #38BDF8; }
                .about-leader-creds { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 10px; }

                .about-showcase {
                    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 60px);
                    align-items: center; margin-bottom: clamp(48px, 8vw, 72px);
                }
                .about-showcase-media { position: relative; }
                .about-showcase-frame {
                    border-radius: 22px; overflow: hidden; border: 0.5px solid rgba(99,179,237,0.2);
                    box-shadow: 0 24px 48px rgba(0,0,0,0.35); position: relative;
                }
                .about-showcase-frame img { width: 100%; height: 380px; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); }
                .about-showcase-frame:hover img { transform: scale(1.06); }
                .about-showcase-frame-glow { position: absolute; inset: 0; pointer-events: none; }
                .about-showcase-index {
                    position: absolute; top: -12px; right: -8px; font-family: ${FONT_DISPLAY};
                    font-size: 64px; font-weight: 800; opacity: 0.12; line-height: 1; pointer-events: none;
                }
                .about-showcase-tag {
                    display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px;
                    letter-spacing: 0.08em; text-transform: uppercase; border: 0.5px solid; margin-bottom: 16px; font-weight: 600;
                }
                .about-showcase-copy h3 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(26px, 3.5vw, 34px); margin: 0 0 16px; line-height: 1.15;
                }
                .about-showcase-copy p { font-size: 15px; color: rgba(255,255,255,0.52); line-height: 1.75; margin: 0 0 20px; }
                .about-showcase-copy ul { list-style: none; padding: 0; margin: 0; }
                .about-showcase-copy li {
                    display: flex; align-items: center; gap: 10px; font-size: 14px;
                    color: rgba(255,255,255,0.58); margin-bottom: 10px;
                }

                .about-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .about-mini-card {
                    position: relative; padding: 24px 22px 22px 28px; border-radius: 14px;
                    background: #0D1830; border: 0.5px solid rgba(99,179,237,0.12);
                    transition: transform 0.25s ease;
                }
                .about-mini-card:hover { transform: translateY(-4px); }
                .about-mini-accent { position: absolute; left: 0; top: 20px; bottom: 20px; width: 3px; border-radius: 2px; }
                .about-mini-card h4 { font-family: ${FONT_DISPLAY}; font-size: 16px; color: #fff; margin: 0 0 8px; }
                .about-mini-card p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.55; }

                .about-offerings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
                .about-offering {
                    position: relative; padding: 28px 24px; border-radius: 16px; background: #0D1830;
                    border: 0.5px solid rgba(99,179,237,0.12); transition: all 0.3s ease;
                }
                .about-offering:hover { border-color: rgba(56,189,248,0.35); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.25); }
                .about-offering-num { position: absolute; top: 16px; right: 18px; font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 700; }
                .about-offering-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #38BDF8; font-weight: 600; }
                .about-offering h3 { font-family: ${FONT_DISPLAY}; font-size: 18px; color: #fff; margin: 12px 0 10px; }
                .about-offering p { margin: 0 0 16px; font-size: 14px; color: rgba(255,255,255,0.48); line-height: 1.6; }
                .about-offering a { font-size: 13px; font-weight: 600; color: #38BDF8; text-decoration: none; }
                .about-offering a:hover { color: #fff; }

                .about-marquee-block { margin-bottom: 32px; }
                .about-marquee-label { text-align: center; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
                .about-marquee-mask { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
                .about-marquee-track {
                    display: flex; gap: 20px; width: max-content;
                    animation: aboutMarquee 35s linear infinite;
                }
                .about-marquee-item {
                    flex-shrink: 0; width: 160px; padding: 20px 16px; border-radius: 12px;
                    background: rgba(255,255,255,0.03); border: 0.5px dashed rgba(99,179,237,0.2);
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                }
                .about-marquee-item img { height: 40px; max-width: 100%; object-fit: contain; filter: brightness(0.92); }
                .about-marquee-item span { font-size: 10px; color: rgba(255,255,255,0.4); text-align: center; }

                .about-closing {
                    padding: clamp(56px, 8vw, 88px) 0 clamp(72px, 10vw, 104px);
                    border-top: 0.5px solid rgba(99,179,237,0.08);
                }
                .about-closing-panel {
                    display: grid;
                    grid-template-columns: 1.05fr 0.95fr;
                    gap: 0;
                    border-radius: 22px;
                    overflow: hidden;
                    border: 0.5px solid rgba(99,179,237,0.16);
                    background: #0D1830;
                    box-shadow: 0 32px 64px rgba(0,0,0,0.28);
                }
                .about-closing-promise {
                    padding: clamp(32px, 5vw, 48px);
                    text-align: left;
                    border-right: 0.5px solid rgba(99,179,237,0.1);
                }
                .about-closing-promise h2 {
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(30px, 4.5vw, 42px);
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.1;
                    margin: 0 0 16px;
                }
                .about-closing-promise h2 span { color: #38BDF8; }
                .about-closing-promise > p {
                    font-size: 15px;
                    color: rgba(255,255,255,0.52);
                    line-height: 1.75;
                    margin: 0 0 24px;
                    max-width: 420px;
                }
                .about-closing-points {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .about-closing-points li {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: rgba(255,255,255,0.55);
                }
                .about-closing-points li::before {
                    content: '';
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #38BDF8;
                    box-shadow: 0 0 10px rgba(56,189,248,0.5);
                    flex-shrink: 0;
                }
                .about-closing-action {
                    padding: clamp(32px, 5vw, 48px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: linear-gradient(160deg, rgba(43,92,230,0.22) 0%, rgba(13,24,48,0.4) 100%);
                }
                .about-closing-action h3 {
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(22px, 3vw, 28px);
                    color: #fff;
                    margin: 0 0 12px;
                    font-weight: 700;
                }
                .about-closing-action p {
                    font-size: 14px;
                    color: rgba(255,255,255,0.58);
                    line-height: 1.7;
                    margin: 0 0 28px;
                }
                .about-closing-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .about-closing-action .about-btn--ghost {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.22);
                }
                .about-closing-action .about-btn--ghost:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.35);
                }

                @media (max-width: 960px) {
                    .about-hero-layout, .about-story-split, .about-showcase { grid-template-columns: 1fr; }
                    .about-hero-collage { height: 320px; max-width: 480px; margin: 0 auto; }
                    .about-journey { grid-template-columns: repeat(2, 1fr); }
                    .about-journey-line { display: none; }
                    .about-journey-node--alt .about-journey-card { margin-top: 0; }
                    .about-pillars, .about-offerings, .about-mini-grid { grid-template-columns: 1fr; }
                    .about-closing-panel { grid-template-columns: 1fr; }
                    .about-closing-promise { border-right: none; border-bottom: 0.5px solid rgba(99,179,237,0.1); }
                    .about-showcase-media { order: 1 !important; }
                    .about-showcase-copy { order: 2 !important; }
                    .about-hero-stats-bar { grid-template-columns: repeat(2, 1fr); }
                    .about-hero-stat:nth-child(2) { border-right: none; }
                }
                @media (max-width: 560px) {
                    .about-hero { min-height: auto; }
                    .about-journey { grid-template-columns: 1fr; }
                    .about-collage-float { display: none; }
                }

                @keyframes aboutFloatA { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes aboutFloatB { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
                @keyframes aboutMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            `}</style>
        </div>
    );
}

export default AboutPage;
