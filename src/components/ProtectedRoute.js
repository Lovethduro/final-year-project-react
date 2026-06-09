import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/apiClient';
import { getDashboardPath } from '../utils/authFlow';

export default function ProtectedRoute({ children, roles }) {
    const session = getSession();

    if (!session.userId || !session.token) {
        return <Navigate to="/login" replace />;
    }

    if (!session.emailVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    if (!session.mfaEnabled) {
        return <Navigate to="/mfa-setup" replace />;
    }

    if (roles?.length) {
        const userRole = (session.role || 'CUSTOMER').toUpperCase();
        if (!roles.includes(userRole)) {
            return <Navigate to={getDashboardPath(userRole)} replace />;
        }
    }

    return children;
}
