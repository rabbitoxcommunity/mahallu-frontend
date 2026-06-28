import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlatformAdminLayout from "../components/layout/PlatformAdminLayout";

export default function PlatformAdminRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    if (loading) return null; // Or a spinner/skeleton
    
    // Redirect non-platform admins back to dashboard or login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (user.role !== 'platformAdmin') {
        return <Navigate to="/dashboard" replace />;
    }
    
    // Show Platform Admin layout (no sidebar)
    return (
        <PlatformAdminLayout>
            <Outlet />
        </PlatformAdminLayout>
    );
}
