// src/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Sample products data - Replace with your actual products
const PRODUCTS = [
    {
        id: 1,
        name: "CCTV Camera Kit",
        category: "CCTV",
        price: 150000,
        originalPrice: 200000,
        image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=500&q=80",
        description: "4-channel HD CCTV system with night vision",
        inStock: true,
        featured: true
    },
    {
        id: 2,
        name: "Solar Inverter 5KVA",
        category: "Solar",
        price: 850000,
        originalPrice: 950000,
        image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&q=80",
        description: "Pure sine wave solar inverter with battery management",
        inStock: true,
        featured: true
    },
    {
        id: 3,
        name: "Fire Alarm System",
        category: "Security",
        price: 250000,
        originalPrice: 300000,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
        description: "Addressable fire alarm system for medium buildings",
        inStock: true,
        featured: false
    },
    {
        id: 4,
        name: "Access Control System",
        category: "Security",
        price: 180000,
        originalPrice: 220000,
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80",
        description: "Biometric access control with fingerprint scanner",
        inStock: true,
        featured: true
    },
    {
        id: 5,
        name: "Solar Panel 400W",
        category: "Solar",
        price: 120000,
        originalPrice: 150000,
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80",
        description: "Monocrystalline solar panel, high efficiency",
        inStock: false,
        featured: false
    },
    {
        id: 6,
        name: "POS Terminal",
        category: "Enterprise",
        price: 95000,
        originalPrice: 120000,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
        description: "Android POS terminal with receipt printer",
        inStock: true,
        featured: true
    }
];

