import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { productApi, getSession, customerApi, paymentApi, userApi } from '../utils/apiClient';
import { mapProductForDisplay } from '../utils/productUtils';
import { theme } from '../styles/theme';
import { refreshNotifications } from '../utils/notifications';

export function ProductCatalog({ variant = 'public' }) {
    const isDashboard = variant === 'dashboard';
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [checkoutError, setCheckoutError] = useState('');
    const [checkingOut, setCheckingOut] = useState(false);
    const [paymentProvider, setPaymentProvider] = useState('paystack');
    const session = getSession();
    const isLoggedIn = Boolean(session.userId);
    const isCustomer = session.role === 'CUSTOMER';

    useEffect(() => {
        productApi.list()
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !isCustomer) return;
        const stored = session.preferredPaymentMethod;
        if (stored) {
            setPaymentProvider(stored);
            return;
        }
        userApi.getProfile()
            .then((profile) => {
                if (profile.preferredPaymentMethod) {
                    setPaymentProvider(profile.preferredPaymentMethod);
                }
            })
            .catch(() => {});
    }, [isLoggedIn, isCustomer, session.preferredPaymentMethod]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch {
                setCart([]);
            }
        }
    }, []);

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const cartItem = mapProductForDisplay(product);
        const existingItem = cart.find((item) => item.id === cartItem.id);
        if (existingItem) {
            setCart(cart.map((item) => (
                item.id === cartItem.id ? { ...item, quantity: item.quantity + 1 } : item
            )));
        } else {
            setCart([...cart, { ...cartItem, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            setCart(cart.map((item) => (
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )));
        }
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const handleCheckout = async () => {
        setCheckoutError('');

        if (!isLoggedIn) {
            if (isDashboard) {
                navigate('/login');
            } else {
                setShowAuth(true);
            }
            return;
        }

        if (!isCustomer) {
            setCheckoutError('Only customer accounts can checkout. Please log in with a customer account.');
            return;
        }

        if (cart.length === 0) {
            setCheckoutError('Your cart is empty.');
            return;
        }

        setCheckingOut(true);
        try {
            const items = cart.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
            }));

            const result = await customerApi.checkout(items, paymentProvider);

            if (result.sandbox || result.authorizationUrl?.includes('sandbox=1')) {
                await paymentApi.sandboxComplete(result.reference);
                clearCart();
                setShowCart(false);
                refreshNotifications();
                if (isDashboard) {
                    navigate('/dashboard/billing');
                }
                return;
            }

            if (result.authorizationUrl) {
                window.location.href = result.authorizationUrl;
                return;
            }

            throw new Error('Unable to start payment. Please try again.');
        } catch (err) {
            setCheckoutError(err.message || 'Checkout failed. Please try again.');
            refreshNotifications();
        } finally {
            setCheckingOut(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: isDashboard ? 24 : 100,
                right: 20,
                zIndex: isDashboard ? 150 : 100,
            }}>
                <button
                    type="button"
                    onClick={() => setShowCart(!showCart)}
                    style={{
                        background: 'linear-gradient(135deg, #2B5CE6, #38BDF8)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(43,92,230,0.4)',
                    }}
                >
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            background: '#FF0000',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: '#fff',
                        }}>
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {showCart && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: 'min(400px, 100vw)',
                    height: '100vh',
                    background: '#0D1830',
                    zIndex: 1000,
                    padding: 20,
                    boxShadow: '-5px 0 30px rgba(0,0,0,0.5)',
                    overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h3 style={{ color: '#fff' }}>Your Cart ({cart.length} items)</h3>
                        <button type="button" onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>
                    </div>

                    {cart.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Your cart is empty</p>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    gap: 15,
                                    marginBottom: 20,
                                    padding: 10,
                                    borderBottom: '0.5px solid rgba(99,179,237,0.1)',
                                }}>
                                    <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 5 }}>{item.name}</h4>
                                        <p style={{ color: '#38BDF8', fontSize: 13 }}>₦{item.price.toLocaleString()}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 25, height: 25, borderRadius: 4, cursor: 'pointer', color: '#fff' }}>-</button>
                                            <span style={{ color: '#fff', fontSize: 14 }}>{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 25, height: 25, borderRadius: 4, cursor: 'pointer', color: '#fff' }}>+</button>
                                            <button type="button" onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#FF0000', cursor: 'pointer' }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(99,179,237,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ color: '#fff' }}>Total:</span>
                                    <span style={{ color: '#38BDF8', fontSize: 20, fontWeight: 'bold' }}>₦{cartTotal.toLocaleString()}</span>
                                </div>
                                {checkoutError && (
                                    <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{checkoutError}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    style={{
                                        width: '100%',
                                        padding: 15,
                                        background: checkingOut ? 'rgba(43,92,230,0.5)' : 'linear-gradient(135deg, #2B5CE6, #38BDF8)',
                                        border: 'none',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        cursor: checkingOut ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {checkingOut ? 'Processing…' : isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </button>
                                {!isLoggedIn && (
                                    <p style={{ fontSize: 12, color: theme.textDim, marginTop: 10, textAlign: 'center' }}>
                                        You must be logged in as a customer to pay.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {!isDashboard && showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onLogin={handleLoginRedirect}
                />
            )}

            <div style={{ padding: isDashboard ? 0 : '60px 48px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {loading ? (
                        <p style={{ color: theme.textDim, textAlign: 'center' }}>Loading products…</p>
                    ) : products.length === 0 ? (
                        <p style={{ color: theme.textDim, textAlign: 'center' }}>No products available yet. Check back soon.</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 30,
                        }}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function AuthModal({ onClose, onLogin }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#0D1830', borderRadius: 16, padding: 40, width: '100%', maxWidth: 450, position: 'relative', textAlign: 'center',
            }}>
                <button type="button" onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                <h2 style={{ color: '#fff', marginBottom: 12 }}>Login Required</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 }}>
                    Sign in with your customer account to complete checkout and pay securely.
                </p>
                <button
                    type="button"
                    onClick={onLogin}
                    style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #2B5CE6, #38BDF8)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
}
