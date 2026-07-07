import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quoteApi, productApi } from '../utils/apiClient';
import { saveQuotePortalSession } from '../utils/quotePortalStorage';
import { QuoteGuestChat } from './QuoteGuestChat';
import { QuoteChatResume } from './QuoteChatResume';
import { QUOTE_OFFERINGS } from '../constants/quoteOfferings';
import { FONT_BODY, FONT_DISPLAY } from '../styles/landingFonts';
import { Select } from './ui';
import { PhoneWithCountryCode } from './PhoneWithCountryCode';
import {
    formatInternationalPhone,
    isValidLocalPhone,
    MAX_LOCAL_PHONE_DIGITS,
    MIN_LOCAL_PHONE_DIGITS,
} from '../utils/phoneFormat';

const MIN_QUOTE_QUANTITY = 1;
const MAX_QUOTE_QUANTITY = 999;

const EMPTY_FORM = {
    name: '',
    email: '',
    phoneCountryCode: '+234',
    phone: '',
    productId: '',
    quantity: '1',
    deliveryAddress: '',
    installationAddress: '',
    preferredInstallationDate: '',
    siteContactName: '',
    siteContactPhoneCountryCode: '+234',
    siteContactPhone: '',
    productType: '',
    existingProductDetails: '',
};

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(99,179,237,0.2)',
    borderRadius: 9,
    padding: '11px 14px',
    fontSize: 14,
    color: '#fff',
    fontFamily: FONT_BODY,
    outline: 'none',
    marginBottom: 12,
};

const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
    fontFamily: FONT_BODY,
};

function formatNaira(kobo) {
    if (kobo == null) return '';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
}

function plainAiText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/^[\s]*[-*]\s+/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function buildPayload(quoteType, form) {
    const base = {
        quoteType,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: formatInternationalPhone(form.phoneCountryCode, form.phone),
    };

    if (quoteType === 'products_only') {
        return {
            ...base,
            productId: form.productId,
            quantity: Number(form.quantity),
            deliveryAddress: form.deliveryAddress.trim(),
        };
    }

    if (quoteType === 'products_installation') {
        return {
            ...base,
            productId: form.productId,
            quantity: Number(form.quantity),
            installationAddress: form.installationAddress.trim(),
            preferredInstallationDate: form.preferredInstallationDate,
            siteContactName: form.siteContactName.trim(),
            siteContactPhone: formatInternationalPhone(form.siteContactPhoneCountryCode, form.siteContactPhone),
        };
    }

    return {
        ...base,
        productType: form.productType.trim(),
        installationAddress: form.installationAddress.trim(),
        preferredInstallationDate: form.preferredInstallationDate,
        existingProductDetails: form.existingProductDetails.trim(),
        siteContactName: form.siteContactName.trim(),
        siteContactPhone: formatInternationalPhone(form.siteContactPhoneCountryCode, form.siteContactPhone),
    };
}

function ContactFields({ form, setForm }) {
    return (
        <>
            <input style={inputStyle} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input style={inputStyle} type="email" placeholder="Email address *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <PhoneWithCountryCode
                label="Phone number"
                countryCode={form.phoneCountryCode}
                localNumber={form.phone}
                onCountryCodeChange={(code) => setForm({ ...form, phoneCountryCode: code })}
                onLocalNumberChange={(phone) => setForm({ ...form, phone })}
                placeholder="801 234 5678"
                required
                inputStyle={{ marginBottom: 0 }}
            />
        </>
    );
}

function ProductFields({ form, setForm, products, loadingProducts }) {
    return (
        <>
            <label style={labelStyle}>Product *</label>
            <Select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                required
                disabled={loadingProducts}
                style={{ marginBottom: 12 }}
            >
                <option value="">{loadingProducts ? 'Loading products…' : 'Select a product'}</option>
                {products.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name}{product.price ? ` — ${formatNaira(product.price)}` : ''}
                    </option>
                ))}
            </Select>
            <label style={labelStyle}>Quantity * (max {MAX_QUOTE_QUANTITY})</label>
            <input
                style={inputStyle}
                type="number"
                min={MIN_QUOTE_QUANTITY}
                max={MAX_QUOTE_QUANTITY}
                step="1"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (!raw) {
                        setForm({ ...form, quantity: '' });
                        return;
                    }
                    const num = Math.min(MAX_QUOTE_QUANTITY, Math.max(MIN_QUOTE_QUANTITY, parseInt(raw, 10)));
                    setForm({ ...form, quantity: String(num) });
                }}
                required
            />
        </>
    );
}

