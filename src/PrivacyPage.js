// src/PrivacyPage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './images/CYFORCE 2-1.jpg';
import { LegalBackLink } from './components/LegalBackLink';

function PrivacyPage() {
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
                <LegalBackLink />

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
                        Privacy Policy
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
                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            1. Introduction
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            At CyForce Technologies, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            2. Information We Collect
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We may collect the following types of information:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, company name, billing address</li>
                            <li><strong>Account Information:</strong> Username, password, account preferences</li>
                            <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent on pages</li>
                            <li><strong>Transaction Information:</strong> Products purchased, service requests, payment information</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            3. How We Use Your Information
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We use the information we collect to:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li>Provide, operate, and maintain our services</li>
                            <li>Process your transactions and send confirmations</li>
                            <li>Communicate with you about your account or orders</li>
                            <li>Send you technical notices, updates, and support messages</li>
                            <li>Respond to your comments, questions, and requests</li>
                            <li>Improve our website and services</li>
                            <li>Detect and prevent fraud or security issues</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            4. Information Sharing
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li>With your consent</li>
                            <li>To comply with legal obligations</li>
                            <li>With service providers who assist our operations (payment processing, delivery)</li>
                            <li>To protect our rights, privacy, safety, or property</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            5. Data Security
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            6. Cookies and Tracking Technologies
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            7. Your Rights
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            Depending on your location, you may have the right to:
                        </p>
                        <ul style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginLeft: "20px" }}>
                            <li>Access and receive a copy of your personal data</li>
                            <li>Rectify inaccurate or incomplete information</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to or restrict processing of your data</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            8. Data Retention
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            9. Children's Privacy
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
                        </p>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            10. Changes to Privacy Policy
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "24px",
                            color: "#38BDF8",
                            marginBottom: "16px"
                        }}>
                            11. Contact Us
                        </h2>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6", marginBottom: "16px" }}>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
                            📧 privacy@cyforcetech.com<br />
                            📞 +234 (0) 901 066 9297<br />
                            📍 Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPage;