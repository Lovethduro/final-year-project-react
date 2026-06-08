import { useState, useEffect, useRef } from "react";
import sbImg from './images/s&b.jpg'
import certi from './images/certificate.jpg'
import cli1 from './images/client1.jpg'
import cli2 from './images/client2.png'
import cli3 from './images/client3.png'
import cli4 from './images/client4.png'
import cli5 from './images/client5.jpg'
import crt from './images/ctr.jpg'
import cyber from './images/CyberSec.jpg'
import ict from './images/IctServices.jpg'
import solar from './images/solar.jpg'
import part1 from './images/partner1.png'
import part2 from './images/partner2.jpg'
import part3 from './images/partner3.png'
import part4 from './images/partner4.png'
import part5 from './images/partner5.png'
import part6 from './images/partner6.jpg'
import logo from './images/CYFORCE 2-1.jpg'
import GoogleStarsBadge from './GoogleStarsBadge';
import AIChatbot from './AIChatbot';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ServicesPage from './ServicesPage';
import AboutPage from './AboutPage';
import ProductsPage from './ProductsPage';
import LoginPage from './LoginPage';
import RegisterPage from "./RegisterPage";
import EmailVerificationPage from './EmailVerificationPage';
import MFASetupPage from './MFASetupPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';




// ─── SERVICES DATA ───────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 0,
    title: "Cyber Security Services",
    short: "CyberSec",
    icon: "🛡️",
    accent: "#38BDF8",
    tag: "Security",
    desc: "Advanced threat detection, penetration testing, SOC monitoring, and end-to-end security architecture for enterprises and SMEs.",
    img: cyber,
  },
  {
    id: 1,
    title: "ICT Services",
    short: "ICT",
    icon: "💻",
    accent: "#34D399",
    tag: "Technology",
    desc: "Network design, IT infrastructure setup, cloud migration, helpdesk support, and managed IT services tailored to your scale.",
    img: ict,
  },
  {
    id: 2,
    title: "CTR Automation",
    short: "Automation",
    icon: "⚙️",
    accent: "#FBBF24",
    tag: "Automation",
    desc: "Industrial automation, workflow orchestration, SCADA systems, and intelligent process control for modern operations.",
    img: crt,
  },
  {
    id: 3,
    title: "Solar Energy Solutions",
    short: "Solar",
    icon: "☀️",
    accent: "#F97316",
    tag: "Renewable Energy",
    desc: "Commercial and residential solar installation, energy storage systems, net metering, and smart energy monitoring platforms.",
    img: solar,
  },
  {
    id: 4,
    title: "S & B Enterprise Solutions",
    short: "Enterprise",
    icon: "🏢",
    accent: "#A78BFA",
    tag: "Enterprise",
    desc: "End-to-end POS systems, ERP integration, business intelligence dashboards, and retail technology for growing businesses.",
    img: sbImg,
  },
  {
    id: 5,
    title: "Certificate Management",
    short: "Certificates",
    icon: "📜",
    accent: "#F472B6",
    tag: "Compliance",
    desc: "SSL/TLS lifecycle management, PKI infrastructure, digital identity provisioning, and compliance reporting automation.",
    img: certi,
  },
];

const STATS = [
  { value: "500+", label: "Installations" },
  { value: "99.8%", label: "Uptime SLA" },
  { value: "12+", label: "Years Experience" },
  { value: "30+", label: "Cities Served" },
];

const PARTNER_SLOTS =[
    { id: 0, name: "Felicitysolar", logo: part1},
    { id: 1, name: "Amaron Quanta", logo: part2},
    { id: 2, name: "HikVision", logo: part3},
    { id: 3, name: "Cisco", logo: part4},
    { id: 4, name: "Microsoft", logo: part5},
    { id: 5, name: "ATBTech", logo: part6},
];
// Import your client images at the top (you already have them imported)
// cli1, cli2, cli3, cli4, cli5 - but you need 8 clients
// If you only have 5 client images, you can reuse them or add more imports

