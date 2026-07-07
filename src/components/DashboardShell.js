import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

/** Keeps sidebar/header mounted while dashboard child routes change. */
export default function DashboardShell() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <Outlet />
            </DashboardLayout>
        </ProtectedRoute>
    );
}