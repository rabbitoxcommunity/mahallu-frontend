import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
    const token = localStorage.getItem("token");
    
    // Utilize Outlet to render matching child routes, enabling nested routing across multiple future pages
    return token ? <Outlet /> : <Navigate to="/" replace />;
}