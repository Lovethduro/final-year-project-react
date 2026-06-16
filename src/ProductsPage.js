import { Link } from 'react-router-dom';
import { ProductCatalog } from './components/ProductCatalog';
import cctv from './images/cctv.jpg';
import solar from './images/solar.jpg';
import { FONT_BODY, FONT_DISPLAY } from './styles/landingFonts';

function ProductsPage() {
    return (
        <div className="shop-page">
            <section className="shop-hero">
                <div className="shop-hero-bg" aria-hidden="true">
                    <img src={cctv} alt="" className="shop-hero-img shop-hero-img--primary" />
                    <img src={solar} alt="" className="shop-hero-img shop-hero-img--secondary" />
                    <div className="shop-hero-overlay" />
                </div>
                <div className="shop-hero-content">
                    <span className="shop-eyebrow">Online Store</span>
                    <h1>Technology products, ready to order</h1>
                    <p>
                        CCTV, solar, security, and enterprise equipment — shipped or collected from our Abuja office.
                    </p>
                    <div className="shop-hero-actions">
                        <a href="#catalog" className="shop-btn shop-btn--primary">Browse catalog</a>
                        <Link to={{ pathname: '/', hash: '#contact' }} className="shop-btn shop-btn--ghost">
                            Contact us
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
                            Contact us
                        </Link>
                        <Link to="/services" className="shop-btn shop-btn--ghost">
                            View services
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                .shop-page {
                    background: #040A14;
                    min-height: 100vh;
                    padding-top: 88px;
                    font-family: ${FONT_BODY};
                }
                .shop-hero {
                    position: relative;
                    min-height: clamp(320px, 48vh, 460px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-bottom: 0.5px solid rgba(99,179,237,0.1);
                }
                .shop-hero-bg {
                    position: absolute;
                    inset: 0;
                }
                .shop-hero-img {
                    position: absolute;
                    object-fit: cover;
                    filter: saturate(0.9) brightness(0.55);
                }
                .shop-hero-img--primary {
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                .shop-hero-img--secondary {
                    display: none;
                }
                .shop-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(180deg, rgba(4,10,20,0.55) 0%, rgba(4,10,20,0.92) 100%),
                        radial-gradient(ellipse 80% 60% at 50% 20%, rgba(43,92,230,0.25), transparent);
                }
                .shop-hero-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    max-width: 680px;
                    padding: clamp(48px, 8vw, 72px) clamp(20px, 4vw, 40px);
                }
                .shop-eyebrow {
                    display: inline-block;
                    font-size: 11px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #FBBF24;
                    font-weight: 700;
                    margin-bottom: 14px;
                }
                .shop-hero h1 {
                    font-family: ${FONT_DISPLAY};
                    font-size: clamp(32px, 5vw, 48px);
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 16px;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }
                .shop-hero p {
                    font-size: 15px;
                    color: rgba(255,255,255,0.58);
                    line-height: 1.75;
                    margin: 0 auto 28px;
                    max-width: 540px;
                }
                .shop-hero-actions,
                .shop-help-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                }
                .shop-btn {
                    display: inline-flex;
                    align-items: center;
                    padding: 12px 24px;
                    border-radius: 9px;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .shop-btn--primary {
                    background: linear-gradient(135deg, #2B5CE6, #38BDF8);
                    color: #fff;
                    box-shadow: 0 8px 28px rgba(43,92,230,0.35);
                }
                .shop-btn--primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 36px rgba(43,92,230,0.45);
                }
                .shop-btn--ghost {
                    color: rgba(255,255,255,0.82);
                    border: 0.5px solid rgba(255,255,255,0.22);
                    background: rgba(255,255,255,0.04);
                }
                .shop-btn--ghost:hover {
                    border-color: #38BDF8;
                    color: #fff;
                }
                .shop-perks {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1px;
                    background: rgba(99,179,237,0.1);
                    border-bottom: 0.5px solid rgba(99,179,237,0.1);
                }
                .shop-perks > div {
                    background: #040A14;
                    text-align: center;
                    padding: 18px 16px;
                }
                .shop-perks strong {
                    display: block;
                    font-family: ${FONT_DISPLAY};
                    font-size: 14px;
                    color: #fff;
                    margin-bottom: 4px;
                }
                .shop-perks span {
                    font-size: 12px;
                    color: rgba(255,255,255,0.4);
                }
                .shop-catalog {
                    padding: clamp(48px, 7vw, 72px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 80px);
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .shop-help-band {
                    background: linear-gradient(135deg, rgba(43,92,230,0.18), rgba(4,10,20,0.95));
                    border-top: 0.5px solid rgba(99,179,237,0.12);
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
                    color: #fff;
                    margin: 0 0 8px;
                }
                .shop-help-band p {
                    font-size: 14px;
                    color: rgba(255,255,255,0.52);
                    margin: 0;
                    line-height: 1.65;
                    max-width: 480px;
                }
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
                    color: #fff;
                    font-weight: 700;
                }
                .catalog-toolbar-count {
                    margin: 6px 0 0;
                    font-size: 14px;
                    color: rgba(255,255,255,0.45);
                }
                @media (max-width: 720px) {
                    .shop-perks { grid-template-columns: 1fr; }
                    .shop-help-band-inner { flex-direction: column; align-items: flex-start; }
                    .shop-help-actions { justify-content: flex-start; width: 100%; }
                }
            `}</style>
        </div>
    );
}

export default ProductsPage;
