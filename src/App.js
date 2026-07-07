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
import GoogleStarsBadge from './GoogleStarsBadge';
import { contentApi, productApi } from './utils/apiClient';
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
    accent: "#38BDF8",
    tag: "Security",
    desc: "Advanced threat detection, penetration testing, SOC monitoring, and end-to-end security architecture for enterprises and SMEs.",
    img: cyber,
  },
  {
    id: 1,
    title: "ICT Services",
    short: "ICT",
    accent: "#34D399",
    tag: "Technology",
    desc: "Network design, IT infrastructure setup, cloud migration, helpdesk support, and managed IT services tailored to your scale.",
    img: ict,
  },
  {
    id: 2,
    title: "CTR Automation",
    short: "Automation",
    accent: "#FBBF24",
    tag: "Automation",
    desc: "Industrial automation, workflow orchestration, SCADA systems, and intelligent process control for modern operations.",
    img: crt,
  },
  {
    id: 3,
    title: "Solar Energy Solutions",
    short: "Solar",
    accent: "#F97316",
    tag: "Renewable Energy",
    desc: "Commercial and residential solar installation, energy storage systems, net metering, and smart energy monitoring platforms.",
    img: solar,
  },
  {
    id: 4,
    title: "S & B Enterprise Solutions",
    short: "Enterprise",
    accent: "#A78BFA",
    tag: "Enterprise",
    desc: "End-to-end POS systems, ERP integration, business intelligence dashboards, and retail technology for growing businesses.",
    img: sbImg,
  },
  {
    id: 5,
    title: "Certificate Management",
    short: "Certificates",
    accent: "#F472B6",
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
  }, []);
  return [ref, inView];
}

export { useInView };

const navLinkStyle = {
  fontSize: "clamp(12px, 3vw, 13px)",
  textDecoration: "none",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "color 0.2s",
};

function HomeSectionLink({ hash, children, onClick, style = {} }) {
  return (
    <Link
      to={{ pathname: '/', hash }}
      onClick={onClick}
      style={{ ...navLinkStyle, color: "rgba(255,255,255,0.55)", ...style }}
      onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
    >
      {children}
    </Link>
  );
}

const landingCtaLinkStyle = {
  background: "transparent",
  color: "#38BDF8",
  border: "0.5px solid rgba(56,189,248,0.35)",
  borderRadius: 9,
  padding: "12px 28px",
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  cursor: "pointer",
  transition: "all 0.2s",
  textDecoration: "none",
  display: "inline-block",
};

function LandingCtaLink({ to, children }) {
  return (
    <Link
      to={to}
      style={landingCtaLinkStyle}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.07)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
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
      <GoogleReviewsSection />
    </div>
  );
}

