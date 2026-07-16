import { useState, useEffect, useRef, Suspense } from "react";
import sbImg from './images/s&b.jpg'
import certi from './images/certificate.jpg'
import crt from './images/ctr.jpg'
import cyber from './images/CyberSec.jpg'
import ict from './images/IctServices.jpg'
import solar from './images/solar.jpg'
import logo from './images/CYFORCE 2-1.jpg'
import ScrollToTop from './components/ScrollToTop';
import AIChatbot from './AIChatbot';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ServicesPage from './ServicesPage';
import AboutPage from './AboutPage';
import ProductsPage from './ProductsPage';
import LoginPage from './LoginPage';
import RegisterPage from "./RegisterPage";
import CompleteProfilePage from './CompleteProfilePage';
import EmailVerificationPage from './EmailVerificationPage';
import MFASetupPage from './MFASetupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import ChangePasswordPage from './ChangePasswordPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardShell from './components/DashboardShell';
import DashboardPageLoader from './components/DashboardPageLoader';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { clearChunkReloadFlag } from './utils/lazyWithRetry';
import {
    AdminDashboard,
    CustomersPage,
    TicketsPage,
    SalesPage,
    LeadsPage,
    AnalyticsPage,
    FeedbackPage,
    PerformancePage,
    StaffShopPage,
    KnowledgeBasePage,
    UserManagementPage,
    RolePermissionsPage,
    BillingPage,
    ComplianceReportsPage,
    DataManagementPage,
    SecurityAuditPage,
    SystemConfigPage,
    SystemHealthPage,
    ProfilePage,
    ProductsManagementPage,
    HotDealsManagementPage,
    HotDealsPage,
    CustomerDashboard,
    CustomerProductsPage,
    CustomerTicketsPage,
    ContactSupportPage,
    CustomerMessagesPage,
    SalesPlaybookPage,
    SalesMessagesPage,
    ConversationMonitorPage,
    CalendarPage,
    LeavePage,
    BroadcastPage,
    ApprovalsPage,
    SalesAgentDashboard,
    SalesInsightsPage,
    SupportAgentDashboard,
    SupervisorDashboard,
} from './lazyDashboardPages';
import { HotDealsStrip } from './components/HotDealsStrip';
import { QuoteRequestSection } from './components/QuoteRequestSection';
import { contentApi, productApi } from './utils/apiClient';
import { Menu, X, ArrowRight } from 'lucide-react';
import PaymentCallbackPage from './PaymentCallbackPage';
import PurchaseSurveyPage from './PurchaseSurveyPage';
import QuotePortalPage from './QuotePortalPage';
import PublicSupportPage from './PublicSupportPage';
import SupportPortalPage from './SupportPortalPage';
import PublicHelpPage from './PublicHelpPage';
import { getSession } from './utils/apiClient';
import { theme } from './styles/theme';
import { getDashboardPath } from './utils/authFlow';

function DashboardRedirect() {
  const session = getSession();
  return <Navigate to={getDashboardPath(session.role)} replace />;
}




