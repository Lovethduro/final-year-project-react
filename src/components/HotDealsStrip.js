import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl, contentApi, productApi, getSession } from '../utils/apiClient';
import { addHotDealToCart } from '../utils/cartUtils';
import { Alert } from './ui';
import { theme } from '../styles/theme';

const DEFAULT_DEAL_IMAGE = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80';

function formatNaira(amount) {
    if (!amount) return '₦0';
    return `₦${Number(amount).toLocaleString()}`;
}

function dealImageSrc(deal) {
    return deal.imageUrl ? assetUrl(deal.imageUrl) : DEFAULT_DEAL_IMAGE;
}

function normalizeDeals(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.deals)) return data.deals;
    return [];
}

export function HotDealsStrip({
    compact = false,
    title = 'Special Offers',
    showAll = false,
    showTitle = true,
    maxItems = null,
    emptyMessage = null,
    deals: dealsProp,
    products: productsProp,
}) {
    const navigate = useNavigate();
    const useExternalData = dealsProp !== undefined;
    const [deals, setDeals] = useState(dealsProp ?? []);
    const [products, setProducts] = useState(productsProp ?? []);
    const [loading, setLoading] = useState(!useExternalData);
    const [error, setError] = useState('');
    const [cartNotice, setCartNotice] = useState('');

    useEffect(() => {
        if (useExternalData) {
            setDeals(dealsProp);
            setProducts(productsProp ?? []);
            setLoading(false);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        Promise.all([
            contentApi.hotDeals(),
            productApi.list(),
        ])
            .then(([dealData, productData]) => {
                setDeals(normalizeDeals(dealData));
                setProducts(Array.isArray(productData) ? productData : []);
            })
            .catch((err) => {
                setDeals([]);
                setProducts([]);
                setError(err.message || 'Could not load hot deals.');
            })
            .finally(() => setLoading(false));
    }, [useExternalData, dealsProp, productsProp]);

    const handleShopNow = (deal) => {
        const product = products.find((item) => item.id === deal.productId);
        const result = addHotDealToCart(deal, product);
        setCartNotice(result.notice || '');
        if (result.added) {
            const session = getSession();
            const target = session.role === 'CUSTOMER' ? '/customer/products' : '/products';
            navigate(target, { state: { openCart: true } });
        }
    };

    if (loading) {
        return (
            <div style={{ color: theme.textDim, fontSize: 14, padding: compact ? '8px 0' : '16px 0' }}>
                Loading hot deals…
            </div>
        );
    }

    if (error) {
        return <Alert type="error">{error}</Alert>;
    }

    if (!deals.length) {
        if (!emptyMessage) return null;
        return <Alert type="info">{emptyMessage}</Alert>;
    }

    const visibleDeals = showAll
        ? deals
        : deals.slice(0, maxItems ?? (compact ? 3 : 6));

    return (
        <section style={{ marginBottom: 0 }}>
            {cartNotice && <Alert type={cartNotice.includes('added') ? 'success' : 'warning'}>{cartNotice}</Alert>}
            {showTitle && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: compact ? 18 : 24,
                        color: compact ? theme.text : '#fff',
                        fontWeight: 700,
                    }}>
                        {title}
                    </h2>
                </div>
            )}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
            }}>
                {visibleDeals.map((deal) => (
                    <div key={deal.id || deal.title} style={{
                        borderRadius: 14,
                        overflow: 'hidden',
                        border: `0.5px solid ${compact ? theme.border : 'rgba(99,179,237,0.2)'}`,
                        background: compact ? 'rgba(255,255,255,0.03)' : '#0D1830',
                    }}>
                        <div style={{ height: compact ? 140 : 180, overflow: 'hidden' }}>
                            <img
                                src={dealImageSrc(deal)}
                                alt={deal.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ padding: compact ? 14 : 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#fff',
                                    background: '#EF4444',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                }}>
                                    {deal.badge || 'Hot Deal'}
                                </span>
                                {deal.discountPercent > 0 && (
                                    <span style={{ fontSize: 12, color: theme.success, fontWeight: 600 }}>
                                        -{deal.discountPercent}%
                                    </span>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontSize: compact ? 15 : 17, color: compact ? theme.text : '#fff' }}>
                                {deal.title}
                            </h3>
                            {deal.description && (
                                <p style={{ margin: '0 0 12px', fontSize: 13, color: compact ? theme.textDim : 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                                    {deal.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                {deal.price != null && (
                                    <span style={{ fontSize: compact ? 16 : 18, fontWeight: 700, color: theme.accent }}>
                                        {formatNaira(deal.price)}
                                    </span>
                                )}
                                {deal.originalPrice != null && deal.originalPrice > deal.price && (
                                    <span style={{ fontSize: 12, color: theme.textDim, textDecoration: 'line-through' }}>
                                        {formatNaira(deal.originalPrice)}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleShopNow(deal)}
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #2B5CE6, #38BDF8)',
                                    color: '#fff',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {deal.ctaLabel || 'Shop now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