function GoogleReviewsSection() {
  return (
    <section className="cyforce-landing-section cyforce-landing-section--alt cyforce-landing-section--bordered">
      <div className="cyforce-landing-container">
        <div className="cyforce-landing-section-header">
          <p className="cyforce-landing-eyebrow">Client feedback</p>
          <h2 className="cyforce-landing-title">Google Reviews</h2>
          <p className="cyforce-landing-subtitle">
            See what customers say about working with CyForce Technologies.
          </p>
        </div>
        <div className="cyforce-contact-reviews">
          <GoogleStarsBadge />
        </div>
      </div>
    </section>
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
      particles = Array.from({ length: 70 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.4, alpha: Math.random() * 0.45 + 0.1,
      }));
    }
    function drawGrid(t) {
      const cw = w / 26, ch = h / 16;
      ctx.strokeStyle = "rgba(99,179,237,0.055)"; ctx.lineWidth = 1;
      for (let c = 0; c <= 26; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, h); ctx.stroke(); }
      for (let r = 0; r <= 16; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(w, r * ch); ctx.stroke(); }
      for (let c = 0; c <= 26; c += 4) for (let r = 0; r <= 16; r += 3) {
        const px = c * cw, py = r * ch;
        const d = Math.hypot(px - w / 2, py - h / 2);
        const a = (Math.sin(t * 0.0013 - d * 0.013) * 0.5 + 0.5) * 0.22;
        ctx.beginPath(); ctx.arc(px, py, 1.4, 0, 6.28);
        ctx.fillStyle = `rgba(99,179,237,${a})`; ctx.fill();
      }
    }
    function drawGlow(t) {
      const cx = w / 2 + Math.sin(t * 0.0004) * 40;
      const cy = h / 2 + Math.cos(t * 0.0006) * 25;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.6);
      g.addColorStop(0, "rgba(43,92,230,0.13)");
      g.addColorStop(0.5, "rgba(56,189,248,0.05)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    function drawParticles(t) {
      particles.forEach((p, i) => {
        p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h;
        const pulse = Math.sin(t * 0.001 + i * 0.28) * 0.3 + 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha * pulse})`; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x, dy = particles[j].y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 95) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,179,237,${(1 - d / 95) * 0.07})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
    }
    resize(); init();
    window.addEventListener("resize", () => { resize(); init(); });
    function loop(t) {
      ctx.clearRect(0, 0, w, h); drawGrid(t); drawGlow(t); drawParticles(t);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [txt, setTxt] = useState("");
  useEffect(() => {
    const cur = words[wi];
    let to;
    if (!del && ci < cur.length) to = setTimeout(() => { setTxt(cur.slice(0, ci + 1)); setCi(ci + 1); }, 75);
    else if (!del && ci === cur.length) to = setTimeout(() => setDel(true), 2000);
    else if (del && ci > 0) to = setTimeout(() => { setTxt(cur.slice(0, ci - 1)); setCi(ci - 1); }, 42);
    else if (del && ci === 0) { setDel(false); setWi((wi + 1) % words.length); }
    return () => clearTimeout(to);
  }, [ci, del, wi, words]);
  return (
      <span style={{ color: "#38BDF8" }}>
      {txt}
        <span style={{ display: "inline-block", width: 2, height: "0.88em", background: "#38BDF8", marginLeft: 3, verticalAlign: "middle", animation: "blink 1s step-end infinite" }} />
    </span>
  );
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
        background: "rgba(4,10,21,0.82)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#0D1830", border: "0.5px solid rgba(56,189,248,0.2)",
          borderRadius: 18, padding: "40px 44px", width: "100%", maxWidth: 420,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg,#2B5CE6,#38BDF8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
            }}>CF</div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
            CyForce <span style={{ color: "#38BDF8" }}>Technologies</span>
          </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 }}>
            {["login", "signup"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer",
                  background: tab === t ? "#2B5CE6" : "transparent",
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
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
                  <a href="#" style={{ fontSize: 12, color: "#38BDF8", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>Forgot password?</a>
                </div>
            )}
            <button style={{
              marginTop: 6, background: "#2B5CE6", color: "#fff", border: "none",
              borderRadius: 9, padding: "13px", fontSize: 15, fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 500, cursor: "pointer", boxShadow: "0 0 24px rgba(43,92,230,0.4)",
              transition: "all 0.2s",
            }}
                    onMouseEnter={e => e.currentTarget.style.background = "#3b6ef0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2B5CE6"}
            >{tab === "login" ? "Log In →" : "Create Account →"}</button>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {tab === "login" ? "No account? " : "Already have one? "}
            <span onClick={() => setTab(tab === "login" ? "signup" : "login")}
                  style={{ color: "#38BDF8", cursor: "pointer" }}>
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
  width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(99,179,237,0.2)",
  borderRadius: 9, padding: "11px 14px", fontSize: 14, color: "#fff",
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
        color: isActive(path) ? theme.accent : theme.textMuted,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = theme.text; }}
      onMouseLeave={e => { e.currentTarget.style.color = isActive(path) ? theme.accent : theme.textMuted; }}
    >
      {label}
    </Link>
  );

  return (
      <nav className="cyforce-nav-bar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: scrolled ? "12px clamp(16px, 4vw, 32px)" : "16px clamp(16px, 4vw, 40px)",
        background: scrolled ? "rgba(6,11,26,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `0.5px solid ${theme.border}` : "none",
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
            <div style={{ fontFamily: theme.fontHeading, fontWeight: 700, fontSize: "clamp(14px, 4vw, 16px)", color: theme.text, lineHeight: 1.1 }}>
              CyForce <span style={{ color: theme.accent }}>Technologies</span>
            </div>
            <div style={{ fontSize: "clamp(8px, 2vw, 9px)", letterSpacing: "0.13em", color: theme.textDim, textTransform: "uppercase", fontFamily: theme.fontBody }}>
              Smart Tech Solutions
            </div>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
            type="button"
            className="cyforce-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: theme.text,
              fontSize: "24px",
              cursor: "pointer",
            }}
        >
          ☰
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
            color: theme.textMuted,
            border: `0.5px solid ${theme.border}`,
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: "'Inter', system-ui, sans-serif",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = theme.borderHover;
                  e.currentTarget.style.color = theme.text;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.color = theme.textMuted;
                }}>
            Log In
          </Link>

          <Link to="/register" onClick={closeMenu} style={{
            background: "#2B5CE6",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "8px 20px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: "'Inter', system-ui, sans-serif",
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 0 16px rgba(43,92,230,0.35)",
          }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#3b6ef0";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#2B5CE6";
                  e.currentTarget.style.transform = "scale(1)";
                }}>
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
  return (
      <section className="cyforce-hero" style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 88, paddingBottom: 48 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&fit=crop)",
          backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15,
        }} />
        <AnimatedCanvas />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 clamp(16px, 5vw, 24px)", maxWidth: "min(800px, 100%)", width: "100%" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "0.5px solid rgba(99,179,237,0.3)", borderRadius: 24,
            padding: "5px 16px", marginBottom: 26,
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.1s",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 8px #38BDF8", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "clamp(10px, 3vw, 11px)", letterSpacing: "0.12em", color: "#63B3ED", textTransform: "uppercase", fontFamily: "'Inter', system-ui, sans-serif" }}>Abuja's Premier Technology Partner</span>
          </div>

          <h1 className="cyforce-hero-title" style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 70px)", color: "#fff", lineHeight: 1.06, margin: "0 0 8px",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px)",
            transition: "all 0.8s ease 0.25s",
          }}>
            Your Partner in<br /><Typewriter words={["Cyber Security", "ICT Services", "Solar Energy", "Automation", "Enterprise Tech", "Digital Growth"]} />
          </h1>

          <p style={{
            fontSize: "clamp(14px, 4vw, 16px)", color: "rgba(255,255,255,0.48)", lineHeight: 1.75, maxWidth: "min(480px, 90%)", margin: "20px auto 32px",
            fontFamily: "'Inter', system-ui, sans-serif",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.8s ease 0.42s",
          }}>
            Security, solar, automation, and enterprise systems — supplied and installed across Nigeria.
          </p>

          <div style={{
            display: "flex", gap: "clamp(10px, 3vw, 12px)", justifyContent: "center", flexWrap: "wrap",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.8s ease 0.56s",
          }}>
            <Link to="/services" style={{
              background: "#2B5CE6", color: "#fff", border: "none", borderRadius: 9,
              padding: "clamp(10px, 3vw, 14px) clamp(20px, 5vw, 34px)",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500,
              cursor: "pointer", boxShadow: "0 0 28px rgba(43,92,230,0.45)", transition: "all 0.2s",
              whiteSpace: "nowrap", textDecoration: "none", display: "inline-block",
            }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#3b6ef0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#2B5CE6"; e.currentTarget.style.transform = "none"; }}
            >Explore Services &rarr;</Link>
            <Link to="/register" style={{
              background: "transparent", color: "rgba(255,255,255,0.72)",
              border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 9,
              padding: "clamp(10px, 3vw, 14px) clamp(18px, 4vw, 30px)",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              fontFamily: "'Inter', system-ui, sans-serif", cursor: "pointer", transition: "all 0.2s",
              whiteSpace: "nowrap", textDecoration: "none", display: "inline-block",
            }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.45)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
            >Get Started Free</Link>
          </div>
        </div>
      </section>
  );
}

// ─── SERVICE CARD (with Ken Burns image animation) ────────────────────────────
function ServiceCard({ svc, index }) {
  const [ref, inView] = useInView();
  const [hov, setHov] = useState(false);

  return (
      <div
          ref={ref}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            position: "relative", borderRadius: 16, overflow: "hidden",
            border: hov ? `0.5px solid ${svc.accent}55` : "0.5px solid rgba(99,179,237,0.1)",
            background: "#0D1830", cursor: "default",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(50px) scale(0.97)",
            transition: `opacity 0.65s ease ${index * 0.1}s, transform 0.65s ease ${index * 0.1}s, border 0.3s`,
            boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${svc.accent}22` : "none",
          }}>
        {/* Animated image */}
        <div style={{ position: "relative", height: "clamp(160px, 25vw, 210px)", overflow: "hidden" }}>
          <img
              src={svc.img}
              alt={svc.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                filter: hov ? "brightness(0.6) saturate(1.1)" : "brightness(0.45) saturate(0.7)",
                transform: hov ? "scale(1.1) translateY(-4px)" : "scale(1)",
                transition: "all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
                animation: `kenBurns${index % 2 === 0 ? "A" : "B"} 8s ease-in-out infinite alternate`,
              }}
          />
          {/* Gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,#0D1830 100%)" }} />
          {/* Tag */}
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "rgba(4,10,21,0.78)", backdropFilter: "blur(10px)",
            border: `0.5px solid ${svc.accent}44`, borderRadius: 20,
            padding: "4px 12px", fontSize: "clamp(9px, 2.5vw, 10px)", color: svc.accent,
            letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: "'Inter', system-ui, sans-serif",
          }}>{svc.tag}</div>
        </div>

        {/* Body */}
        <div style={{ padding: "clamp(16px, 4vw, 20px) clamp(16px, 4vw, 22px) clamp(20px, 5vw, 26px)" }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 3.5vw, 17px)", color: "#fff", marginBottom: 10, lineHeight: 1.25 }}>
            {svc.title}
          </h3>
          <p style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "rgba(255,255,255,0.42)", lineHeight: 1.68, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 18 }}>
            {svc.desc}
          </p>
          <Link to="/services" style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: "clamp(12px, 3vw, 13px)",
            color: svc.accent, fontFamily: "'Inter', system-ui, sans-serif",
            opacity: hov ? 1 : 0.55, transform: hov ? "translateX(6px)" : "none",
            transition: "all 0.3s ease", textDecoration: "none",
          }}>
            View details <span style={{ fontSize: 14 }}>&rarr;</span>
          </Link>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(to right, ${svc.accent}00, ${svc.accent}88, ${svc.accent}00)`,
          opacity: hov ? 1 : 0, transition: "opacity 0.3s",
        }} />
      </div>
  );
}

// ─── SERVICES SECTION ─────────────────────────────────────────────────────────
function ServicesSection() {
  const [ref, inView] = useInView();
  return (
      <section id="services" className="cyforce-landing-section cyforce-landing-section--bordered">
        <div className="cyforce-landing-container">
          <div ref={ref} style={{
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)",
            transition: "all 0.7s ease",
          }}>
            <LandingSectionHeader
              eyebrow="What We Do"
              title="Our Services"
              subtitle="Core capabilities at a glance."
            />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "clamp(16px, 3vw, 22px)"
          }}>
            {SERVICES.slice(0, 3).map((s, i) => <ServiceCard key={s.id} svc={s} index={i} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <LandingCtaLink to="/services">View all services &rarr;</LandingCtaLink>
          </div>
        </div>
      </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
      <footer id="contact" style={{ background: "#020508", borderTop: "0.5px solid rgba(99,179,237,0.08)", padding: "clamp(48px, 6vw, 60px) clamp(16px, 5vw, 48px) 30px", scrollMarginTop: 92 }}>
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
                <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
                CyForce <span style={{ color: "#38BDF8" }}>Technologies</span>
              </span>
              </div>
              <p style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.6,
                fontFamily: "'Inter', system-ui, sans-serif",
                marginBottom: 20
              }}>
                Delivering cutting-edge security, smart energy, automation, and enterprise solutions across Nigeria.
              </p>
              {/* Social Media Icons - Updated for all platforms */}
              {/* Social Media Icons - Properly Aligned */}
              <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                {/* Facebook */}
                <a
                    href="https://www.facebook.com/cyforcenigeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 18,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#1877F2";
                      e.currentTarget.style.background = "rgba(24,119,242,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                >
                  <i className="fab fa-facebook-f" style={{ fontSize: "16px" }}></i>
                </a>

                {/* X (Twitter) */}
                <a
                    href="https://x.com/cyforceng"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 18,
                      fontWeight: "bold",
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#1DA1F2";
                      e.currentTarget.style.background = "rgba(29,161,242,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                >
                  𝕏
                </a>

                {/* Instagram */}
                <a
                    href="https://www.instagram.com/cyforceng"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 18,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#E4405F";
                      e.currentTarget.style.background = "rgba(228,64,95,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                >
                  <i className="fab fa-instagram" style={{ fontSize: "16px" }}></i>
                </a>

                {/* YouTube */}
                <a
                    href="https://www.youtube.com/@cyforceng"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 18,
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#FF0000";
                      e.currentTarget.style.background = "rgba(255,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                >
                  <i className="fab fa-youtube" style={{ fontSize: "16px" }}></i>
                </a>
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
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/about"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to={{ pathname: '/', hash: '#quote-request' }}
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Get Quote
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <a
                      href="#contact"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
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
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Cyber Security Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    ICT Services
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Solar Energy Solutions
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Automation & Security
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <Link
                      to="/services"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
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
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 5 }}>
                  Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 5 }}>
                  +234 (0) 901 066 9297
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', system-ui, sans-serif" }}>
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
            borderTop: "0.5px solid rgba(99,179,237,0.08)"
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              © {new Date().getFullYear()} CyForce Technologies Ltd. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Privacy Policy
              </a>
              <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Terms of Service
              </a>
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#060B1A;overflow-x:hidden;font-family:'Inter',system-ui,sans-serif;}
  #quote-request, #quote-chat, #contact, #services, #hot-deals {
    scroll-margin-top: 92px;
  }
  .cyforce-landing-page { font-family: 'Inter', system-ui, sans-serif; width: 100%; overflow-x: hidden; }
  .cyforce-contact-card {
    background: rgba(255,255,255,0.03);
    border: 0.5px solid rgba(99,179,237,0.12);
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
    border-color: rgba(56,189,248,0.35);
    background: rgba(43,92,230,0.06);
    transform: translateY(-3px);
  }
  .cyforce-contact-action {
    display: inline-block;
    margin-top: 14px;
    font-size: 12px;
    font-weight: 600;
    color: #38BDF8;
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
    background: #0D1830;
    border: 0.5px solid rgba(99,179,237,0.12);
    border-radius: 14px;
    padding: 24px 22px;
  }
  .cyforce-contact-hours h3,
  .cyforce-contact-quick p {
    color: #fff;
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
    color: rgba(255,255,255,0.48);
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-contact-hours li strong {
    color: rgba(255,255,255,0.78);
    font-weight: 600;
  }
  .cyforce-contact-quick p {
    color: rgba(255,255,255,0.52);
    font-size: 14px;
    line-height: 1.6;
    font-family: 'Inter', system-ui, sans-serif;
    margin-bottom: 12px;
  }
  .cyforce-contact-quote-link {
    font-size: 13px;
    font-weight: 600;
    color: #38BDF8;
    text-decoration: none;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-contact-quote-link:hover { color: #fff; }
  .cyforce-contact-reviews {
    display: flex;
    justify-content: center;
    padding-top: 8px;
    min-height: 140px;
    width: 100%;
  }
  @media (max-width: 900px) {
    .cyforce-contact-layout { grid-template-columns: 1fr; }
  }
  .cyforce-contact-label {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #38BDF8;
    margin-bottom: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
  }
  .cyforce-contact-card h3 {
    color: #fff;
    margin: 0 0 10px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 17px;
    font-weight: 600;
  }
  .cyforce-contact-card p {
    color: rgba(255,255,255,0.5);
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-landing-section {
    background: #060B1A;
    padding: clamp(64px, 8vw, 96px) clamp(16px, 5vw, 48px);
  }
  .cyforce-landing-section--alt { background: #04080F; }
  .cyforce-landing-section--bordered { border-top: 0.5px solid rgba(99,179,237,0.07); }
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
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #38BDF8;
    margin-bottom: 12px;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .cyforce-landing-title {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 5vw, 40px);
    color: #fff;
    margin: 0 0 12px;
  }
  .cyforce-landing-subtitle {
    font-size: clamp(14px, 2.5vw, 16px);
    color: rgba(255,255,255,0.42);
    font-family: 'Inter', system-ui, sans-serif;
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
  [data-cyforce-landing-reviews] {
    display: flex;
    justify-content: center;
    max-width: 100%;
    overflow: hidden;
  }
  
  /* Responsive Styles */
  @media (max-width: 1024px) {
    .container { padding-left: 24px; padding-right: 24px; }
  }
  
  @media (max-width: 1023px) {
    body { font-size: 14px; }
    .cyforce-mobile-menu-btn { display: block !important; flex-shrink: 0; }
    .cyforce-nav-links {
      display: none !important;
      flex-direction: column;
      align-items: stretch !important;
      width: 100%;
      margin-top: 12px;
      gap: 12px;
      padding: 12px 0 4px;
      border-top: 0.5px solid rgba(99,179,237,0.12);
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
  @keyframes pulse{0%,100%{box-shadow:0 0 8px #38BDF8;opacity:1}50%{box-shadow:0 0 18px #38BDF8;opacity:0.55}}
  @keyframes kenBurnsA{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(-1%,-1%)}}
  @keyframes kenBurnsB{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(1%,1%)}}
  @keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:none}}
  input:focus{border-color:rgba(56,189,248,0.5)!important;outline:none!important;}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#04080F}
  ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
  body[data-cyforce-landing="true"] [class*="eapps-floating"],
  body[data-cyforce-landing="true"] [class*="FloatingButton"],
  body[data-cyforce-landing="true"] div[class*="elfsight"][style*="position: fixed"],
  body[data-cyforce-landing="true"] div[class*="eapps"][style*="position: fixed"] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  body[data-cyforce-landing="false"] [data-cyforce-landing-reviews],
  body[data-cyforce-landing="false"] [class*="elfsight"],
  body[data-cyforce-landing="false"] [class*="eapps-"],
  body[data-cyforce-landing="false"] [id*="elfsight"],
  body[data-cyforce-landing="false"] iframe[src*="elfsight"],
  body[data-cyforce-landing="false"] iframe[src*="eapps"] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
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
            <Route path="/dashboard/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
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