// ─── SERVICES DATA ───────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 0,
    title: "Cyber Security Services",
    short: "CyberSec",
    accent: "#002D72",
    tag: "Security",
    desc: "Advanced threat detection, penetration testing, SOC monitoring, and end-to-end security architecture for enterprises and SMEs.",
    img: cyber,
  },
  {
    id: 1,
    title: "ICT Services",
    short: "ICT",
    accent: "#1A4A9E",
    tag: "Technology",
    desc: "Network design, IT infrastructure setup, cloud migration, helpdesk support, and managed IT services tailored to your scale.",
    img: ict,
  },
  {
    id: 2,
    title: "CTR Automation",
    short: "Automation",
    accent: "#003B8E",
    tag: "Automation",
    desc: "Industrial automation, workflow orchestration, SCADA systems, and intelligent process control for modern operations.",
    img: crt,
  },
  {
    id: 3,
    title: "Solar Energy Solutions",
    short: "Solar",
    accent: "#002D72",
    tag: "Renewable Energy",
    desc: "Commercial and residential solar installation, energy storage systems, net metering, and smart energy monitoring platforms.",
    img: solar,
  },
  {
    id: 4,
    title: "S & B Enterprise Solutions",
    short: "Enterprise",
    accent: "#1A4A9E",
    tag: "Enterprise",
    desc: "End-to-end POS systems, ERP integration, business intelligence dashboards, and retail technology for growing businesses.",
    img: sbImg,
  },
  {
    id: 5,
    title: "Certificate Management",
    short: "Certificates",
    accent: "#003B8E",
    tag: "Compliance",
    desc: "SSL/TLS lifecycle management, PKI infrastructure, digital identity provisioning, and compliance reporting automation.",
    img: certi,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setInView(true); },
        { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export { useInView };

const FONT_HERO_SANS = "'Montserrat', 'Plus Jakarta Sans', system-ui, sans-serif";
const FONT_HERO_SERIF = "'Lora', Georgia, 'Times New Roman', serif";

const navLinkStyle = {
  fontSize: 13,
  textDecoration: "none",
  fontFamily: FONT_HERO_SANS,
  fontWeight: 500,
  transition: "color 0.2s",
};

function HomeSectionLink({ hash, children, onClick, style = {} }) {
  return (
    <Link
      to={{ pathname: '/', hash }}
      onClick={onClick}
      style={{ ...navLinkStyle, color: theme.primary, ...style }}
      onMouseEnter={e => { e.currentTarget.style.color = theme.accent; }}
      onMouseLeave={e => { e.currentTarget.style.color = theme.primary; }}
    >
      {children}
    </Link>
  );
}

const landingCtaLinkStyle = {
  background: theme.primary,
  color: "#FFFFFF",
  border: "none",
  borderRadius: 28,
  padding: "13px 28px",
  fontSize: 13,
  fontFamily: FONT_HERO_SANS,
  fontWeight: 600,
  letterSpacing: "0.04em",
  cursor: "pointer",
  transition: "background 0.2s, transform 0.2s",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

function LandingCtaLink({ to, children }) {
  return (
    <Link
      to={to}
      style={landingCtaLinkStyle}
      onMouseEnter={e => {
        e.currentTarget.style.background = theme.accent;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = theme.primary;
        e.currentTarget.style.transform = "none";
      }}
    >
      {children}
    </Link>
  );
}

function LandingSectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="cyforce-landing-section-header">
      {eyebrow && <div className="cyforce-landing-eyebrow">{eyebrow}</div>}
      <h2 className="cyforce-landing-title">{title}</h2>
      {subtitle && <p className="cyforce-landing-subtitle">{subtitle}</p>}
    </div>
  );
}

function normalizeHotDeals(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.deals)) return data.deals;
  return [];
}

function HotDealsLandingSection() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([contentApi.hotDeals(), productApi.list()])
      .then(([dealData, productData]) => {
        setDeals(normalizeHotDeals(dealData));
        setProducts(Array.isArray(productData) ? productData : []);
      })
      .catch(() => {
        setDeals([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !deals.length) return null;

  return (
    <section id="hot-deals" className="cyforce-landing-section cyforce-landing-section--alt">
      <div className="cyforce-landing-container">
        <LandingSectionHeader
          eyebrow="Limited Time"
          title="Special Offers"
          subtitle="Shop select products at special prices."
        />
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>Loading offers…</p>
        ) : (
          <HotDealsStrip
            deals={deals}
            products={products}
            showTitle={false}
            maxItems={2}
          />
        )}
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div className="cyforce-landing-page">
      <HeroSection />
      <ServicesSection />
      <HotDealsLandingSection />
      <QuoteRequestSection />
    </div>
  );
}