const CLIENT_SLOTS = [
  { id: 0, name: "Stallion Luxury Suites", logo: cli1, alt: "Client 1 logo" },
  { id: 1, name: "Bethel Hotel and Suite", logo: cli2, alt: "Client 2 logo" },
  { id: 2, name: "Nigerian National Petroleum Corporation", logo: cli3, alt: "Client 3 logo" },
  { id: 3, name: "Federal Ministry of Education", logo: cli4, alt: "Client 4 logo" },
  { id: 4, name: "Federal University Wuraki", logo: cli5, alt: "Client 5 logo" },
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
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff",
            }}>CF</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
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
                  fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
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
                  <a href="#" style={{ fontSize: 12, color: "#38BDF8", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>Forgot password?</a>
                </div>
            )}
            <button style={{
              marginTop: 6, background: "#2B5CE6", color: "#fff", border: "none",
              borderRadius: 9, padding: "13px", fontSize: 15, fontFamily: "'DM Sans',sans-serif",
              fontWeight: 500, cursor: "pointer", boxShadow: "0 0 24px rgba(43,92,230,0.4)",
              transition: "all 0.2s",
            }}
                    onMouseEnter={e => e.currentTarget.style.background = "#3b6ef0"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2B5CE6"}
            >{tab === "login" ? "Log In →" : "Create Account →"}</button>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
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
const labelStyle = { display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", marginBottom: 6 };
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(99,179,237,0.2)",
  borderRadius: 9, padding: "11px 14px", fontSize: 14, color: "#fff",
  fontFamily: "'DM Sans',sans-serif", outline: "none",
  transition: "border-color 0.2s",
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function NavBar({ scrolled, onAuth }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: scrolled ? "12px 24px" : "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(6,11,26,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "0.5px solid rgba(99,179,237,0.12)" : "none",
        transition: "all 0.3s ease",
        flexWrap: "wrap"
      }}>
        {/* Logo */}
        <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}
        >
          <img src={logo} alt="CyForce Technologies Logo" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(14px, 4vw, 16px)", color: "#fff", lineHeight: 1.1 }}>
              CyForce <span style={{ color: "#38BDF8" }}>Technologies</span>
            </div>
            <div style={{ fontSize: "clamp(8px, 2vw, 9px)", letterSpacing: "0.13em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>
              Smart Tech Solutions
            </div>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              "@media (max-width: 768px)": { display: "block" }
            }}
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div style={{
          display: "flex",
          gap: 30,
          alignItems: "center",
          flexWrap: "wrap",
          transition: "all 0.3s ease",
          "@media (max-width: 768px)": {
            display: isMobileMenuOpen ? "flex" : "none",
            flexDirection: "column",
            width: "100%",
            marginTop: "20px",
            gap: "15px"
          }
        }}>
          <Link to="/services" style={{
            color: isActive("/services") ? "#38BDF8" : "rgba(255,255,255,0.55)",
            fontSize: "clamp(12px, 3vw, 13px)",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            transition: "color 0.2s"
          }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = isActive("/services") ? "#38BDF8" : "rgba(255,255,255,0.55)"}>
            Services
          </Link>

          <Link to="/about" style={{
            color: isActive("/about") ? "#38BDF8" : "rgba(255,255,255,0.55)",
            fontSize: "clamp(12px, 3vw, 13px)",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            transition: "color 0.2s"
          }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = isActive("/about") ? "#38BDF8" : "rgba(255,255,255,0.55)"}>
            About
          </Link>

          <Link to="/products" style={{
            color: isActive("/products") ? "#38BDF8" : "rgba(255,255,255,0.55)",
            fontSize: "clamp(12px, 3vw, 13px)",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            transition: "color 0.2s"
          }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = isActive("/products") ? "#38BDF8" : "rgba(255,255,255,0.55)"}>
            Products
          </Link>

          <a href="#partners" style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "clamp(12px, 3vw, 13px)",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            transition: "color 0.2s"
          }}
             onMouseEnter={e => e.target.style.color = "#fff"}
             onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
            Partners
          </a>

          <a href="#contact" style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "clamp(12px, 3vw, 13px)",
            textDecoration: "none",
            fontFamily: "'DM Sans',sans-serif",
            transition: "color 0.2s"
          }}
             onMouseEnter={e => e.target.style.color = "#fff"}
             onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
            Contact
          </a>

          <Link to="/login" style={{
            background: "transparent",
            color: "rgba(255,255,255,0.7)",
            border: "0.5px solid rgba(255,255,255,0.2)",
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: "'DM Sans',sans-serif",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}>
            Log In
          </Link>

          <Link to="/register" style={{
            background: "#2B5CE6",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "8px 20px",
            fontSize: "clamp(12px, 3vw, 13px)",
            fontFamily: "'DM Sans',sans-serif",
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
function HeroSection({ onAuth }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  return (
      <section style={{ position: "relative", minHeight: "100vh", background: "#060B1A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&fit=crop)",
          backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15,
        }} />
        <AnimatedCanvas />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 clamp(16px, 5vw, 24px)", maxWidth: "min(800px, 90%)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "0.5px solid rgba(99,179,237,0.3)", borderRadius: 24,
            padding: "5px 16px", marginBottom: 26,
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.7s ease 0.1s",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 8px #38BDF8", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "clamp(10px, 3vw, 11px)", letterSpacing: "0.12em", color: "#63B3ED", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Abuja's Premier Technology Partner</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <GoogleStarsBadge />
          </div>

          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: "clamp(32px, 6vw, 70px)", color: "#fff", lineHeight: 1.06, margin: "0 0 8px",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px)",
            transition: "all 0.8s ease 0.25s",
          }}>
            Your Partner in<br /><Typewriter words={["Cyber Security", "ICT Services", "Solar Energy", "Automation", "Enterprise Tech", "Digital Growth"]} />
          </h1>

          <p style={{
            fontSize: "clamp(14px, 4vw, 16px)", color: "rgba(255,255,255,0.48)", lineHeight: 1.75, maxWidth: "min(540px, 90%)", margin: "20px auto 38px",
            fontFamily: "'DM Sans',sans-serif",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.8s ease 0.42s",
          }}>
            CyForce Technologies delivers cutting-edge security, smart energy, automation, and enterprise solutions — engineered for today, built for tomorrow.
          </p>

          <div style={{
            display: "flex", gap: "clamp(10px, 3vw, 12px)", justifyContent: "center", flexWrap: "wrap",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
            transition: "all 0.8s ease 0.56s",
          }}>
            <button style={{
              background: "#2B5CE6", color: "#fff", border: "none", borderRadius: 9,
              padding: "clamp(10px, 3vw, 14px) clamp(20px, 5vw, 34px)",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
              cursor: "pointer", boxShadow: "0 0 28px rgba(43,92,230,0.45)", transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#3b6ef0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#2B5CE6"; e.currentTarget.style.transform = "none"; }}
            >Explore Services →</button>
            <button onClick={() => onAuth("signup")} style={{
              background: "transparent", color: "rgba(255,255,255,0.72)",
              border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 9,
              padding: "clamp(10px, 3vw, 14px) clamp(18px, 4vw, 30px)",
              fontSize: "clamp(13px, 3.5vw, 15px)",
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.45)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
            >Get Started Free</button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 64,
            borderTop: "0.5px solid rgba(99,179,237,0.1)", paddingTop: 36,
            opacity: vis ? 1 : 0, transition: "all 0.8s ease 0.78s",
            gap: "clamp(16px, 4vw, 0)"
          }}>
            {STATS.map((s, i) => (
                <div key={s.label} style={{
                  textAlign: "center", padding: "0 clamp(16px, 4vw, 32px)",
                  borderRight: i < STATS.length - 1 ? "0.5px solid rgba(99,179,237,0.1)" : "none",
                  "@media (max-width: 600px)": { borderRight: "none" }
                }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(22px, 5vw, 26px)", color: "#fff" }}>{s.value}</div>
                  <div style={{ fontSize: "clamp(10px, 2.5vw, 11px)", color: "rgba(255,255,255,0.35)", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
                </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          opacity: vis ? 0.6 : 0, transition: "opacity 1s ease 1.3s",
        }}>
          <span style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom,rgba(99,179,237,0.5),transparent)", animation: "scrollDrop 1.9s ease-in-out infinite" }} />
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
            letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif",
          }}>{svc.tag}</div>
          {/* Icon */}
          <div style={{
            position: "absolute", top: 12, right: 14, fontSize: "clamp(18px, 4vw, 22px)",
            transform: hov ? "scale(1.2) rotate(8deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.4s ease",
          }}>{svc.icon}</div>
        </div>

        {/* Body */}
        <div style={{ padding: "clamp(16px, 4vw, 20px) clamp(16px, 4vw, 22px) clamp(20px, 5vw, 26px)" }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "clamp(16px, 3.5vw, 17px)", color: "#fff", marginBottom: 10, lineHeight: 1.25 }}>
            {svc.title}
          </h3>
          <p style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "rgba(255,255,255,0.42)", lineHeight: 1.68, fontFamily: "'DM Sans',sans-serif", marginBottom: 18 }}>
            {svc.desc}
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: "clamp(12px, 3vw, 13px)",
            color: svc.accent, fontFamily: "'DM Sans',sans-serif",
            opacity: hov ? 1 : 0.35, transform: hov ? "translateX(6px)" : "none",
            transition: "all 0.3s ease",
          }}>
            Learn more <span style={{ fontSize: 16 }}>→</span>
          </div>
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
      <section id="services" style={{ background: "#060B1A", padding: "clamp(60px, 10vw, 110px) clamp(20px, 5vw, 48px)" }}>
        <div style={{ maxWidth: "min(1180px, 100%)", margin: "0 auto" }}>
          <div ref={ref} style={{
            textAlign: "center", marginBottom: "clamp(40px, 8vw, 64px)",
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)",
            transition: "all 0.7s ease",
          }}>
            <div style={{ fontSize: "clamp(10px, 2.5vw, 11px)", letterSpacing: "0.15em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>What We Do</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(32px, 6vw, 42px)", color: "#fff", margin: "0 0 14px" }}>Our Services</h2>
            <p style={{ fontSize: "clamp(14px, 4vw, 16px)", color: "rgba(255,255,255,0.38)", fontFamily: "'DM Sans',sans-serif", maxWidth: "min(500px, 90%)", margin: "0 auto" }}>
              Six pillars of technology excellence — each delivered with precision and backed by a decade of expertise.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "clamp(16px, 3vw, 22px)"
          }}>
            {SERVICES.map((s, i) => <ServiceCard key={s.id} svc={s} index={i} />)}
          </div>
        </div>
      </section>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection() {
  const [ref, inView] = useInView();
  return (
      <section id="about" style={{ background: "#04080F", padding: "100px 48px", borderTop: "0.5px solid rgba(99,179,237,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
          <div ref={ref} style={{
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(-40px)",
            transition: "all 0.85s ease",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Who We Are</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
              Engineering the future,<br /><span style={{ color: "#38BDF8" }}>one install at a time.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif", marginBottom: 14 }}>
              CyForce Technologies has been at the intersection of clean energy, security, and enterprise technology for over a decade. We design, supply, and support world-class solutions for businesses, governments, and homeowners across Nigeria and beyond.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif", marginBottom: 32 }}>
              From solar farms to cybersecurity operations centres — our team of certified engineers is committed to solutions that reduce cost, increase efficiency, and future-proof your operations.
            </p>
            <button style={{
              background: "transparent", color: "#38BDF8",
              border: "0.5px solid rgba(56,189,248,0.35)", borderRadius: 9,
              padding: "12px 28px", fontSize: 14, fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer", transition: "all 0.2s",
            }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >Meet the team →</button>
          </div>

          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(40px)",
            transition: "all 0.85s ease 0.2s", position: "relative",
          }}>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "0.5px solid rgba(99,179,237,0.14)" }}>
              <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=900&q=80&fit=crop"
                   alt="CyForce team"
                   style={{ width: "100%", height: 380, objectFit: "cover", filter: "brightness(0.7) saturate(0.85)", display: "block" }} />
            </div>
            <div style={{
              position: "absolute", bottom: -20, left: -22,
              background: "#0D1F3C", border: "0.5px solid rgba(56,189,248,0.22)",
              borderRadius: 12, padding: "16px 22px", minWidth: 170,
              boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
            }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: "#fff" }}>7+</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>Years Experience</div>
            </div>
          </div>
        </div>
      </section>
  );
}

