import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProductCatalog } from '../components/ProductCatalog';
import { PageHeader, Card } from '../components/ui';
import { HotDealsStrip } from '../components/HotDealsStrip';
import { theme } from '../styles/theme';

export default function CustomerProductsPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Product Catalog"
                subtitle="Browse products, hot deals, and manage your cart"
            />

            <Card title="🔥 Hot Deals" style={{ marginBottom: 24 }}>
                <HotDealsStrip
                    compact
                    showAll
                    showTitle={false}
                    emptyMessage="No hot deals right now. Check your notifications when new offers are published."
                />
                <Link to="/customer/hot-deals" style={{ display: 'inline-block', marginTop: 12, color: theme.accent, fontSize: 14 }}>
                    Open hot deals page →
                </Link>
            </Card>

            <ProductCatalog variant="dashboard" />
        </DashboardLayout>
    );
}