// ─── ANIMATED CANVAS ─────────────────────────────────────────────────────────
function AnimatedCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, w, h;
    let particles = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function init() {
      particles = Array.from({ length: 36 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.5, alpha: Math.random() * 0.28 + 0.08,
      }));
    }
    function drawGlow(t) {
      const cx = w * 0.55 + Math.sin(t * 0.00035) * 50;
      const cy = h * 0.42 + Math.cos(t * 0.00045) * 30;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.72);
      g.addColorStop(0, "rgba(255,255,255,0.10)");
      g.addColorStop(0.45, "rgba(26,74,158,0.18)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    function drawParticles(t) {
      particles.forEach((p, i) => {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        const pulse = Math.sin(t * 0.001 + i * 0.28) * 0.25 + 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * pulse})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 110) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });
    }
    resize();
    init();
    const onResize = () => { resize(); init(); };
    window.addEventListener("resize", onResize);
    function loop(t) {
      ctx.clearRect(0, 0, w, h);
      drawGlow(t);
      drawParticles(t);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const esc = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(255,255,255,0.82)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#F8FAFC", border: "0.5px solid rgba(0,45,114,0.2)",
          borderRadius: 18, padding: "40px 44px", width: "100%", maxWidth: 420,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg,#002D72,#1A4A9E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
            }}>CF</div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>
            CyForce <span style={{ color: "#1A4A9E" }}>Technologies</span>
          </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "rgba(15,23,42,0.04)", borderRadius: 10, padding: 4 }}>
            {["login", "signup"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer",
                  background: tab === t ? "#002D72" : "transparent",
                  color: tab === t ? "#fff" : "rgba(15,23,42,0.45)",
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500,
                  transition: "all 0.2s",
                }}>{t === "login" ? "Log In" : "Sign Up"}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tab === "signup" && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.name} onChange={set("name")} placeholder="John Doe" style={inputStyle} />
                </div>
            )}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input value={form.password} onChange={set("password")} type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            {tab === "login" && (
                <div style={{ textAlign: "right", marginTop: -8 }}>
                  <Link to="/forgot-password" style={{ fontSize: 12, color: "#1A4A9E", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>Forgot password?</Link>
                </div>
            )}
            <button style={{
              marginTop: 6, background: "#002D72", color: "#fff", border: "none",
              borderRadius: 9, padding: "13px", fontSize: 15, fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500, cursor: "pointer", boxShadow: "0 0 24px rgba(0,45,114,0.4)",
              transition: "all 0.2s",
            }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1A4A9E"}
                    onMouseLeave={e => e.currentTarget.style.background = "#002D72"}
            >{tab === "login" ? "Log In →" : "Create Account →"}</button>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {tab === "login" ? "No account? " : "Already have one? "}
            <span onClick={() => setTab(tab === "login" ? "signup" : "login")}
                  style={{ color: "#1A4A9E", cursor: "pointer" }}>
            {tab === "login" ? "Sign up" : "Log in"}
          </span>
          </p>

          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 18, background: "none", border: "none",
            color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer", lineHeight: 1,
          }}>✕</button>
        </div>
      </div>
  );
}
const labelStyle = { display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 6 };
const inputStyle = {
  width: "100%", background: "rgba(15,23,42,0.04)", border: "0.5px solid rgba(0,45,114,0.2)",
  borderRadius: 9, padding: "11px 14px", fontSize: 14, color: "#0F172A",
  fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
  transition: "border-color 0.2s",
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function NavBar({ scrolled, onAuth }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

      const isActive = (path) => location.pathname === path;

  const navPageLink = (path, label) => (
    <Link
      to={path}
      onClick={closeMenu}
      style={{
        ...navLinkStyle,
        color: isActive(path) ? theme.accent : theme.primary,
        fontWeight: isActive(path) ? 600 : 500,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = theme.accent; }}
      onMouseLeave={e => { e.currentTarget.style.color = isActive(path) ? theme.accent : theme.primary; }}
    >
      {label}
    </Link>
  );

  return (
      <nav className="cyforce-nav-bar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: scrolled ? "12px clamp(16px, 4vw, 32px)" : "14px clamp(16px, 4vw, 40px)",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderBottom: `0.5px solid ${theme.border}`,
        boxShadow: scrolled ? "0 2px 12px rgba(0,45,114,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div className="cyforce-nav-top">
        {/* Logo */}
        <Link
            to="/"
            onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}
        >
          <img src={logo} alt="CyForce Technologies Logo" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
          <div>
            <div style={{ fontFamily: FONT_HERO_SANS, fontWeight: 700, fontSize: "clamp(14px, 4vw, 16px)", color: theme.primary, lineHeight: 1.1 }}>
              CyForce Technologies
            </div>
            <div style={{ fontSize: "clamp(8px, 2vw, 9px)", letterSpacing: "0.14em", color: "rgba(10,31,68,0.55)", textTransform: "uppercase", fontFamily: FONT_HERO_SANS, fontWeight: 500 }}>
              Smart Tech Solutions
            </div>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
            type="button"
            className="cyforce-mobile-menu-btn"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
        </div>

        {/* Navigation Links */}
        <div
            className={`cyforce-nav-links${isMobileMenuOpen ? " open" : ""}`}
            style={{
              display: "flex",
              gap: "clamp(14px, 2vw, 24px)",
              alignItems: "center",
              flexWrap: "wrap",
              transition: "all 0.3s ease",
            }}
        >
          {navPageLink("/services", "Services")}
          {navPageLink("/about", "About")}
          {navPageLink("/products", "Products")}
          <HomeSectionLink hash="#quote-request" onClick={closeMenu}>Get Quote</HomeSectionLink>
          <HomeSectionLink hash="#contact" onClick={closeMenu}>Contact</HomeSectionLink>

          <Link to="/login" onClick={closeMenu} style={{
            background: "transparent",
            color: theme.primary,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            padding: "9px 18px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: theme.fontBody,
            fontWeight: 500,
            textDecoration: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.background = "rgba(0,45,114,0.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.background = "transparent";
                }}>
            Log In
          </Link>

          <Link to="/register" onClick={closeMenu} style={{
            background: theme.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 20px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: theme.fontBody,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = theme.primary; }}>
            Sign Up
          </Link>
        </div>
      </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);

  const fade = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
      <section className="cyforce-hero" style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 96,
        paddingBottom: 72,
        background: "linear-gradient(135deg, #001A44 0%, #002D72 42%, #0B3A8C 100%)",
      }}>
        <AnimatedCanvas />
        {/* Diagonal accent panel - matches cyforce.ng hero geometry */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "42%",
            zIndex: 1,
            background: "linear-gradient(160deg, #1A56C4 0%, #0D3F9A 55%, #002D72 100%)",
            clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0% 100%)",
            opacity: 0.92,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "radial-gradient(ellipse at 40% 50%, transparent 30%, rgba(0,18,46,0.45) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 clamp(20px, 5vw, 32px)",
          maxWidth: 820,
          width: "100%",
        }}>
          <p style={{
            fontFamily: FONT_HERO_SANS,
            fontWeight: 500,
            fontSize: "clamp(11px, 2vw, 13px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
            margin: "0 0 22px",
            ...fade(0.08),
          }}>
            Welcome to CyForce Technologies
          </p>

          <h1 className="cyforce-hero-title" style={{
            fontFamily: FONT_HERO_SANS,
            fontWeight: 800,
            fontSize: "clamp(28px, 5.2vw, 48px)",
            color: "#FFFFFF",
            lineHeight: 1.18,
            margin: "0 0 22px",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            ...fade(0.18),
          }}>
            Leading ICT Infrastructure<br />
            &amp; Cybersecurity Solutions
          </h1>

          <p style={{
            fontFamily: FONT_HERO_SERIF,
            fontWeight: 400,
            fontSize: "clamp(16px, 2.4vw, 20px)",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.7,
            maxWidth: 620,
            margin: "0 auto",
            ...fade(0.3),
          }}>
            Dedicated to ensuring your safety with customized security solutions that meet your unique requirements.
          </p>

          <div style={{
            display: "flex",
            gap: 28,
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 40,
            ...fade(0.44),
          }}>
            <a
              href="/#contact"
              style={{
                background: "#1A56C4",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 28,
                padding: "14px 32px",
                fontSize: 14,
                fontFamily: FONT_HERO_SANS,
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "background 0.2s ease, transform 0.2s ease",
                whiteSpace: "nowrap",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
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
              Contact US
            </a>
            <Link
              to="/register"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 0",
                fontSize: 15,
                fontFamily: FONT_HERO_SANS,
                fontWeight: 500,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              Become our Partner <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
  );
}

