import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

/** Keeps sidebar/header mounted while dashboard child routes change. */
export default function DashboardShell() {
    return (
    <>
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    </>
    );
}