// ─── PARTNERS & CLIENTS ───────────────────────────────────────────────────────
function LogoSlot({ client }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(99,179,237,0.18)",
            borderRadius: 12,
            padding: "22px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            minHeight: 120,
            cursor: "default",
            transition: "all 0.25s",
        }}
             onMouseEnter={e => {
                 e.currentTarget.style.background = "rgba(43,92,230,0.07)";
                 e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)";
             }}
             onMouseLeave={e => {
                 e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                 e.currentTarget.style.borderColor = "rgba(99,179,237,0.18)";
             }}>
            <img
                src={client.logo}
                alt={client.alt}
                style={{
                    width: "auto",
                    height: "50px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    filter: "brightness(0.9)",
                    transition: "filter 0.3s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                onMouseLeave={e => e.currentTarget.style.filter = "brightness(0.9)"}
            />
            <span style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'DM Sans',sans-serif",
                letterSpacing: "0.06em",
                textAlign: "center",
                marginTop: 4
            }}>
        {client.name}
      </span>
        </div>
    );
}

function PartnersSection() {
  const [ref, inView] = useInView();
  return (
      <section id="partners" style={{ background: "#060B1A", padding: "100px 48px", borderTop: "0.5px solid rgba(99,179,237,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div ref={ref} style={{
            textAlign: "center", marginBottom: 56,
            opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)",
            transition: "all 0.7s ease",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>Ecosystem</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#fff", marginBottom: 12 }}>Partners & Clients</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif", maxWidth: 460, margin: "0 auto" }}>
              Trusted by leading organisations across sectors.
            </p>
          </div>

          {/* Technology Partners */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(99,179,237,0.12)" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>Technology Partners</span>
              <div style={{ height: 1, flex: 1, background: "rgba(99,179,237,0.12)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
              {PARTNER_SLOTS.map(partner => <LogoSlot key={partner.id} client={partner} />)}
            </div>
          </div>

          {/* Clients */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(99,179,237,0.12)" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>Our Clients</span>
              <div style={{ height: 1, flex: 1, background: "rgba(99,179,237,0.12)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14 }}>
              {CLIENT_SLOTS.map(client => <LogoSlot key={client.id} client={client} />)}
            </div>
          </div>
        </div>
      </section>
  );
}

// ─── CTA SECTION ──────────────────────────────────────────────────────────────
function CTASection({ onAuth }) {
  const [ref, inView] = useInView();
  return (
      <section style={{ position: "relative", padding: "120px 48px", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80&fit=crop)",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.15) saturate(0.5)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(4,8,15,0.97) 0%,rgba(4,8,15,0.65) 100%)" }} />
        <div ref={ref} style={{
          position: "relative", zIndex: 2, maxWidth: 620,
          opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)",
          transition: "all 0.75s ease",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Get Started</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 44, color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>
            Ready to power up<br />your <span style={{ color: "#38BDF8" }}>business?</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", marginBottom: 36, lineHeight: 1.75, maxWidth: 480 }}>
            From solar installs to cybersecurity audits — CyForce is your partner from the first consultation to full commissioning.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => onAuth("signup")} style={{
              background: "#2B5CE6", color: "#fff", border: "none", borderRadius: 9,
              padding: "14px 34px", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
              cursor: "pointer", boxShadow: "0 0 40px rgba(43,92,230,0.5)", transition: "all 0.2s",
            }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >Create Free Account →</button>
            <button style={{
              background: "transparent", color: "rgba(255,255,255,0.65)",
              border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 9,
              padding: "14px 28px", fontSize: 15, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
            }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
            >Contact Sales</button>
          </div>
        </div>
      </section>
  );
}

function ContactSection() {
  const [ref, inView] = useInView();

  return (
      <section id="contact" style={{ background: "#060B1A", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div ref={ref} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(30px)",
            transition: "all 0.7s ease"
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 12 }}>
              Get In Touch
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#fff", marginBottom: 40 }}>
              Contact Us
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 30
            }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 15 }}>📍</div>
                <h3 style={{ color: "#fff", marginBottom: 10 }}>Visit Us</h3>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>
                  Broadway Mall, No3 Yisa Braimoh Street<br />Kaura-District, Abuja-FCT
                </p>
              </div>
              <div>
                <div style={{ fontSize: 32, marginBottom: 15 }}>📞</div>
                <h3 style={{ color: "#fff", marginBottom: 10 }}>Call Us</h3>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>+234 (0) 901 066 9297</p>
              </div>
              <div>
                <div style={{ fontSize: 32, marginBottom: 15 }}>✉️</div>
                <h3 style={{ color: "#fff", marginBottom: 10 }}>Email Us</h3>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>info@cyforcetech.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
      <footer style={{ background: "#020508", borderTop: "0.5px solid rgba(99,179,237,0.08)", padding: "60px 48px 30px" }}>
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
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
                CyForce <span style={{ color: "#38BDF8" }}>Technologies</span>
              </span>
              </div>
              <p style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.6,
                fontFamily: "'DM Sans',sans-serif",
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
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                color: "#fff",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <a
                      href="#partners"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={e => e.target.style.color = "#38BDF8"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                  >
                    Partners
                  </a>
                </li>
                <li style={{ marginBottom: 12 }}>
                  <a
                      href="#contact"
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "'DM Sans',sans-serif",
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
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                color: "#fff",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                color: "#fff",
                marginBottom: 20,
                letterSpacing: "0.05em"
              }}>Contact Us</h4>
              <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", marginBottom: 5 }}>
                  📍 Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", marginBottom: 5 }}>
                  📞 +234 (0) 901 066 9297
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif" }}>
                  ✉️ info@cyforcetech.com
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Copyright */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            paddingTop: 30,
            borderTop: "0.5px solid rgba(99,179,237,0.08)"
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>
              © {new Date().getFullYear()} CyForce Technologies Ltd. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>
                Privacy Policy
              </a>
              <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>

      </footer>
  );
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
      <Router>
        <>
          <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#060B1A;overflow-x:hidden;}
  
  /* Responsive Styles */
  @media (max-width: 1024px) {
    .container { padding-left: 24px; padding-right: 24px; }
  }
  
  @media (max-width: 768px) {
    body { font-size: 14px; }
  }
  
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes pulse{0%,100%{box-shadow:0 0 8px #38BDF8;opacity:1}50%{box-shadow:0 0 18px #38BDF8;opacity:0.55}}
  @keyframes scrollDrop{
    0%{transform:scaleY(0);transform-origin:top}
    50%{transform:scaleY(1);transform-origin:top}
    51%{transform:scaleY(1);transform-origin:bottom}
    100%{transform:scaleY(0);transform-origin:bottom}
  }
  @keyframes kenBurnsA{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(-1%,-1%)}}
  @keyframes kenBurnsB{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(1%,1%)}}
  @keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:none}}
  input:focus{border-color:rgba(56,189,248,0.5)!important;outline:none!important;}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:#04080F}
  ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
`}</style>

          {auth && <AuthModal mode={auth} onClose={() => setAuth(null)} />}
          <NavBar scrolled={scrolled} onAuth={setAuth} />

          <Routes>
            <Route path="/" element={
              <>
                <HeroSection onAuth={setAuth} />
                <ServicesSection />
                <AboutSection />
                <PartnersSection />
                <CTASection onAuth={setAuth} />
                <ContactSection />
              </>
            } />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/mfa-setup" element={<MFASetupPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>

          <Footer />
          <AIChatbot />
        </>
      </Router>
  );


}