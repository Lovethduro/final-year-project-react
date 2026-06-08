// src/TermsPage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';

function TermsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            width: "100%",
            background: "#060B1A",
            fontFamily: "'DM Sans', sans-serif",
            paddingTop: "100px",
            paddingBottom: "60px"
        }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
                {/* Back Button - At the top */}
                <div style={{ marginBottom: "20px" }}>
                    <Link to="/" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        background: "rgba(255,255,255,0.05)",
                        color: "#38BDF8",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.2s",
                        border: "0.5px solid rgba(56,189,248,0.2)"
                    }}
                          onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(56,189,248,0.1)";
                              e.currentTarget.style.transform = "translateX(-5px)";
                          }}
                          onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                              e.currentTarget.style.transform = "translateX(0)";
                          }}>
                        <span style={{ fontSize: "16px" }}>←</span> Back to Home
                    </Link>
                </div>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <img src={logo} alt="CyForce Technologies" style={{ height: "60px", width: "auto", marginBottom: "20px" }} />
                    </Link>
                    <h1 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "42px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "16px"
                    }}>
                        Terms of Service
                    </h1>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                        Last Updated: June 8, 2025
                    </p>
                </div>

                {/* Content Card */}
                <div style={{
                    background: "#0D1830",
                    borderRadius: "20px",
                    border: "0.5px solid rgba(99,179,237,0.1)",
                    padding: "40px",
                    marginBottom: "30px"
                }}>
                    {/* Rest of your content stays the same */}
                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            1. Acceptance of Terms
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            By accessing and using CyForce Technologies' website, products, and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            2. Description of Services
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            CyForce Technologies provides comprehensive technology solutions including:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li>Cyber Security Services</li>
                            <li>ICT Services & IT Consulting</li>
                            <li>Solar Energy Solutions</li>
                            <li>Automation & Industrial Control</li>
                            <li>Enterprise Solutions (POS, ERP)</li>
                            <li>Certificate Management</li>
                            <li>CCTV & Access Control Systems</li>
                            <li>Alarm Systems & Security Solutions</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            3. User Accounts
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            To access certain features of our services, you may be required to create an account. You are responsible for:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                            <li>Providing accurate and complete registration information</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            4. Pricing and Payments
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            All prices are displayed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to modify or discontinue any service at any time. Payments for products and services must be made in full before delivery unless otherwise agreed in writing.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            5. Delivery and Installation
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            Delivery timelines are estimated and not guaranteed. Installation services will be scheduled at a mutually agreeable time. CyForce Technologies is not responsible for delays caused by circumstances beyond our control.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            6. Warranty and Returns
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            Our products come with manufacturer warranties as specified. For returns, please contact us within 7 days of delivery. Custom installations and software services are non-refundable once work has commenced.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            7. Limitation of Liability
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            To the maximum extent permitted by law, CyForce Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            8. Intellectual Property
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            All content, trademarks, logos, and intellectual property on our website are owned by CyForce Technologies. You may not reproduce, distribute, or create derivative works without our express written permission.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            9. Governing Law
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Abuja, Nigeria.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            10. Changes to Terms
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            11. Contact Information
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            For questions about these Terms of Service, please contact us at:
                        </p>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
                            📧 legal@cyforcetech.com<br />
                            📞 +234 (0) 901 066 9297<br />
                            📍 Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TermsPage;