// ─── SERVICE CARD ─────────────────────────────────────────────────────────────
function ServiceCard({ svc, index }) {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);

  return (
      <div
          ref={ref}
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
            transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
          }}
      >
        <Link
            to="/services"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              position: "relative",
              overflow: "hidden",
              background: "#FFFFFF",
              border: `1px solid ${hov ? "rgba(0,45,114,0.28)" : "rgba(0,45,114,0.12)"}`,
              borderTop: `3px solid ${theme.primary}`,
              cursor: "pointer",
              transition: "border-color 0.25s, box-shadow 0.25s",
              boxShadow: hov ? "0 16px 40px rgba(0,45,114,0.12)" : "0 2px 10px rgba(0,45,114,0.04)",
            }}
        >
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <img
                src={svc.img}
                alt={svc.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: hov ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.6s ease",
                  filter: "saturate(0.92) contrast(1.05)",
                }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,26,68,0.15) 0%, rgba(0,26,68,0.55) 100%)",
            }}
            />
            <span style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: theme.primary,
              color: "#fff",
              padding: "5px 12px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: FONT_HERO_SANS,
            }}>
              {svc.tag}
            </span>
          </div>

          <div style={{ padding: "22px 22px 24px" }}>
            <h3 style={{
              fontFamily: FONT_HERO_SANS,
              fontWeight: 700,
              fontSize: 17,
              color: theme.primary,
              margin: "0 0 10px",
              lineHeight: 1.3,
            }}>
              {svc.title}
            </h3>
            <p style={{
              fontSize: 14,
              color: "rgba(10,31,68,0.72)",
              lineHeight: 1.7,
              fontFamily: FONT_HERO_SERIF,
              margin: "0 0 18px",
              minHeight: 72,
            }}>
              {svc.desc}
            </p>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: theme.primary,
              fontFamily: FONT_HERO_SANS,
              letterSpacing: "0.02em",
              transform: hov ? "translateX(4px)" : "none",
              transition: "transform 0.25s ease",
            }}>
              View details <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
  );
}

