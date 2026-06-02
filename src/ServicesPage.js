// src/ServicesPage.jsx
import { useEffect } from 'react';
import { useInView } from './App'; // We'll export this from App

function ServicesPage() {
    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ background: "#060B1A", minHeight: "100vh", paddingTop: "100px" }}>
            {/* Hero Section */}
            <div style={{
                background: "linear-gradient(135deg, #0D1830, #060B1A)",
                padding: "80px 48px",
                textAlign: "center",
                borderBottom: "0.5px solid rgba(99,179,237,0.1)"
            }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <div style={{
                        fontSize: 11,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#38BDF8",
                        marginBottom: 16
                    }}>What We Do</div>
                    <h1 style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(40px, 5vw, 56px)",
                        color: "#fff",
                        marginBottom: 20
                    }}>
                        Our Services
                    </h1>
                    <p style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        maxWidth: 600,
                        margin: "0 auto"
                    }}>
                        Comprehensive technology solutions tailored to your business needs
                    </p>
                </div>
            </div>

            {/* Services Grid - Detailed */}
            <div style={{ padding: "80px 48px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {SERVICES.map((service, index) => (
                        <ServiceDetailCard key={service.id} service={service} index={index} />
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div style={{
                background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                margin: "40px 48px 80px",
                borderRadius: "24px",
                padding: "60px 48px",
                textAlign: "center"
            }}>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "32px",
                    color: "#fff",
                    marginBottom: "16px"
                }}>
                    Ready to Get Started?
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: "30px",
                    maxWidth: "500px",
                    margin: "0 auto 30px"
                }}>
                    Contact us today for a free consultation
                </p>
                <button style={{
                    background: "#fff",
                    color: "#2B5CE6",
                    border: "none",
                    borderRadius: "40px",
                    padding: "14px 34px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.3s ease"
                }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    Contact Sales →
                </button>
            </div>
        </div>
    );
}

// Detailed Service Card Component
function ServiceDetailCard({ service, index }) {
    const [ref, inView] = useInView();

    return (
        <div
            ref={ref}
            style={{
                display: "grid",
                gridTemplateColumns: index % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: "60px",
                marginBottom: "80px",
                alignItems: "center",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.7s ease ${index * 0.1}s`
            }}
        >
            {/* Image - Order changes based on index */}
            <div style={{ order: index % 2 === 0 ? 1 : 2 }}>
                <div style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "0.5px solid rgba(99,179,237,0.2)",
                    background: "#0D1830"
                }}>
                    <img
                        src={service.img}
                        alt={service.title}
                        style={{
                            width: "100%",
                            height: "350px",
                            objectFit: "cover",
                            transition: "transform 0.5s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ order: index % 2 === 0 ? 2 : 1 }}>
                <div style={{
                    display: "inline-block",
                    fontSize: "48px",
                    marginBottom: "16px"
                }}>
                    {service.icon}
                </div>
                <div style={{
                    display: "inline-block",
                    marginLeft: "12px",
                    padding: "4px 12px",
                    background: `rgba(${getRGBColor(service.accent)}, 0.1)`,
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: service.accent,
                    verticalAlign: "middle"
                }}>
                    {service.tag}
                </div>
                <h2 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: "32px",
                    color: "#fff",
                    margin: "20px 0 16px"
                }}>
                    {service.title}
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: "1.8",
                    marginBottom: "24px"
                }}>
                    {service.desc}
                </p>

                {/* Features List */}
                <div style={{ marginBottom: "30px" }}>
                    <h4 style={{ color: "#fff", marginBottom: "12px", fontSize: "16px" }}>Key Features:</h4>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {getFeatures(service.id).map((feature, i) => (
                            <li key={i} style={{
                                marginBottom: "8px",
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                <span style={{ color: service.accent }}>✓</span> {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <button style={{
                    background: "transparent",
                    color: service.accent,
                    border: `1px solid ${service.accent}`,
                    borderRadius: "30px",
                    padding: "10px 24px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = service.accent;
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = service.accent;
                        }}
                >
                    Request a Quote →
                </button>
            </div>
        </div>
    );
}

// Helper function to convert hex to RGB for background
function getRGBColor(hex) {
    // Remove the hash if it exists
    hex = hex.replace('#', '');

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

// Features for each service
function getFeatures(serviceId) {
    const featuresList = {
        0: [ // Cyber Security
            "24/7 Security Monitoring",
            "Penetration Testing",
            "SOC Operations",
            "Threat Detection & Response",
            "Compliance Management"
        ],
        1: [ // ICT Services
            "Network Design & Setup",
            "Cloud Migration",
            "IT Infrastructure Management",
            "24/7 Helpdesk Support",
            "Disaster Recovery"
        ],
        2: [ // Automation
            "Industrial Automation",
            "SCADA Systems",
            "Workflow Orchestration",
            "Process Control",
            "Predictive Maintenance"
        ],
        3: [ // Solar Energy
            "Commercial & Residential Installation",
            "Battery Storage Systems",
            "Smart Energy Monitoring",
            "Net Metering Setup",
            "Maintenance & Support"
        ],
        4: [ // Enterprise
            "POS Systems",
            "ERP Integration",
            "Business Intelligence",
            "Inventory Management",
            "Retail Analytics"
        ],
        5: [ // Certificate Management
            "SSL/TLS Lifecycle Management",
            "PKI Infrastructure",
            "Digital Identity",
            "Compliance Reporting",
            "Automated Renewals"
        ]
    };

    return featuresList[serviceId] || ["Consulting", "Implementation", "Support", "Training"];
}

export default ServicesPage;