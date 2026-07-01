import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { canAccessPath, getFirstAccessiblePath } from "../utils/permissions";

export default function PrivateRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!user) return <Navigate to="/" replace />;

    // Redirect Platform Admin to their area
    if (user.role === 'platformAdmin' && !location.pathname.startsWith('/platform-admin')) {
        return <Navigate to="/platform-admin" replace />;
    }

    // Redirect if user lacks permission for the current route
    if (!canAccessPath(user, location.pathname)) {
        return <Navigate to={getFirstAccessiblePath(user)} replace />;
    }

    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}