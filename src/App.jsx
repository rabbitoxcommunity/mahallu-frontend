import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import PlatformAdminDashboard from "./pages/PlatformAdmin/PlatformAdminDashboard";
import TenantsList from "./pages/PlatformAdmin/TenantsList";
import CreateTenant from "./pages/PlatformAdmin/CreateTenant";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import StaffList from "./pages/SuperAdmin/StaffList";
import CreateStaff from "./pages/SuperAdmin/CreateStaff";
import EditStaffPermissions from "./pages/SuperAdmin/EditStaffPermissions";
import FamilyRegistration from "./pages/Family/FamilyRegistration";
import HouseRegistration from "./pages/Family/Houseregistration";
import AddFamily from "./pages/Family/AddFamily";
import AddHouse from "./pages/Family/AddHouse";
import MemberRegistration from "./pages/Family/MemberRegistration";
import AddMember from "./pages/Family/AddMember";
import HouseDetailedView from "./pages/Family/HouseDetailedView";
import MemberDetailedView from "./pages/Family/MemberDetailedView";
import Analytics from "./pages/Analytics";

function App() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <BrowserRouter>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        theme="colored"
                    />
                    <Routes>
                        {/* Public Route */}
                        <Route path="/" element={<Login />} />

                        {/* Protected Routes Wrapper */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/analytics" element={<Analytics />} />
                            
                            {/* Platform Admin Routes */}
                            <Route path="/platform-admin" element={<PlatformAdminDashboard />} />
                            <Route path="/platform-admin/tenants" element={<TenantsList />} />
                            <Route path="/platform-admin/tenants/create" element={<CreateTenant />} />
                            
                            {/* SuperAdmin Routes */}
                            <Route path="/super-admin" element={<SuperAdminDashboard />} />
                            <Route path="/super-admin/staff" element={<StaffList />} />
                            <Route path="/super-admin/staff/create" element={<CreateStaff />} />
                            <Route path="/super-admin/staff/:id/permissions" element={<EditStaffPermissions />} />
                            
                            {/* Family Routes */}
                            <Route path="/family/register" element={<FamilyRegistration />} />
                            <Route path="/family/register/create" element={<AddFamily />} />
                            
                            <Route path="/family/house/register" element={<HouseRegistration />} />
                            <Route path="/family/house/add" element={<AddHouse />} />
                            <Route path="/family/house/:id" element={<HouseDetailedView />} />
                            
                            {/* Member Routes */}
                            <Route path="/family/member/register" element={<MemberRegistration />} />
                            <Route path="/family/member/add" element={<AddMember />} />
                            <Route path="/family/member/:id" element={<MemberDetailedView />} />
                            
                            {/* Add other protected pages here */}
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SidebarProvider>
        </AuthProvider>
    );
}

export default App;
