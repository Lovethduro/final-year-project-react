import { DashboardLayout } from '../components/DashboardLayout';
import { PageHeader } from '../components/ui';
import { ProductCatalog } from '../components/ProductCatalog';

export default function StaffShopPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Staff Store"
                subtitle="Purchase CyForce products with your employee discount (10% after 6 months, 15% after 1 year)"
            />
            <ProductCatalog variant="staff" />
        </DashboardLayout>
    );
}
