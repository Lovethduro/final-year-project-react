import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FONT_BODY, FONT_DISPLAY, FONT_SERIF } from '../styles/landingFonts';

export function useInView(threshold = 0.12) {
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

export function AnimatedParticles() {
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
                ctx.fillStyle = `rgba(0,45,114,${p.a})`;
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0,45,114,${(1 - d / 90) * 0.06})`;
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

export function Reveal({ children, delay = 0, className = '', direction = 'up' }) {
    const [ref, inView] = useInView(0.06);
    const transforms = { up: 'translateY(36px)', left: 'translateX(-40px)', right: 'translateX(40px)' };
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

export function SectionHeader({ eyebrow, title, subtitle, align = 'left' }) {
    return (
        <div className={`about-section-header about-section-header--${align}`}>
            {eyebrow && <span className="about-eyebrow">{eyebrow}</span>}
            <h2 className="about-title">{title}</h2>
            {subtitle && <p className="about-subtitle">{subtitle}</p>}
        </div>
    );
}

export function PageHero({
    eyebrow,
    heading,
    headingAccent,
    lead,
    primaryTo,
    primaryLabel,
    secondaryTo,
    secondaryLabel,
    bgImage,
    mainImage,
    floatImage1,
    floatImage2,
    badgeValue,
    badgeLabel,
    stats = [],
    compact = false,
}) {
    return (
        <section className={`about-hero${compact ? ' about-hero--compact' : ''}`}>
            {bgImage && <div className="about-hero-photo" style={{ backgroundImage: `url(${bgImage})` }} />}
            <div className="about-hero-overlay" />
            <AnimatedParticles />
            <div className="about-hero-grid" />
            <div className="about-hero-layout">
                <Reveal direction="left">
                    <span className="about-eyebrow">{eyebrow}</span>
                    <h1 className="about-hero-heading">
                        {heading}
                        {headingAccent && (
                            <>
                                <br />
                                <span>{headingAccent}</span>
                            </>
                        )}
                    </h1>
                    <p className="about-hero-lead">{lead}</p>
                    {(primaryTo || secondaryTo) && (
                        <div className="about-hero-actions">
                            {primaryTo && (
                                <Link to={primaryTo} className="about-btn about-btn--primary">{primaryLabel}</Link>
                            )}
                            {secondaryTo && (
                                <Link to={secondaryTo} className="about-btn about-btn--ghost">{secondaryLabel}</Link>
                            )}
                        </div>
                    )}
                </Reveal>
                {mainImage && (
                    <Reveal direction="right" delay={0.15}>
                        <div className="about-hero-collage">
                            <div className="about-collage-main">
                                <img src={mainImage} alt="" />
                                <div className="about-collage-main-overlay" />
                            </div>
                            {floatImage1 && (
                                <div className="about-collage-float about-collage-float--1">
                                    <img src={floatImage1} alt="" />
                                </div>
                            )}
                            {floatImage2 && (
                                <div className="about-collage-float about-collage-float--2">
                                    <img src={floatImage2} alt="" />
                                </div>
                            )}
                            {badgeValue && (
                                <div className="about-collage-badge">
                                    <strong>{badgeValue}</strong>
                                    <span>{badgeLabel}</span>
                                </div>
                            )}
                        </div>
                    </Reveal>
                )}
            </div>
            {stats.length > 0 && (
                <div className="about-hero-stats-bar">
                    {stats.map((s) => (
                        <div key={s.label} className="about-hero-stat">
                            <div className="about-hero-stat-value">{s.value}</div>
                            <div className="about-hero-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export function PageImpact({ bgImage, quote, chips = [] }) {
    return (
        <section className="about-impact">
            <div className="about-impact-bg" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="about-impact-overlay" />
            <Reveal>
                <div className="about-impact-inner">
                    <p className="about-impact-quote">{quote}</p>
                    {chips.length > 0 && (
                        <div className="about-impact-chips">
                            {chips.map((t) => <span key={t}>{t}</span>)}
                        </div>
                    )}
                </div>
            </Reveal>
        </section>
    );
}

export function PageClosing({
    leftEyebrow,
    leftTitle,
    leftTitleAccent,
    leftBody,
    leftPoints = [],
    rightTitle,
    rightBody,
    primaryTo,
    primaryLabel,
    secondaryTo,
    secondaryLabel,
}) {
    return (
        <section className="about-closing">
            <div className="about-container">
                <Reveal>
                    <div className="about-closing-panel">
                        <div className="about-closing-promise">
                            <span className="about-eyebrow">{leftEyebrow}</span>
                            <h2>
                                {leftTitle}
                                {leftTitleAccent && <> <span>{leftTitleAccent}</span></>}
                            </h2>
                            <p>{leftBody}</p>
                            {leftPoints.length > 0 && (
                                <ul className="about-closing-points">
                                    {leftPoints.map((p) => <li key={p}>{p}</li>)}
                                </ul>
                            )}
                        </div>
                        <div className="about-closing-action">
                            <h3>{rightTitle}</h3>
                            <p>{rightBody}</p>
                            <div className="about-closing-buttons">
                                {primaryTo && (
                                    <Link to={primaryTo} className="about-btn about-btn--primary">{primaryLabel}</Link>
                                )}
                                {secondaryTo && (
                                    <Link to={secondaryTo} className="about-btn about-btn--ghost">{secondaryLabel}</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export function PublicPageStyles() {
    return (
        <style>{`
            .about-page, .services-page, .products-page { background: #FFFFFF; min-height: 100vh; padding-top: 88px; overflow-x: hidden; font-family: ${FONT_BODY}; }
            .about-container { max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 44px); }
            .about-section { padding: clamp(60px, 9vw, 96px) 0; position: relative; }
            .about-section--alt { background: #F8FAFC; border-block: 0.5px solid rgba(0,45,114,0.07); }
            .about-section-header { margin-bottom: 44px; }
            .about-section-header--center { text-align: center; max-width: 620px; margin-inline: auto; }
            .about-section-header--center .about-subtitle { margin-inline: auto; }
            .about-eyebrow {
                display: inline-block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
                color: #1A4A9E; margin-bottom: 14px; padding: 5px 16px;
                background: rgba(0,45,114,0.1); border: 0.5px solid rgba(0,45,114,0.25); border-radius: 24px; font-weight: 600;
            }
            .about-title { font-family: ${FONT_DISPLAY}; font-weight: 800; font-size: clamp(26px, 4.5vw, 38px); color: #002D72; line-height: 1.15; margin: 0 0 14px; text-transform: uppercase; letter-spacing: -0.01em; }
            .about-subtitle { font-family: ${FONT_SERIF}; font-style: italic; font-size: 16px; color: rgba(10,31,68,0.72); line-height: 1.7; margin: 0; max-width: 540px; }
            .about-particles { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

            .about-hero {
                position: relative; min-height: 88vh; display: flex; flex-direction: column; justify-content: center;
                padding: clamp(48px, 8vw, 80px) clamp(18px, 4vw, 44px) 0; overflow: hidden;
            }
            .about-hero--compact { min-height: auto; padding-bottom: clamp(32px, 5vw, 48px); }
            .about-hero-photo { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.14; transform: scale(1.05); }
            .about-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(248,250,252,0.92) 0%, rgba(241,245,249,0.85) 50%, rgba(248,250,252,0.95) 100%); }
            .about-hero-grid {
                position: absolute; inset: 0; opacity: 0.4;
                background-image: linear-gradient(rgba(0,45,114,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,45,114,0.04) 1px, transparent 1px);
                background-size: 48px 48px;
            }
            .about-hero-layout {
                position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; width: 100%;
                display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 64px); align-items: center;
            }
            .about-hero-layout--single { grid-template-columns: 1fr; max-width: 720px; text-align: center; }
            .about-hero-layout--single .about-hero-lead { margin-inline: auto; }
            .about-hero-layout--single .about-hero-actions { justify-content: center; }
            .about-hero-heading { font-family: ${FONT_DISPLAY}; font-weight: 800; font-size: clamp(36px, 5.5vw, 58px); color: #0F172A; line-height: 1.05; margin: 0 0 20px; }
            .about-hero-heading span { background: linear-gradient(135deg, #1A4A9E, #002D72); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .about-hero-lead { font-size: 16px; color: rgba(15,23,42,0.55); line-height: 1.75; max-width: 480px; margin: 0 0 28px; }
            .about-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
            .about-btn {
                display: inline-flex; align-items: center; padding: 13px 26px; border-radius: 10px;
                font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.25s ease; font-family: ${FONT_BODY};
                border: none; cursor: pointer;
            }
            .about-btn--primary { background: #1A56C4; color: #FFFFFF; }
            .about-btn--primary:hover { background: #1A4A9E; transform: translateY(-2px); }
            .about-btn--ghost { color: #002D72; border: 1px solid rgba(0,45,114,0.25); background: #fff; }
            .about-btn--ghost:hover { border-color: rgba(0,45,114,0.5); color: #0F172A; }

            .about-hero-collage { position: relative; height: clamp(340px, 42vw, 460px); }
            .about-collage-main { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; border: 0.5px solid rgba(0,45,114,0.2); box-shadow: 0 32px 64px rgba(0,0,0,0.45); }
            .about-collage-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .about-collage-main-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, transparent 40%, rgba(248,250,252,0.5) 100%); }
            .about-collage-float { position: absolute; border-radius: 14px; overflow: hidden; border: 2px solid rgba(248,250,252,0.8); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
            .about-collage-float img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .about-collage-float--1 { width: 38%; height: 32%; top: -6%; right: -4%; animation: aboutFloatA 8s ease-in-out infinite; }
            .about-collage-float--2 { width: 34%; height: 28%; bottom: 4%; left: -6%; animation: aboutFloatB 9s ease-in-out infinite; }
            .about-collage-badge {
                position: absolute; bottom: 24px; right: -12px; z-index: 2; background: #F1F5F9;
                border: 0.5px solid rgba(0,45,114,0.3); border-radius: 14px; padding: 16px 22px; box-shadow: 0 20px 48px rgba(0,0,0,0.55);
            }
            .about-collage-badge strong { display: block; font-family: ${FONT_DISPLAY}; font-size: 32px; color: #0F172A; }
            .about-collage-badge span { font-size: 11px; color: rgba(15,23,42,0.5); }

            .about-hero-stats-bar {
                position: relative; z-index: 1; max-width: 1180px; margin: clamp(40px, 6vw, 56px) auto 0; width: 100%;
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 28px clamp(18px, 4vw, 36px);
                border-radius: 16px; background: rgba(241,245,249,0.65); border: 0.5px solid rgba(0,45,114,0.15); backdrop-filter: blur(12px);
            }
            .about-hero-stat { text-align: center; padding: 8px; border-right: 0.5px solid rgba(0,45,114,0.1); }
            .about-hero-stat:last-child { border-right: none; }
            .about-hero-stat-value { font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: clamp(22px, 3vw, 30px); color: #0F172A; }
            .about-hero-stat-label { font-size: 11px; color: rgba(10,31,68,0.55); margin-top: 4px; }

            .about-impact { position: relative; padding: clamp(72px, 10vw, 110px) clamp(18px, 4vw, 44px); overflow: hidden; }
            .about-impact-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
            .about-impact-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.7) 50%, rgba(248,250,252,0.94) 100%); }
            .about-impact-inner { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; text-align: center; }
            .about-impact-quote { font-family: ${FONT_SERIF}; font-size: clamp(18px, 3.2vw, 26px); color: #002D72; line-height: 1.55; margin: 0 0 32px; font-style: italic; }
            .about-impact-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
            .about-impact-chips span { padding: 8px 18px; border-radius: 24px; font-size: 12px; color: rgba(10,31,68,0.62); background: rgba(0,45,114,0.15); border: 0.5px solid rgba(0,45,114,0.25); }

            .about-offerings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
            .about-offering, .about-offering-card {
                position: relative; padding: 28px 24px; border-radius: 16px; background: #F8FAFC;
                border: 0.5px solid rgba(0,45,114,0.12); text-align: left; transition: all 0.3s ease;
            }
            .about-offering::before, .about-offering-card::before, .about-offering-btn::before {
                content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 2px; border-radius: 2px;
                background: linear-gradient(90deg, #002D72, #1A4A9E); opacity: 0.7;
            }
            .about-offering:hover, .about-offering-card:hover { border-color: rgba(0,45,114,0.35); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.25); }
            .about-offering-btn {
                position: relative; width: 100%; cursor: pointer; font-family: ${FONT_BODY};
                border: 0.5px solid rgba(0,45,114,0.12); background: #F8FAFC; border-radius: 16px;
                padding: 28px 24px; text-align: left; transition: all 0.3s ease;
            }
            .about-offering-btn:hover { border-color: rgba(0,45,114,0.38); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
            .about-offering-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-top: 8px; }
            .about-offering-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #1A4A9E; font-weight: 600; }
            .about-offering-num { font-size: 11px; color: rgba(10,31,68,0.35); font-weight: 600; }
            .about-offering h3, .about-offering-btn h3 { font-family: ${FONT_DISPLAY}; font-size: 18px; color: #0F172A; margin: 0 0 10px; font-weight: 600; }
            .about-offering p, .about-offering-btn p { margin: 0 0 14px; font-size: 14px; color: rgba(15,23,42,0.5); line-height: 1.65; }
            .about-offering ul, .about-offering-btn ul { margin: 0 0 18px; padding-left: 16px; color: rgba(15,23,42,0.45); font-size: 13px; line-height: 1.6; }
            .about-offering a, .about-offering-cta { font-size: 13px; font-weight: 600; color: #1A4A9E; text-decoration: none; }
            .about-offering a:hover, .about-offering-cta { color: #0F172A; background: none; border: none; padding: 0; }

            .about-contact-layout { display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; margin-bottom: 36px; }
            .about-contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
            .about-contact-card {
                background: #F8FAFC; border: 0.5px solid rgba(0,45,114,0.12); border-radius: 14px;
                padding: 24px 22px; text-align: left; transition: all 0.25s ease; text-decoration: none; color: inherit; display: block;
            }
            .about-contact-card:hover { border-color: rgba(0,45,114,0.35); transform: translateY(-3px); background: rgba(0,45,114,0.06); }
            .about-contact-label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #1A4A9E; margin-bottom: 10px; font-weight: 600; }
            .about-contact-card h3 { font-family: ${FONT_DISPLAY}; color: #0F172A; margin: 0 0 10px; font-size: 17px; font-weight: 600; }
            .about-contact-card p { color: rgba(15,23,42,0.55); margin: 0; font-size: 14px; line-height: 1.7; }
            .about-contact-action { display: inline-block; margin-top: 14px; font-size: 12px; font-weight: 600; color: #1A4A9E; }
            .about-contact-aside { display: flex; flex-direction: column; gap: 16px; }
            .about-contact-panel { background: #F8FAFC; border: 0.5px solid rgba(0,45,114,0.12); border-radius: 14px; padding: 24px 22px; }
            .about-contact-panel h3 { font-family: ${FONT_DISPLAY}; color: #0F172A; margin: 0 0 14px; font-size: 16px; font-weight: 600; }
            .about-contact-panel ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
            .about-contact-panel li { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: rgba(15,23,42,0.5); }
            .about-contact-panel li strong { color: rgba(15,23,42,0.78); font-weight: 600; }
            .about-contact-reviews { display: flex; justify-content: center; padding-top: 8px; }

            .about-closing { padding: clamp(56px, 8vw, 88px) 0 clamp(72px, 10vw, 104px); border-top: 0.5px solid rgba(0,45,114,0.08); }
            .about-closing-panel {
                display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 0; border-radius: 22px; overflow: hidden;
                border: 0.5px solid rgba(0,45,114,0.16); background: #F8FAFC; box-shadow: 0 32px 64px rgba(0,0,0,0.28);
            }
            .about-closing-promise { padding: clamp(32px, 5vw, 48px); text-align: left; border-right: 0.5px solid rgba(0,45,114,0.1); }
            .about-closing-promise h2 { font-family: ${FONT_DISPLAY}; font-size: clamp(26px, 4vw, 36px); font-weight: 700; color: #0F172A; line-height: 1.1; margin: 0 0 16px; }
            .about-closing-promise h2 span { color: #1A4A9E; }
            .about-closing-promise > p { font-size: 15px; color: rgba(15,23,42,0.55); line-height: 1.75; margin: 0 0 24px; max-width: 420px; }
            .about-closing-points { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
            .about-closing-points li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(15,23,42,0.55); }
            .about-closing-points li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #1A4A9E; box-shadow: 0 0 10px rgba(0,45,114,0.5); flex-shrink: 0; }
            .about-closing-action { padding: clamp(32px, 5vw, 48px); display: flex; flex-direction: column; justify-content: center; background: linear-gradient(160deg, rgba(0,45,114,0.22) 0%, rgba(241,245,249,0.4) 100%); }
            .about-closing-action h3 { font-family: ${FONT_DISPLAY}; font-size: clamp(20px, 3vw, 26px); color: #0F172A; margin: 0 0 12px; font-weight: 700; }
            .about-closing-action p { font-size: 14px; color: rgba(10,31,68,0.7); line-height: 1.7; margin: 0 0 28px; }
            .about-closing-buttons { display: flex; flex-wrap: wrap; gap: 12px; }
            .about-closing-action .about-btn--ghost { background: rgba(255,255,255,0.04); }

            .about-showcase { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 60px); align-items: center; margin-bottom: clamp(48px, 8vw, 72px); }
            .about-showcase-frame { border-radius: 22px; overflow: hidden; border: 0.5px solid rgba(0,45,114,0.2); box-shadow: 0 24px 48px rgba(0,0,0,0.35); }
            .about-showcase-frame img { width: 100%; height: 380px; object-fit: cover; display: block; }

            @media (max-width: 960px) {
                .about-hero-layout, .about-contact-layout, .about-closing-panel, .about-offerings, .about-showcase { grid-template-columns: 1fr; }
                .about-hero-collage { height: 320px; max-width: 480px; margin: 0 auto; }
                .about-closing-promise { border-right: none; border-bottom: 0.5px solid rgba(0,45,114,0.1); }
                .about-hero-stats-bar { grid-template-columns: repeat(2, 1fr); }
                .about-hero-stat:nth-child(2) { border-right: none; }
            }
            @media (max-width: 560px) {
                .about-hero { min-height: auto; }
                .about-collage-float { display: none; }
            }
            @keyframes aboutFloatA { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            @keyframes aboutFloatB { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        `}</style>
    );
}