// ─── SERVICES SECTION ─────────────────────────────────────────────────────────
function ServicesSection() {
  const [ref, inView] = useInView();
  return (
      <section id="services" className="cyforce-landing-section">
        <div className="cyforce-landing-container">
          <div ref={ref} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(24px)",
            transition: "all 0.7s ease",
          }}>
            <LandingSectionHeader
              eyebrow="What We Do"
              title="Our Services"
              subtitle="Security, infrastructure, and automation - delivered with precision across Nigeria."
            />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: 24,
          }}>
            {SERVICES.slice(0, 3).map((s, i) => <ServiceCard key={s.id} svc={s} index={i} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <LandingCtaLink to="/services">
              View all services <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
            </LandingCtaLink>
          </div>
        </div>
      </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
      <footer id="contact" style={{ background: "#F1F5F9", borderTop: "0.5px solid rgba(0,45,114,0.08)", padding: "clamp(48px, 6vw, 60px) clamp(16px, 5vw, 48px) 30px", scrollMarginTop: 92 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Main Footer Content - 4 Columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 50
          }}>

            {/* Column 1: Company Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <img
                    src={logo}
                    alt="CyForce Technologies Logo"
                    style={{
                      height: "35px",
                      width: "auto",
                      objectFit: "contain",
                    }}
                />
                <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A" }}>
                CyForce <span style={{ color: "#1A4A9E" }}>Technologies</span>
              </span>
              </div>
              <p style={{
                fontSize: 13,
                color: "rgba(15,23,42,0.45)",
                lineHeight: 1.6,
                fontFamily: "'Inter', system-ui, sans-serif",
                marginBottom: 20
              }}>
                Delivering cutting-edge security, smart energy, automation, and enterprise solutions across Nigeria.
              </p>
              {/* Social Media Icons - Updated for all platforms */}
              {/* Social Media Icons - Properly Aligned */}
              <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                {[
                  { href: "https://www.facebook.com/cyforcenigeria", label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                  { href: "https://x.com/cyforceng", label: "X", path: "M4 4l11.7 16H20L8.3 4H4zm8.6 7.2L18.5 4H20l-6.7 8.6L20 20h-1.5l-5.2-6.8L7.5 20H4l7.4-9.6L5.5 4h1.5l5.6 7.2z" },
                  { href: "https://www.instagram.com/cyforceng", label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
                  { href: "https://www.youtube.com/@cyforceng", label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.98l5.75 3.02-5.75 3.02z" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      color: theme.primary,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(0,45,114,0.06)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.background = theme.primary;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = theme.primary;
                      e.currentTarget.style.background = "rgba(0,45,114,0.06)";
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 14,
                color: theme.text,
                marginBottom: 20,
                letterSpacing: "0.05em"
              }}>Quick Links</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/about"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to={{ pathname: '/', hash: '#quote-request' }}
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Get Quote
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <a
                      href="#contact"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div>
              <h4 style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 14,
                color: theme.text,
                marginBottom: 20,
                letterSpacing: "0.05em"
              }}>Our Services</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Cyber Security Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    ICT Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Solar Energy Solutions
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Automation & Security
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(15,23,42,0.45)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#1A4A9E"}
                      onMouseLeave={e => e.target.style.color = "rgba(15,23,42,0.45)"}
                  >
                    Certificate Management
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div>
              <h4 style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 14,
                color: theme.text,
                marginBottom: 20,
                letterSpacing: "0.05em"
              }}>Contact Us</h4>
              <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: 13, color: "rgba(15,23,42,0.45)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 5 }}>
                  Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT
                </div>
                <div style={{ fontSize: 13, color: "rgba(15,23,42,0.45)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 5 }}>
                  +234 (0) 901 066 9297
                </div>
                <div style={{ fontSize: 13, color: "rgba(15,23,42,0.45)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                  info@cyforcetech.com
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Copyright */}
          <div className="cyforce-footer-bar" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            paddingTop: 30,
            borderTop: "0.5px solid rgba(0,45,114,0.08)"
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              © {new Date().getFullYear()} CyForce Technologies Ltd. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link to="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Privacy Policy
              </Link>
              <Link to="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

      </footer>
  );
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard')
    || location.pathname.startsWith('/customer/')
    || location.pathname.startsWith('/admin/')
    || location.pathname.startsWith('/sales/')
    || location.pathname.startsWith('/support/')
    || location.pathname.startsWith('/supervisor/')
    || location.pathname.startsWith('/staff/')
    || location.pathname.startsWith('/team/')
    || location.pathname === '/profile';
  const hidePublicChrome = location.pathname === '/payment/callback'
    || location.pathname.startsWith('/survey/purchase/')
    || location.pathname === '/mfa-setup'
    || location.pathname === '/change-password'
    || location.pathname === '/verify-email'
    || location.pathname === '/complete-profile'
    || location.pathname === '/login'
    || location.pathname === '/register'
    || location.pathname === '/forgot-password'
    || location.pathname === '/reset-password';
  const [scrolled, setScrolled] = useState(false);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    clearChunkReloadFlag();
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const onLanding = location.pathname === '/';
    document.body.dataset.cyforceLanding = onLanding ? 'true' : 'false';
  }, [location.pathname]);

  return (
        <>
          <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#FFFFFF;overflow-x:hidden;font-family:'Inter',system-ui,sans-serif;}
  #quote-request, #quote-chat, #contact, #services, #hot-deals {
    scroll-margin-top: 92px;
  }
  .cyforce-landing-page { font-family: 'Inter', system-ui, sans-serif; width: 100%; overflow-x: hidden; }
  .cyforce-contact-card {
    background: rgba(15,23,42,0.03);
    border: 0.5px solid rgba(0,45,114,0.12);
    border-radius: 14px;
    padding: 24px 22px;
    text-align: left;
    transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
  }
  .cyforce-contact-card--link {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
  .cyforce-contact-card--link:hover {
    border-color: rgba(0,45,114,0.35);
    background: rgba(0,45,114,0.06);
    transform: translateY(-3px);
  }
  .cyforce-contact-action {
    display: inline-block;
    margin-top: 14px;
    font-size: 12px;
    font-weight: 600;
    color: #1A4A9E;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-contact-layout {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 20px;
    margin-bottom: 36px;
    align-items: stretch;
  }
  .cyforce-contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .cyforce-contact-aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cyforce-contact-hours,
  .cyforce-contact-quick {
    background: #F8FAFC;
    border: 0.5px solid rgba(0,45,114,0.12);
    border-radius: 14px;
    padding: 24px 22px;
  }
  .cyforce-contact-hours h3,
  .cyforce-contact-quick p {
    color: #0F172A;
    margin: 0 0 14px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 16px;
    font-weight: 600;
  }
  .cyforce-contact-hours ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cyforce-contact-hours li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(15,23,42,0.5);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-contact-hours li strong {
    color: rgba(15,23,42,0.78);
    font-weight: 600;
  }
  .cyforce-contact-quick p {
    color: rgba(15,23,42,0.55);
    font-size: 14px;
    line-height: 1.6;
    font-family: 'Inter', system-ui, sans-serif;
    margin-bottom: 12px;
  }
  .cyforce-contact-quote-link {
    font-size: 13px;
    font-weight: 600;
    color: #1A4A9E;
    text-decoration: none;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-contact-quote-link:hover { color: #0F172A; }
  @media (max-width: 900px) {
    .cyforce-contact-layout { grid-template-columns: 1fr; }
  }
  .cyforce-contact-label {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1A4A9E;
    margin-bottom: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
  }
  .cyforce-contact-card h3 {
    color: #0F172A;
    margin: 0 0 10px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 17px;
    font-weight: 600;
  }
  .cyforce-contact-card p {
    color: rgba(15,23,42,0.55);
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-landing-section {
    background: #FFFFFF;
    padding: clamp(64px, 8vw, 96px) clamp(16px, 5vw, 48px);
  }
  .cyforce-landing-section--alt { background: #F8FAFC; }
  .cyforce-landing-section--bordered { border-top: 0.5px solid rgba(0,45,114,0.07); }
  .cyforce-landing-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  .cyforce-landing-section-header {
    text-align: center;
    margin-bottom: clamp(36px, 6vw, 56px);
  }
  .cyforce-landing-eyebrow {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #002D72;
    margin-bottom: 14px;
    font-family: 'Montserrat', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 600;
  }
  .cyforce-landing-title {
    font-family: 'Montserrat', 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(26px, 4.5vw, 38px);
    color: #002D72;
    margin: 0 0 14px;
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }
  .cyforce-landing-subtitle {
    font-size: clamp(15px, 2.3vw, 18px);
    color: rgba(10,31,68,0.72);
    font-family: 'Lora', Georgia, 'Times New Roman', serif;
    font-style: italic;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .cyforce-about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px, 6vw, 72px);
    align-items: center;
  }
  .cyforce-landing-cta {
    position: relative;
    overflow: hidden;
    padding: clamp(72px, 10vw, 120px) clamp(16px, 5vw, 48px);
  }
  .cyforce-nav-bar {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .cyforce-nav-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 16px;
  }
  @media (min-width: 1024px) {
    .cyforce-nav-bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .cyforce-nav-top {
      width: auto;
      flex-shrink: 0;
    }
    .cyforce-nav-links {
      display: flex !important;
      flex: 1;
      justify-content: flex-end;
    }
    .cyforce-mobile-menu-btn { display: none !important; }
  }
  /* Responsive Styles */
  @media (max-width: 1024px) {
    .container { padding-left: 24px; padding-right: 24px; }
  }
  
  @media (max-width: 1023px) {
    body { font-size: 14px; }
    .cyforce-mobile-menu-btn { display: flex !important; flex-shrink: 0; }
    .cyforce-nav-links {
      display: none !important;
      flex-direction: column;
      align-items: stretch !important;
      width: 100%;
      margin-top: 12px;
      gap: 12px;
      padding: 12px 0 4px;
      border-top: 0.5px solid rgba(0,45,114,0.12);
    }
    .cyforce-nav-links.open { display: flex !important; }
    .cyforce-nav-links a,
    .cyforce-nav-links a:visited,
    .cyforce-nav-links a:hover { width: 100%; padding: 4px 0; }
    .cyforce-about-grid { grid-template-columns: 1fr; }
    .cyforce-about-badge {
      position: static !important;
      margin-top: 16px;
      display: inline-block;
    }
    .cyforce-about-visual { margin-bottom: 8px; }
    .cyforce-hero h1 { font-size: clamp(28px, 9vw, 44px) !important; }
    .cyforce-hero-title { word-break: break-word; }
  }
  .cyforce-mobile-menu-btn { display: none; }
  @media (max-width: 900px) {
    .cyforce-about-grid { grid-template-columns: 1fr; }
    .cyforce-about-badge {
      position: static !important;
      margin-top: 16px;
      display: inline-block;
    }
  }
  @media (max-width: 600px) {
    .cyforce-stat-item { border-right: none !important; }
    .cyforce-footer-bar {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
    }
  }
  
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes pulse{0%,100%{box-shadow:0 0 8px #1A4A9E;opacity:1}50%{box-shadow:0 0 18px #1A4A9E;opacity:0.55}}
  @keyframes kenBurnsA{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(-1%,-1%)}}
  @keyframes kenBurnsB{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(1%,1%)}}
  @keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:none}}
  input:focus{border-color:rgba(0,45,114,0.5)!important;outline:none!important;}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#F8FAFC}
  ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
`}</style>

          <ScrollToTop />
          {auth && <AuthModal mode={auth} onClose={() => setAuth(null)} />}
          {!isDashboard && !hidePublicChrome && <NavBar scrolled={scrolled} onAuth={setAuth} />}

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />
            <Route path="/survey/purchase/:token" element={<PurchaseSurveyPage />} />
            <Route path="/quote/portal/:token" element={<QuotePortalPage />} />
            <Route path="/support" element={<PublicSupportPage />} />
            <Route path="/support/portal/:token" element={<SupportPortalPage />} />
            <Route path="/help" element={<PublicHelpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/complete-profile" element={<ProtectedRoute allowProfileCompletion roles={['CUSTOMER']}><CompleteProfilePage /></ProtectedRoute>} />
            <Route path="/mfa-setup" element={<ProtectedRoute allowMfaSetup><MFASetupPage /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute allowPasswordChange allowMfaSetup><ChangePasswordPage /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route element={
                <ChunkErrorBoundary>
                    <Suspense fallback={<DashboardPageLoader />}>
                        <DashboardShell />
                    </Suspense>
                </ChunkErrorBoundary>
            }>
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/supervisor/dashboard" element={<ProtectedRoute roles={['SUPERVISOR']}><SupervisorDashboard /></ProtectedRoute>} />
            <Route path="/customer/dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/products" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerProductsPage /></ProtectedRoute>} />
            <Route path="/customer/tickets" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerTicketsPage /></ProtectedRoute>} />
            <Route path="/customer/support" element={<ProtectedRoute roles={['CUSTOMER']}><ContactSupportPage /></ProtectedRoute>} />
            <Route path="/customer/messages" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerMessagesPage /></ProtectedRoute>} />
            <Route path="/customer/hot-deals" element={<ProtectedRoute roles={['CUSTOMER']}><HotDealsPage /></ProtectedRoute>} />
            <Route path="/sales/messages" element={<ProtectedRoute roles={['SALES_AGENT', 'SUPERVISOR']}><SalesMessagesPage /></ProtectedRoute>} />
            <Route path="/dashboard/conversations" element={<ProtectedRoute roles={['ADMIN']}><ConversationMonitorPage /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT']}><CalendarPage /></ProtectedRoute>} />
            <Route path="/dashboard/leave" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT']}><LeavePage /></ProtectedRoute>} />
            <Route path="/dashboard/broadcast" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><BroadcastPage /></ProtectedRoute>} />
            <Route path="/dashboard/approvals" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><ApprovalsPage /></ProtectedRoute>} />
            <Route path="/sales/playbook" element={<ProtectedRoute roles={['SALES_AGENT', 'SUPERVISOR', 'ADMIN']}><SalesPlaybookPage /></ProtectedRoute>} />
            <Route path="/sales/dashboard" element={<ProtectedRoute roles={['SALES_AGENT']}><SalesAgentDashboard /></ProtectedRoute>} />
            <Route path="/sales/insights" element={<ProtectedRoute roles={['SALES_AGENT']}><SalesInsightsPage /></ProtectedRoute>} />
            <Route path="/support/dashboard" element={<ProtectedRoute roles={['SUPPORT_AGENT']}><SupportAgentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/customers" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT']}><CustomersPage /></ProtectedRoute>} />
            <Route path="/dashboard/tickets" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT']}><TicketsPage /></ProtectedRoute>} />
            <Route path="/dashboard/sales" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT']}><SalesPage /></ProtectedRoute>} />
            <Route path="/dashboard/leads" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT']}><LeadsPage /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/feedback" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><FeedbackPage /></ProtectedRoute>} />
            <Route path="/dashboard/performance" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><PerformancePage /></ProtectedRoute>} />
            <Route path="/dashboard/knowledge-base" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT', 'CUSTOMER']}><KnowledgeBasePage /></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><UserManagementPage /></ProtectedRoute>} />
            <Route path="/dashboard/roles" element={<ProtectedRoute roles={['ADMIN']}><RolePermissionsPage /></ProtectedRoute>} />
            <Route path="/dashboard/billing" element={<ProtectedRoute roles={['CUSTOMER', 'ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT']}><BillingPage /></ProtectedRoute>} />
            <Route path="/staff/shop" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'SALES_AGENT', 'SUPPORT_AGENT']}><StaffShopPage /></ProtectedRoute>} />
            <Route path="/dashboard/compliance" element={<ProtectedRoute roles={['ADMIN']}><ComplianceReportsPage /></ProtectedRoute>} />
            <Route path="/dashboard/data" element={<ProtectedRoute roles={['ADMIN']}><DataManagementPage /></ProtectedRoute>} />
            <Route path="/dashboard/security" element={<ProtectedRoute roles={['ADMIN']}><SecurityAuditPage /></ProtectedRoute>} />
            <Route path="/dashboard/system-config" element={<ProtectedRoute roles={['ADMIN']}><SystemConfigPage /></ProtectedRoute>} />
            <Route path="/dashboard/system-health" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><SystemHealthPage /></ProtectedRoute>} />
            <Route path="/dashboard/products" element={<ProtectedRoute roles={['ADMIN']}><ProductsManagementPage /></ProtectedRoute>} />
            <Route path="/dashboard/hot-deals" element={<ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}><HotDealsManagementPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>
          </Routes>

          {!isDashboard && !hidePublicChrome && <Footer />}
          {!isDashboard && !hidePublicChrome && <AIChatbot />}
        </>
  );
}

export default function App() {
  return (
      <Router>
        <AppShell />
      </Router>
  );
}