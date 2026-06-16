import { useState } from 'react';
import { mapProductForDisplay } from '../utils/productUtils';

export function ProductCard({ product, onAddToCart, compact = false }) {
    const [isHovered, setIsHovered] = useState(false);
    const item = mapProductForDisplay(product);

    return (
        <div
            style={{
                background: '#0D1830',
                borderRadius: compact ? 12 : 16,
                overflow: 'hidden',
                border: isHovered ? '0.5px solid rgba(56,189,248,0.3)' : '0.5px solid rgba(99,179,237,0.1)',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ position: 'relative', overflow: 'hidden', height: compact ? 160 : 220 }}>
                <img
                    src={item.image}
                    alt={item.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                />
                {item.originalPrice > item.price && (
                    <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: '#FF0000',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#fff',
                    }}>
                        Save {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </span>
                )}
                {!item.inStock && (
                    <span style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        background: 'rgba(220,38,38,0.9)',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 600,
                    }}>
                        Sold Out
                    </span>
                )}
                {item.inStock && item.stockQuantity > 0 && item.stockQuantity <= 5 && (
                    <span style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        background: 'rgba(251,191,36,0.9)',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 11,
                        color: '#111',
                        fontWeight: 600,
                    }}>
                        Only {item.stockQuantity} left
                    </span>
                )}
            </div>

            <div style={{ padding: compact ? 14 : 20 }}>
                <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: 'rgba(56,189,248,0.1)',
                    borderRadius: 4,
                    fontSize: 10,
                    color: '#38BDF8',
                    marginBottom: 10,
                }}>
                    {item.category}
                </div>
                <h3 style={{ fontSize: compact ? 14 : 16, color: '#fff', marginBottom: 8 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{item.description}</p>
                {item.inStock && item.stockQuantity > 5 && (
                    <p style={{ fontSize: 12, color: '#34D399', marginBottom: 10 }}>{item.stockQuantity} in stock</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                        <span style={{ fontSize: compact ? 16 : 20, fontWeight: 'bold', color: '#38BDF8' }}>
                            ₦{Number(item.price).toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginLeft: 8 }}>
                                ₦{Number(item.originalPrice).toLocaleString()}
                            </span>
                        )}
                    </div>
                    {onAddToCart && (
                        <button
                            type="button"
                            onClick={() => onAddToCart(item)}
                            disabled={!item.inStock}
                            style={{
                                background: item.inStock ? 'linear-gradient(135deg, #2B5CE6, #38BDF8)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 6,
                                color: '#fff',
                                cursor: item.inStock ? 'pointer' : 'not-allowed',
                                fontSize: 12,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.inStock ? 'Add to Cart' : 'Sold Out'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
