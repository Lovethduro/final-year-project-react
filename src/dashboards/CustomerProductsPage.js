import { DashboardLayout } from '../components/DashboardLayout';
import { ProductCatalog } from '../components/ProductCatalog';
import { PageHeader } from '../components/ui';

export default function CustomerProductsPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Product Catalog"
                subtitle="Browse products and manage your cart"
            />
            <ProductCatalog variant="dashboard" />
        </DashboardLayout>
    );
}
