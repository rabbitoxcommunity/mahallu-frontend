import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function PrivateRoute() {
    const { user, loading } = useAuth();
    
    if (loading) return null; // Or a spinner/skeleton
    
    // Utilize Outlet to render matching child routes within the DashboardLayout 
    return user ? (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ) : (
        <Navigate to="/" replace />
    );
}