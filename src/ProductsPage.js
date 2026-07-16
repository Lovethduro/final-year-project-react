import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCatalog } from './components/ProductCatalog';
import { FONT_BODY, FONT_DISPLAY, FONT_SERIF } from './styles/landingFonts';

function ProductsPage() {
    return (
        <div className="shop-page">
            <section className="shop-hero">
                <div className="shop-hero-diagonal" aria-hidden="true" />
                <div className="shop-hero-content">
                    <span className="shop-eyebrow">Welcome to CyForce Technologies</span>
                    <h1>Our Products</h1>
                    <p>
                        CCTV, solar, security, and enterprise equipment - ready to order, with supply and installation available nationwide.
                    </p>
                    <div className="shop-hero-actions">
                        <a href="#catalog" className="shop-btn shop-btn--primary">Browse catalog</a>
                        <Link to={{ pathname: '/', hash: '#contact' }} className="shop-btn shop-btn--ghost">
                            Become our Partner <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <div className="shop-perks">
                <div><strong>Secure checkout</strong><span>Paystack &amp; Flutterwave</span></div>
                <div><strong>Expert support</strong><span>Sales team on hand</span></div>
                <div><strong>Installation available</strong><span>Supply + install packages</span></div>
            </div>

            <section id="catalog" className="shop-catalog">
                <ProductCatalog variant="public" />
            </section>

            <section className="shop-help-band">
                <div className="shop-help-band-inner">
                    <div>
                        <h2>Not sure what to buy?</h2>
                        <p>Our sales team can recommend the right products and arrange supply or full installation.</p>
                    </div>
                    <div className="shop-help-actions">
                        <Link to={{ pathname: '/', hash: '#contact' }} className="shop-btn shop-btn--primary">
                            Contact US
                        </Link>
                        <Link to="/services" className="shop-btn shop-btn--ghost">
                            View services <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                .shop-page {
                    background: #FFFFFF;
                    min-height: 100vh;
                    padding-top: 88px;
                    font-family: ${FONT_BODY};
                }
                .shop-hero {
                    position: relative;
                    min-height: clamp(380px, 52vh, 480px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background: linear-gradient(135deg, #001A44 0%, #002D72 42%, #0B3A8C 100%);
                }
                .shop-hero-diagonal {
                    position: absolute;
                    top: 0; right: 0; bottom: 0; width: 42%;
                    background: linear-gradient(160deg, #1A56C4 0%, #0D3F9A 55%, #002D72 100%);
                    clip-path: polygon(28% 0, 100% 0, 100% 100%, 0% 100%);
                    opacity: 0.9;
                    pointer-events: none;
                }
                .shop-hero-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    max-width: 760px;
                    padding: clamp(56px, 8vw, 88px) clamp(20px, 5vw, 32px);
                }
                .shop-eyebrow {
                    display: block;
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(11px, 2vw, 13px);
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.92);
                    font-weight: 500;
                    margin-bottom: 18px;
                }
                .shop-hero h1 {
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(28px, 5.2vw, 48px);
                    font-weight: 800;
                    color: #FFFFFF;
                    margin: 0 0 18px;
                    line-height: 1.15;
                    text-transform: uppercase;
                    letter-spacing: -0.01em;
                }
                .shop-hero p {
                    font-family: ${FONT_SERIF};
                    font-style: italic;
                    font-size: clamp(16px, 2.4vw, 19px);
                    color: rgba(255,255,255,0.9);
                    line-height: 1.7;
                    margin: 0 auto 32px;
                    max-width: 560px;
                }
                .shop-hero-actions,
                .shop-help-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: center;
                    align-items: center;
                }
                .shop-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 13px 28px;
                    border-radius: 28px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    font-family: ${FONT_DISPLAY};
                    letter-spacing: 0.04em;
                }
                .shop-btn--primary {
                    background: #1A56C4;
                    color: #FFFFFF;
                    border: none;
                }
                .shop-btn--primary:hover {
                    background: #2563D4;
                    transform: translateY(-2px);
                }
                .shop-btn--ghost {
                    color: #FFFFFF;
                    border: none;
                    background: transparent;
                    padding-left: 0;
                    padding-right: 0;
                    border-radius: 0;
                    font-weight: 500;
                }
                .shop-btn--ghost:hover { opacity: 0.8; }
                .shop-perks {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0;
                    border-bottom: 1px solid rgba(0,45,114,0.1);
                    background: #F8FAFC;
                }
                .shop-perks > div {
                    text-align: center;
                    padding: 22px 16px;
                    border-right: 1px solid rgba(0,45,114,0.1);
                }
                .shop-perks > div:last-child { border-right: none; }
                .shop-perks strong {
                    display: block;
                    font-family: ${FONT_DISPLAY};
                    font-size: 14px;
                    color: #002D72;
                    margin-bottom: 4px;
                    font-weight: 700;
                }
                .shop-perks span {
                    font-size: 13px;
                    color: rgba(10,31,68,0.62);
                    font-family: ${FONT_SERIF};
                    font-style: italic;
                }
                .shop-catalog {
                    padding: clamp(48px, 7vw, 72px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 80px);
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .shop-help-band {
                    background: linear-gradient(135deg, #001A44 0%, #002D72 50%, #1A4A9E 100%);
                    padding: clamp(40px, 6vw, 56px) clamp(20px, 4vw, 48px) clamp(64px, 8vw, 88px);
                }
                .shop-help-band-inner {
                    max-width: 960px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 28px;
                    flex-wrap: wrap;
                }
                .shop-help-band h2 {
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(22px, 3vw, 28px);
                    color: #FFFFFF;
                    margin: 0 0 8px;
                    text-transform: uppercase;
                    font-weight: 800;
                }
                .shop-help-band p {
                    font-family: ${FONT_SERIF};
                    font-style: italic;
                    font-size: 15px;
                    color: rgba(255,255,255,0.88);
                    margin: 0;
                    line-height: 1.65;
                    max-width: 480px;
                }
                .shop-help-actions .shop-btn--ghost { color: #FFFFFF; }
                .catalog-toolbar {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .catalog-toolbar-title {
                    margin: 0;
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(22px, 3vw, 28px);
                    color: #002D72;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .catalog-toolbar-count {
                    margin: 6px 0 0;
                    font-size: 14px;
                    color: rgba(10,31,68,0.6);
                    font-family: ${FONT_SERIF};
                    font-style: italic;
                }
                @media (max-width: 720px) {
                    .shop-perks { grid-template-columns: 1fr; }
                    .shop-perks > div { border-right: none; border-bottom: 1px solid rgba(0,45,114,0.1); }
                    .shop-help-band-inner { flex-direction: column; align-items: flex-start; }
                    .shop-help-actions { justify-content: flex-start; width: 100%; }
                }
            `}</style>
        </div>
    );
}

export default ProductsPage;
