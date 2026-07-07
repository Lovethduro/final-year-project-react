import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, PrimaryButton, Alert, Select } from './ui';
import { customerApi, publicSupportApi } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { theme, inputStyle } from '../styles/theme';
import { refreshNotifications } from '../utils/notifications';

const CATEGORIES = [
    { value: '', label: 'Select category' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'billing', label: 'Billing / Payment' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'account', label: 'Account & Login' },
    { value: 'products', label: 'Products & Orders' },
    { value: 'installation', label: 'Installation & Service' },
];

const PRIORITIES = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const DEFAULT_SLA = [
    { priority: 'Urgent', time: '2–4 hours' },
    { priority: 'High', time: '8–12 hours' },
    { priority: 'Medium', time: '24 hours' },
    { priority: 'Low', time: '48 hours' },
];

const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
    marginBottom: 6,
};

const asideCardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: `0.5px solid ${theme.border}`,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
};

function phoneHref(phone) {
    if (!phone) return undefined;
    const digits = phone.replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : undefined;
}

function FieldLabel({ children, required }) {
    return (
        <label style={labelStyle}>
            {children}
            {required && <span style={{ color: theme.error, marginLeft: 2 }}>*</span>}
        </label>
    );
}

function ContactMethod({ icon, title, detail, href, onClick }) {
    const inner = (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{detail}</div>
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} style={{ ...asideCardStyle, display: 'block', textDecoration: 'none', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.borderHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
            >
                {inner}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} style={{
            ...asideCardStyle,
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: theme.fontBody,
        }}>
            {inner}
        </button>
    );
}

