import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/apiClient';
import { getDashboardPath, LOGIN_MFA_ENABLED } from '../utils/authFlow';

function hasValidSession(session) {
    return Boolean(session.userId && session.token);
}

export default function ProtectedRoute({
    children,
    roles,
    allowPasswordChange = false,
    allowMfaSetup = false,
    allowProfileCompletion = false,
}) {
    const session = getSession();

    if (!hasValidSession(session)) {
        return <Navigate to="/login" replace />;
    }

    if (!session.emailVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    if (session.mustChangePassword && !allowPasswordChange) {
        return <Navigate to="/change-password" replace />;
    }

    if (LOGIN_MFA_ENABLED && !session.mfaEnabled && !allowMfaSetup && !session.mustChangePassword) {
        return <Navigate to="/mfa-setup" replace />;
    }

    const isCustomer = (session.role || 'CUSTOMER').toUpperCase() === 'CUSTOMER';
    if (isCustomer && !session.profileComplete && !allowProfileCompletion) {
        return <Navigate to="/complete-profile" replace />;
    }

    if (roles?.length) {
        const userRole = (session.role || 'CUSTOMER').toUpperCase();
        if (!roles.includes(userRole)) {
            return <Navigate to={getDashboardPath(userRole)} replace />;
        }
    }

    return children;
}
