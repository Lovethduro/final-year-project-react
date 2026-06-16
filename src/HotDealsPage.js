import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader } from './components/ui';
import { HotDealsStrip } from './components/HotDealsStrip';

export default function HotDealsPage() {
    return (
        <DashboardLayout>
            <PageHeader
                title="Hot Deals"
                subtitle="Exclusive offers and limited-time promotions for CyForce customers"
            />
            <HotDealsStrip compact showAll showTitle={false} emptyMessage="No hot deals right now. Check back soon or watch for notifications when new offers go live." />
        </DashboardLayout>
    );
}