function SiteContactFields({ form, setForm }) {
    return (
        <>
            <label style={labelStyle}>Site contact person *</label>
            <input
                style={inputStyle}
                placeholder="Name of person on site"
                value={form.siteContactName}
                onChange={(e) => setForm({ ...form, siteContactName: e.target.value })}
                required
            />
            <PhoneWithCountryCode
                label="Site contact phone"
                countryCode={form.siteContactPhoneCountryCode}
                localNumber={form.siteContactPhone}
                onCountryCodeChange={(code) => setForm({ ...form, siteContactPhoneCountryCode: code })}
                onLocalNumberChange={(siteContactPhone) => setForm({ ...form, siteContactPhone })}
                placeholder="Phone for installation day"
                required
                inputStyle={{ marginBottom: 0 }}
            />
        </>
    );
}

function TypeSpecificFields({ quoteType, form, setForm, products, loadingProducts }) {
    if (quoteType === 'products_only') {
        return (
            <>
                <ProductFields form={form} setForm={setForm} products={products} loadingProducts={loadingProducts} />
                <label style={labelStyle}>Delivery address *</label>
                <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    placeholder="Full delivery address including city and landmarks"
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    required
                />
            </>
        );
    }

    if (quoteType === 'products_installation') {
        return (
            <>
                <ProductFields form={form} setForm={setForm} products={products} loadingProducts={loadingProducts} />
                <label style={labelStyle}>Installation address *</label>
                <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    placeholder="Property address where installation will take place"
                    value={form.installationAddress}
                    onChange={(e) => setForm({ ...form, installationAddress: e.target.value })}
                    required
                />
                <label style={labelStyle}>Preferred installation date *</label>
                <input
                    style={inputStyle}
                    type="date"
                    value={form.preferredInstallationDate}
                    onChange={(e) => setForm({ ...form, preferredInstallationDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
                <SiteContactFields form={form} setForm={setForm} />
            </>
        );
    }

    return (
        <>
            <label style={labelStyle}>Product type *</label>
            <input
                style={inputStyle}
                placeholder="e.g. CCTV system, solar inverter, access control"
                value={form.productType}
                onChange={(e) => setForm({ ...form, productType: e.target.value })}
                required
            />
            <label style={labelStyle}>Installation address *</label>
            <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder="Property address where installation will take place"
                value={form.installationAddress}
                onChange={(e) => setForm({ ...form, installationAddress: e.target.value })}
                required
            />
            <label style={labelStyle}>Preferred installation date *</label>
            <input
                style={inputStyle}
                type="date"
                value={form.preferredInstallationDate}
                onChange={(e) => setForm({ ...form, preferredInstallationDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
            />
            <label style={labelStyle}>Existing product details *</label>
            <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                placeholder="Brand, model, quantity, and condition of equipment you already have"
                value={form.existingProductDetails}
                onChange={(e) => setForm({ ...form, existingProductDetails: e.target.value })}
                required
            />
            <SiteContactFields form={form} setForm={setForm} />
        </>
    );
}

export function QuoteRequestSection() {
    const [activeType, setActiveType] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [portalToken, setPortalToken] = useState('');
    const [assignedAgent, setAssignedAgent] = useState('');
    const [resumeKey, setResumeKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [bundle, setBundle] = useState(null);
    const [bundleLoading, setBundleLoading] = useState(false);
    const [bundleError, setBundleError] = useState('');

    const selected = QUOTE_OFFERINGS.find((opt) => opt.id === activeType);

    useEffect(() => {
        productApi.list()
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoadingProducts(false));
    }, []);

    const closeModal = useCallback(() => {
        if (loading) return;
        setActiveType(null);
        setForm(EMPTY_FORM);
        setError('');
        setPortalToken('');
        setAssignedAgent('');
        setSuccess('');
        setBundle(null);
        setBundleError('');
    }, [loading]);

    useEffect(() => {
        if (!activeType) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) closeModal();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeType, loading, closeModal]);

    const suggestBundle = async () => {
        if (!activeType) return;
        setBundleLoading(true);
        setBundleError('');
        try {
            const data = await quoteApi.suggestBundle(buildPayload(activeType, form));
            setBundle(data);
        } catch (err) {
            setBundleError(err.message);
            setBundle(null);
        } finally {
            setBundleLoading(false);
        }
    };

    const applyBundle = () => {
        if (!bundle?.items?.length) return;
        const primary = bundle.items.find((item) => item.productId) || bundle.items[0];
        if (!primary?.productId) return;
        setForm((prev) => ({
            ...prev,
            productId: primary.productId,
            quantity: String(primary.quantity || 1),
        }));
    };

    const openModal = (type) => {
        setActiveType(type);
        setForm(EMPTY_FORM);
        setError('');
        setSuccess('');
        setPortalToken('');
        setAssignedAgent('');
        setBundle(null);
        setBundleError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidLocalPhone(form.phone)) {
            setError(`Please enter a valid phone number (${MIN_LOCAL_PHONE_DIGITS}–${MAX_LOCAL_PHONE_DIGITS} digits).`);
            return;
        }
        if (activeType !== 'products_only' && !isValidLocalPhone(form.siteContactPhone)) {
            setError(`Please enter a valid site contact phone (${MIN_LOCAL_PHONE_DIGITS}–${MAX_LOCAL_PHONE_DIGITS} digits).`);
            return;
        }
        if (activeType !== 'installation_only') {
            const qty = Number(form.quantity);
            if (!Number.isFinite(qty) || qty < MIN_QUOTE_QUANTITY || qty > MAX_QUOTE_QUANTITY) {
                setError(`Quantity must be between ${MIN_QUOTE_QUANTITY} and ${MAX_QUOTE_QUANTITY}.`);
                return;
            }
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await quoteApi.request(buildPayload(activeType, form));
            const token = data.portalToken || '';
            if (token) {
                saveQuotePortalSession({
                    token,
                    agentName: data.assignedAgent,
                });
                setPortalToken(token);
                setResumeKey((k) => k + 1);
            }
            setAssignedAgent(data.assignedAgent || '');
            setSuccess(data.message || 'Quote request sent! You can message your sales agent below.');
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="quote-request" className="quote-section">
            <div className="quote-section-inner">
                <div className="quote-section-head">
                    <span className="quote-step-label">Step 1 of 2</span>
                    <h2>Request a Free Quote</h2>
                    <p>Pick the option that fits your project. A sales agent will follow up by email and online chat — no account required.</p>
                </div>

                <div className="quote-compare">
                    {QUOTE_OFFERINGS.map((option, index) => (
                        <button
                            key={option.id}
                            type="button"
                            className="quote-compare-card"
                            onClick={() => openModal(option.id)}
                        >
                            <div className="quote-compare-step">{index + 1}</div>
                            <div className="quote-compare-body">
                                <span className="quote-compare-tag">{option.tag}</span>
                                <h3>{option.title}</h3>
                                <p>{option.description}</p>
                                <ul>
                                    {option.highlights.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <span className="quote-compare-action">Select &amp; fill form &rarr;</span>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="quote-section-foot">
                    Prefer to talk first? <Link to={{ pathname: '/', hash: '#contact' }}>Contact our Abuja office</Link> or call +234 (0) 901 066 9297.
                </p>

                <QuoteChatResume key={resumeKey} />
            </div>

            {activeType && selected && (
                <div role="dialog" aria-modal="true" className="quote-modal-overlay" onClick={closeModal}>
                    <div className={`quote-modal${portalToken ? ' quote-modal--chat' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="quote-modal-header">
                            <div>
                                <span className="quote-compare-tag">{selected.tag}</span>
                                <h3 style={{ fontFamily: FONT_DISPLAY, color: '#fff', fontSize: 22, margin: '8px 0 6px' }}>{selected.title}</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.48)', fontSize: 13 }}>No login needed — we will email or call you back.</p>
                            </div>
                            <button type="button" onClick={closeModal} disabled={loading} aria-label="Close" className="quote-modal-close">×</button>
                        </div>

                        {success ? (
                            <div>
                                <div style={{
                                    padding: 16, borderRadius: 10, background: 'rgba(52,211,153,0.12)',
                                    border: '0.5px solid rgba(52,211,153,0.35)', color: '#34D399', fontSize: 14,
                                    marginBottom: portalToken ? 16 : 0,
                                }}>
                                    {success}
                                    {assignedAgent && !portalToken && (
                                        <span> {assignedAgent} will follow up shortly.</span>
                                    )}
                                </div>
                                {portalToken && (
                                    <>
                                        <p style={{ ...labelStyle, marginBottom: 12, color: 'rgba(255,255,255,0.5)' }}>
                                            Step 2 — message {assignedAgent || 'your sales agent'} (saved on this device)
                                        </p>
                                        <QuoteGuestChat
                                            token={portalToken}
                                            compact
                                            onInvalidToken={() => setPortalToken('')}
                                        />
                                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 12, marginBottom: 0 }}>
                                            You can close this and return anytime from the chat section below. We also emailed you a backup link.
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p style={{ ...labelStyle, marginBottom: 14, color: 'rgba(255,255,255,0.45)' }}>Your contact details</p>
                                <ContactFields form={form} setForm={setForm} />
                                <p style={{ ...labelStyle, marginBottom: 14, marginTop: 4, color: 'rgba(255,255,255,0.45)' }}>Request details</p>
                                <TypeSpecificFields quoteType={activeType} form={form} setForm={setForm} products={products} loadingProducts={loadingProducts} />
                                <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, border: '0.5px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: bundle ? 12 : 0 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#C4B5FD' }}>Bundle assistant</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                                                Get a suggested product bundle based on your request
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={suggestBundle}
                                            disabled={bundleLoading}
                                            style={{
                                                fontSize: 12,
                                                padding: '8px 14px',
                                                borderRadius: 8,
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #7C3AED, #2B5CE6)',
                                                color: '#fff',
                                                cursor: bundleLoading ? 'not-allowed' : 'pointer',
                                                opacity: bundleLoading ? 0.7 : 1,
                                            }}
                                        >
                                            {bundleLoading ? 'Thinking…' : 'Suggest bundle'}
                                        </button>
                                    </div>
                                    {bundleError && <p style={{ color: '#F87171', fontSize: 12, margin: '0 0 8px' }}>{bundleError}</p>}
                                    {bundle && (
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                                            {bundle.summary && <p style={{ margin: '0 0 10px', lineHeight: 1.55 }}>{plainAiText(bundle.summary)}</p>}
                                            {bundle.installNote && (
                                                <p style={{ margin: '0 0 10px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{bundle.installNote}</p>
                                            )}
                                            <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
                                                {(bundle.items || []).map((item) => (
                                                    <li key={item.productId || item.name} style={{ marginBottom: 4 }}>
                                                        {item.quantity}× {item.name}
                                                        {item.lineTotal ? ` — ${item.lineTotal}` : ''}
                                                        {item.reason ? <span style={{ color: 'rgba(255,255,255,0.4)' }}> ({item.reason})</span> : null}
                                                    </li>
                                                ))}
                                            </ul>
                                            {bundle.estimatedTotal && (
                                                <div style={{ fontWeight: 600, color: '#34D399', marginBottom: 10 }}>
                                                    Est. total: {bundle.estimatedTotal}
                                                    {!bundle.aiEnabled && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>catalog-based</span>}
                                                </div>
                                            )}
                                            {activeType !== 'installation_only' && bundle.items?.some((i) => i.productId) && (
                                                <button
                                                    type="button"
                                                    onClick={applyBundle}
                                                    style={{
                                                        fontSize: 11,
                                                        padding: '6px 12px',
                                                        borderRadius: 6,
                                                        border: '0.5px solid rgba(167,139,250,0.35)',
                                                        background: 'transparent',
                                                        color: '#C4B5FD',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Apply primary product to form
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {error && <p style={{ color: '#F87171', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
                                <button type="submit" disabled={loading || (loadingProducts && activeType !== 'installation_only')} className="quote-submit-btn">
                                    {loading ? 'Sending…' : 'Submit Quote Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .quote-section {
                    padding: clamp(72px, 10vw, 104px) clamp(18px, 4vw, 44px);
                    background: #060B1A;
                    background-image: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(43,92,230,0.14), transparent);
                    border-top: 0.5px solid rgba(99,179,237,0.08);
                    border-bottom: 0.5px solid rgba(99,179,237,0.08);
                    font-family: ${FONT_BODY};
                }
                .quote-section-inner { max-width: 1100px; margin: 0 auto; }
                .quote-section-head { text-align: center; max-width: 560px; margin: 0 auto 40px; }
                .quote-step-label {
                    display: inline-block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
                    color: #A78BFA; font-weight: 700; margin-bottom: 12px;
                }
                .quote-section-head h2 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(28px, 4vw, 38px); color: #fff;
                    margin: 0 0 12px; font-weight: 700;
                }
                .quote-section-head p { font-size: 15px; color: rgba(255,255,255,0.48); line-height: 1.7; margin: 0; }
                .quote-compare {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 14px;
                    align-items: stretch;
                }
                .quote-compare-card {
                    display: grid;
                    grid-template-columns: 56px 1fr;
                    gap: 0;
                    text-align: left;
                    background: #0D1830;
                    border: 0.5px solid rgba(167,139,250,0.2);
                    border-radius: 14px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    font-family: ${FONT_BODY};
                }
                .quote-compare-card:hover {
                    border-color: rgba(167,139,250,0.45);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(43,92,230,0.2);
                }
                .quote-compare-step {
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(167,139,250,0.12);
                    font-family: ${FONT_DISPLAY}; font-size: 28px; font-weight: 800;
                    color: #A78BFA;
                }
                .quote-compare-body { padding: 22px 20px; }
                .quote-compare-tag {
                    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
                    color: #A78BFA; font-weight: 600;
                }
                .quote-compare-body h3 {
                    font-family: ${FONT_DISPLAY}; font-size: 17px; color: #fff;
                    margin: 10px 0 8px; font-weight: 600;
                }
                .quote-compare-body p { font-size: 13px; color: rgba(255,255,255,0.48); line-height: 1.6; margin: 0 0 12px; }
                .quote-compare-body ul { margin: 0 0 14px; padding-left: 16px; font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.55; }
                .quote-compare-action { font-size: 12px; font-weight: 600; color: #C4B5FD; }
                .quote-section-foot {
                    text-align: center; margin-top: 28px; font-size: 13px; color: rgba(255,255,255,0.38);
                }
                .quote-section-foot a { color: #A78BFA; font-weight: 600; text-decoration: none; }
                .quote-submit-btn {
                    width: 100%; padding: 14px; border: none; border-radius: 9px;
                    background: linear-gradient(135deg, #7C3AED, #A78BFA);
                    color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; font-family: ${FONT_BODY};
                }
                .quote-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                @media (max-width: 900px) { .quote-compare { grid-template-columns: 1fr; } }
                .quote-modal-overlay {
                    position: fixed; inset: 0; z-index: 1200; background: rgba(4,10,21,0.88);
                    backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .quote-modal {
                    background: #0D1830; border: 0.5px solid rgba(99,179,237,0.2); border-radius: 18px;
                    padding: 28px 26px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 32px 64px rgba(0,0,0,0.45);
                }
                .quote-modal--chat { max-width: 640px; }
                .quote-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; }
                .quote-modal-close { background: none; border: none; color: rgba(255,255,255,0.45); font-size: 24px; cursor: pointer; }
            `}</style>
        </section>
    );
}