export function ContactSupportContent({ publicMode = false }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);
    const isCustomer = !publicMode && auth.role === 'CUSTOMER';
    const [supportConfig, setSupportConfig] = useState(null);
    const [form, setForm] = useState({
        name: auth.fullName || '',
        email: auth.email || '',
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
    });
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [estimatedResponse, setEstimatedResponse] = useState(null);

    useEffect(() => {
        publicSupportApi.config().then(setSupportConfig).catch(() => setSupportConfig(null));
    }, []);

    useEffect(() => {
        if (isCustomer) {
            setForm((prev) => ({
                ...prev,
                name: auth.fullName || prev.name,
                email: auth.email || prev.email,
            }));
        }
    }, [auth.fullName, auth.email, isCustomer]);

    useEffect(() => {
        const priority = form.priority || 'medium';
        publicSupportApi.estimatedResponse(priority)
            .then(setEstimatedResponse)
            .catch(() => setEstimatedResponse(null));
    }, [form.priority]);

    const responseSla = supportConfig?.responseSla
        ? [
            { priority: 'Urgent', time: supportConfig.responseSla.urgent },
            { priority: 'High', time: supportConfig.responseSla.high },
            { priority: 'Medium', time: supportConfig.responseSla.medium },
            { priority: 'Low', time: supportConfig.responseSla.low },
        ]
        : DEFAULT_SLA;

    const supportEmail = supportConfig?.supportEmail || 'support@cyforce.com';
    const supportPhone = supportConfig?.supportPhone || '+234 800 CYFORCE';
    const liveChatHours = supportConfig?.liveChatHours || 'Available 9 AM – 6 PM (WAT)';
    const helpCenterPath = publicMode ? '/help' : '/dashboard/knowledge-base';
    const ticketsPath = publicMode ? '/login' : '/customer/tickets';

    const resetForm = () => {
        setForm({
            name: isCustomer ? (auth.fullName || '') : '',
            email: isCustomer ? (auth.email || '') : '',
            subject: '',
            description: '',
            category: '',
            priority: 'medium',
        });
        setAttachment(null);
        setError('');
        setSuccess('');
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const startLiveChatRequest = () => {
        scrollToForm();
        setForm((prev) => ({
            ...prev,
            priority: 'urgent',
            category: prev.category || 'general',
            subject: prev.subject || 'Live chat request',
        }));
    };

    const submitTicket = async (e) => {
        e.preventDefault();
        if (!form.category) {
            setError('Please select a category');
            return;
        }
        if (publicMode || !isCustomer) {
            if (!form.name.trim()) {
                setError('Name is required');
                return;
            }
            if (!form.email.trim()) {
                setError('Email is required');
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                subject: form.subject.trim(),
                description: form.description.trim(),
                category: form.category,
                priority: form.priority,
            };

            if (isCustomer) {
                if (attachment) {
                    await customerApi.createTicketWithAttachment(payload, attachment);
                } else {
                    await customerApi.createTicket(payload);
                }
                refreshNotifications();
                setSuccess('Your ticket has been submitted. Our support team will respond based on your priority level.');
                setTimeout(() => navigate('/customer/tickets'), 1800);
            } else {
                const guestPayload = {
                    ...payload,
                    name: form.name.trim(),
                    email: form.email.trim(),
                };
                const result = attachment
                    ? await publicSupportApi.createTicketWithAttachment(guestPayload, attachment)
                    : await publicSupportApi.createTicket(guestPayload);
                setSuccess(result.message || 'Your ticket has been submitted. Check your email for a tracking link.');
                resetForm();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @media (max-width: 900px) {
                    .contact-support-layout { grid-template-columns: 1fr !important; }
                }
            `}</style>
            {!publicMode && (
            <div style={{ marginBottom: 28 }}>
                <h1 style={{
                    fontFamily: theme.fontHeading,
                    fontSize: 28,
                    fontWeight: 700,
                    color: theme.text,
                    margin: '0 0 8px',
                }}>
                    Contact Support
                </h1>
                <p style={{ margin: 0, fontSize: 15, color: theme.textMuted, maxWidth: 560, lineHeight: 1.6 }}>
                    Get help from our support team. We typically respond within 24 hours.
                </p>
            </div>
            )}

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div
                className="contact-support-layout"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)',
                    gap: 24,
                    alignItems: 'start',
                }}
            >
                <div ref={formRef}>
                    <Card title="Create Support Ticket">
                        <form onSubmit={submitTicket}>
                            {(publicMode || !isCustomer) && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <FieldLabel required>Your Name</FieldLabel>
                                        <input
                                            style={inputStyle}
                                            placeholder="Full name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel required>Email</FieldLabel>
                                        <input
                                            type="email"
                                            style={inputStyle}
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Subject</FieldLabel>
                                <input
                                    style={inputStyle}
                                    placeholder="Brief description of your issue"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <FieldLabel required>Category</FieldLabel>
                                    <Select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        required
                                        style={{ marginBottom: 0 }}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c.value || 'placeholder'} value={c.value} disabled={!c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel required>Priority</FieldLabel>
                                    <Select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        style={{ marginBottom: 0 }}
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {estimatedResponse && (
                                <div style={{
                                    marginBottom: 16,
                                    borderRadius: 8,
                                    border: `0.5px solid ${theme.accent}55`,
                                    background: 'rgba(56,189,248,0.08)',
                                    padding: '10px 12px',
                                    fontSize: 12,
                                    color: theme.textMuted,
                                }}>
                                    <span style={{ color: theme.text, fontWeight: 600 }}>Estimated first response:</span>{' '}
                                    <span style={{ color: theme.accent, fontWeight: 600 }}>{estimatedResponse.estimatedLabel}</span>
                                    {' · '}SLA target: {estimatedResponse.policyLabel}
                                </div>
                            )}

                            <div style={{ marginBottom: 16 }}>
                                <FieldLabel required>Description</FieldLabel>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
                                    placeholder="Please provide detailed information about your issue..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <FieldLabel>Attachments (Optional)</FieldLabel>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                    style={{ color: theme.textMuted, fontSize: 13, width: '100%' }}
                                />
                                {attachment && (
                                    <p style={{ fontSize: 12, color: theme.textDim, marginTop: 6 }}>
                                        Selected: {attachment.name}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <PrimaryButton type="submit" disabled={loading}>
                                    {loading ? 'Submitting…' : 'Submit Ticket'}
                                </PrimaryButton>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        background: 'transparent',
                                        border: `0.5px solid ${theme.border}`,
                                        color: theme.textMuted,
                                        borderRadius: 9,
                                        padding: '10px 18px',
                                        cursor: 'pointer',
                                        fontFamily: theme.fontBody,
                                        fontSize: 14,
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                <aside>
                    <h2 style={{
                        fontFamily: theme.fontHeading,
                        fontSize: 15,
                        fontWeight: 600,
                        color: theme.text,
                        margin: '0 0 12px',
                    }}>
                        Other Contact Methods
                    </h2>

                    <ContactMethod icon="✉️" title="Email" detail={supportEmail} href={`mailto:${supportEmail}`} />
                    <ContactMethod icon="📞" title="Phone" detail={supportPhone} href={phoneHref(supportPhone)} />
                    <ContactMethod icon="💬" title="Live Chat" detail={liveChatHours} onClick={startLiveChatRequest} />

                    <div style={{ ...asideCardStyle, marginTop: 20 }}>
                        <h3 style={{
                            fontFamily: theme.fontHeading,
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text,
                            margin: '0 0 6px',
                        }}>
                            Response Times
                        </h3>
                        <p style={{ fontSize: 12, color: theme.textDim, margin: '0 0 14px', lineHeight: 1.5 }}>
                            Our team is committed to helping you quickly
                        </p>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {responseSla.map((row) => (
                                <li key={row.priority} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    fontSize: 13,
                                    padding: '8px 0',
                                    borderBottom: `0.5px solid ${theme.border}`,
                                    color: theme.textMuted,
                                }}>
                                    <span style={{ color: theme.text }}>{row.priority}:</span>
                                    <span>{row.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{
                        ...asideCardStyle,
                        background: 'rgba(52,211,153,0.06)',
                        borderColor: 'rgba(52,211,153,0.2)',
                    }}>
                        <h3 style={{
                            fontFamily: theme.fontHeading,
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text,
                            margin: '0 0 6px',
                        }}>
                            Before You Submit
                        </h3>
                        <p style={{ fontSize: 13, color: theme.textMuted, margin: '0 0 14px', lineHeight: 1.5 }}>
                            Check our Help Center for instant answers
                        </p>
                        <Link
                            to={helpCenterPath}
                            style={{
                                display: 'inline-block',
                                fontSize: 14,
                                fontWeight: 500,
                                color: theme.success,
                                textDecoration: 'none',
                            }}
                        >
                            Browse Help Center →
                        </Link>
                    </div>

                    {!publicMode && isCustomer && (
                        <p style={{ fontSize: 12, color: theme.textDim, marginTop: 8, lineHeight: 1.5 }}>
                            Already submitted a ticket?{' '}
                            <Link to={ticketsPath} style={{ color: theme.accent }}>View your tickets</Link>
                        </p>
                    )}
                    {publicMode && (
                        <p style={{ fontSize: 12, color: theme.textDim, marginTop: 8, lineHeight: 1.5 }}>
                            Have an account?{' '}
                            <Link to="/login" style={{ color: theme.accent }}>Sign in to view your tickets</Link>
                        </p>
                    )}
                </aside>
            </div>
        </>
    );
}