function ProductsPage() {
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [cartTotal, setCartTotal] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
    }, []);

    // Update cart total when cart changes
    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            setShowAuth(true);
        } else {
            // Proceed to checkout
            alert(`Proceeding to checkout! Total: ₦${cartTotal.toLocaleString()}`);
        }
    };

    const handleLogin = (email, password) => {
        // Simple demo login - In production, use proper authentication
        if (email && password) {
            const userData = { email, name: email.split('@')[0] };
            setUser(userData);
            setIsLoggedIn(true);
            setShowAuth(false);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const handleRegister = (name, email, password) => {
        const userData = { name, email };
        setUser(userData);
        setIsLoggedIn(true);
        setShowAuth(false);
        localStorage.setItem('user', JSON.stringify(userData));
        alert('Registration successful! You can now checkout.');
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        setCart([]);
        localStorage.removeItem('cart');
    };

    return (
        <div style={{ background: "#060B1A", minHeight: "100vh", paddingTop: "100px" }}>
            {/* Hero Section */}
            <div style={{
                background: "linear-gradient(135deg, #0D1830, #060B1A)",
                padding: "60px 48px",
                textAlign: "center",
                borderBottom: "0.5px solid rgba(99,179,237,0.1)"
            }}>
                <h1 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(40px, 5vw, 56px)",
                    color: "#fff",
                    marginBottom: 20
                }}>
                    Our Products
                </h1>
                <p style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.5)",
                    maxWidth: 600,
                    margin: "0 auto"
                }}>
                    Quality security and technology products at competitive prices
                </p>
            </div>

            {/* Cart Button */}
            <div style={{
                position: "fixed",
                bottom: "100px",
                right: "20px",
                zIndex: 100
            }}>
                <button
                    onClick={() => setShowCart(!showCart)}
                    style={{
                        background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "60px",
                        height: "60px",
                        cursor: "pointer",
                        position: "relative",
                        boxShadow: "0 4px 20px rgba(43,92,230,0.4)"
                    }}
                >
                    🛒
                    {cart.length > 0 && (
                        <span style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "#FF0000",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            color: "#fff"
                        }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
                    )}
                </button>
            </div>

            {/* Cart Sidebar */}
            {showCart && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    width: "400px",
                    height: "100vh",
                    background: "#0D1830",
                    zIndex: 1000,
                    padding: "20px",
                    boxShadow: "-5px 0 30px rgba(0,0,0,0.5)",
                    overflowY: "auto"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h3 style={{ color: "#fff" }}>Your Cart ({cart.length} items)</h3>
                        <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>✕</button>
                    </div>

                    {cart.length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Your cart is empty</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} style={{
                                    display: "flex",
                                    gap: "15px",
                                    marginBottom: "20px",
                                    padding: "10px",
                                    borderBottom: "0.5px solid rgba(99,179,237,0.1)"
                                }}>
                                    <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "5px" }}>{item.name}</h4>
                                        <p style={{ color: "#38BDF8", fontSize: "13px" }}>₦{item.price.toLocaleString()}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: "25px", height: "25px", borderRadius: "4px", cursor: "pointer", color: "#fff" }}>-</button>
                                            <span style={{ color: "#fff", fontSize: "14px" }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: "25px", height: "25px", borderRadius: "4px", cursor: "pointer", color: "#fff" }}>+</button>
                                            <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#FF0000", cursor: "pointer" }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div style={{
                                marginTop: "20px",
                                paddingTop: "20px",
                                borderTop: "1px solid rgba(99,179,237,0.2)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                                    <span style={{ color: "#fff" }}>Total:</span>
                                    <span style={{ color: "#38BDF8", fontSize: "20px", fontWeight: "bold" }}>₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    style={{
                                        width: "100%",
                                        padding: "15px",
                                        background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        cursor: "pointer"
                                    }}
                                >
                                    {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
                                </button>
                                {!isLoggedIn && (
                                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
                                        You need to login or register to complete your purchase
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Auth Modal */}
            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                />
            )}

            {/* Products Grid */}
            {/* Products Grid */}
            <div style={{ padding: "60px 48px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {/* Products - Removed User Info Bar */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "30px"
                    }}>
                        {PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>


                    {/* Products */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "30px"
                    }}>
                        {PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product, addToCart }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{
                background: "#0D1830",
                borderRadius: "16px",
                overflow: "hidden",
                border: isHovered ? "0.5px solid rgba(56,189,248,0.3)" : "0.5px solid rgba(99,179,237,0.1)",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-5px)" : "translateY(0)"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ position: "relative", overflow: "hidden", height: "220px" }}>
                <img
                    src={product.image}
                    alt={product.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        transform: isHovered ? "scale(1.08)" : "scale(1)"
                    }}
                />
                {product.originalPrice > product.price && (
                    <span style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#FF0000",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#fff"
                    }}>
            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
                )}
                {!product.inStock && (
                    <span style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        background: "rgba(0,0,0,0.7)",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#fff"
                    }}>
            Out of Stock
          </span>
                )}
            </div>

            <div style={{ padding: "20px" }}>
                <div style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    background: "rgba(56,189,248,0.1)",
                    borderRadius: "4px",
                    fontSize: "10px",
                    color: "#38BDF8",
                    marginBottom: "10px"
                }}>
                    {product.category}
                </div>
                <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "8px" }}>{product.name}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>{product.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#38BDF8" }}>₦{product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "line-through", marginLeft: "8px" }}>
                ₦{product.originalPrice.toLocaleString()}
              </span>
                        )}
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        style={{
                            background: product.inStock ? "linear-gradient(135deg, #2B5CE6, #38BDF8)" : "rgba(255,255,255,0.1)",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            color: "#fff",
                            cursor: product.inStock ? "pointer" : "not-allowed",
                            fontSize: "12px"
                        }}
                    >
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AuthModal({ onClose, onLogin, onRegister }) {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(email, password);
        } else {
            onRegister(name, email, password);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                background: "#0D1830",
                borderRadius: "16px",
                padding: "40px",
                width: "100%",
                maxWidth: "450px",
                position: "relative"
            }}>
                <button onClick={onClose} style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "20px",
                    cursor: "pointer"
                }}>✕</button>

                <h2 style={{ color: "#fff", marginBottom: "20px" }}>
                    {isLogin ? "Login to Continue" : "Create Account"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginBottom: "15px",
                                background: "rgba(255,255,255,0.05)",
                                border: "0.5px solid rgba(99,179,237,0.2)",
                                borderRadius: "8px",
                                color: "#fff"
                            }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "15px",
                            background: "rgba(255,255,255,0.05)",
                            border: "0.5px solid rgba(99,179,237,0.2)",
                            borderRadius: "8px",
                            color: "#fff"
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "20px",
                            background: "rgba(255,255,255,0.05)",
                            border: "0.5px solid rgba(99,179,237,0.2)",
                            borderRadius: "8px",
                            color: "#fff"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "20px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: "#38BDF8", cursor: "pointer" }}
                    >
            {isLogin ? "Register" : "Login"}
          </span>
                </p>
            </div>
        </div>
    );
}

export default ProductsPage;