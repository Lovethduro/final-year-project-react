import { useAuth } from './hooks/useAuth';
import CustomerProfileView from './components/profile/CustomerProfileView';
import StaffProfileView from './components/profile/StaffProfileView';

export default function ProfilePage() {
    const auth = useAuth();

    if (auth.role === 'CUSTOMER') {
        return <CustomerProfileView />;
    }

    return <StaffProfileView role={auth.role} />;
}
