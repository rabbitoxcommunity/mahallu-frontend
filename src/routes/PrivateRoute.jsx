import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function PrivateRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    if (loading) return null; // Or a spinner/skeleton
    
    // Redirect Platform Admin to platform-admin page if they're not already there
    if (user?.role === 'platformAdmin' && !location.pathname.startsWith('/platform-admin')) {
        return <Navigate to="/platform-admin" replace />;
    }
    
    // Show sidebar for all users including Platform Admin
    return user ? (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ) : (
        <Navigate to="/" replace />
    );
}