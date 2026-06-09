// src/ProductsPage.jsx
import { ProductCatalog } from './components/ProductCatalog';

function ProductsPage() {
    return (
        <div style={{ background: '#060B1A', minHeight: '100vh', paddingTop: '100px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #0D1830, #060B1A)',
                padding: '60px 48px',
                textAlign: 'center',
                borderBottom: '0.5px solid rgba(99,179,237,0.1)',
            }}>
                <h1 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(40px, 5vw, 56px)',
                    color: '#fff',
                    marginBottom: 20,
                }}>
                    Our Products
                </h1>
                <p style={{
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: 600,
                    margin: '0 auto',
                }}>
                    Quality security and technology products at competitive prices
                </p>
            </div>
            <ProductCatalog variant="public" />
        </div>
    );
}

export default ProductsPage;
