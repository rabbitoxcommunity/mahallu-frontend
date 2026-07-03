import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import PlatformAdminRoute from "./routes/PlatformAdminRoute";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import PlatformAdminDashboard from "./pages/PlatformAdmin/PlatformAdminDashboard";
import TenantsList from "./pages/PlatformAdmin/TenantsList";
import CreateTenant from "./pages/PlatformAdmin/CreateTenant";
import EditTenant from "./pages/PlatformAdmin/EditTenant";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import StaffList from "./pages/SuperAdmin/StaffList";
import CreateStaff from "./pages/SuperAdmin/CreateStaff";
import EditStaffPermissions from "./pages/SuperAdmin/EditStaffPermissions";
import FamilyRegistration from "./pages/Family/FamilyRegistration";
import HouseRegistration from "./pages/Family/HouseRegistration";
import AddFamily from "./pages/Family/AddFamily";
import AddHouse from "./pages/Family/AddHouse";
import MemberRegistration from "./pages/Family/MemberRegistration";
import AddMember from "./pages/Family/AddMember";
import HouseDetailedView from "./pages/Family/HouseDetailedView";
import MemberDetailedView from "./pages/Family/MemberDetailedView";
import Analytics from "./pages/Analytics";
import Varisankhya from "./pages/Finance/Varisankhya";
import { Income } from "./pages/Finance/Income";
import Expense from "./pages/Finance/Expense";
import Reports from "./pages/Finance/Reports";
import GeneralSettings from "./pages/Settings/GeneralSettings";
import VarisankhyaConfig from "./pages/Settings/VarisankhyaConfig";
import Marriages from "./pages/Admin/Marriages";
import Welfare from "./pages/community/Welfare";
import DeathRegistry from "./pages/community/DeathRegistry";
import CommunicationCenter from "./pages/community/CommunicationCenter";
import ResultManagement from "./pages/results/ResultManagement";
import ResultSettingsPage from "./pages/results/ResultSettingsPage";
import PublicHome from "./pages/public/Home";
import PublicSearch from "./pages/public/Search";
import PublicFamilyView from "./pages/public/FamilyView";
import MarriageCertificate from "./pages/Public/MarriageCertificate";
// Public Portal
import PortalHomePage from "./pages/portal/HomePage";
import PortalServicesPage from "./pages/portal/ServicesPage";
import PortalAnnouncementsPage from "./pages/portal/AnnouncementsPage";
import PortalAboutPage from "./pages/portal/AboutPage";
import PortalContactPage from "./pages/portal/ContactPage";
import PortalMarriageCertPage from "./pages/portal/services/MarriageCertificatePage";
import PortalDeathCertPage from "./pages/portal/services/DeathCertificatePage";
import PortalResultsPage from "./pages/portal/services/ResultsPage";
import PortalBloodDonorPage from "./pages/portal/services/BloodDonorPage";
import PortalIslamicServicesPage from "./pages/portal/services/IslamicServicesPage";
import SurahLibrary from "./pages/IslamicLibrary/SurahLibrary";
import DuaLibrary from "./pages/IslamicLibrary/DuaLibrary";
import PublicPortalSettings from "./pages/Settings/PublicPortalSettings";
import { PortalProvider } from "./context/PortalContext";
import ScrollToTop from "./components/ScrollToTop";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <PWAInstallPrompt />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        theme="colored"
                    />
                    <Routes>
                        {/* Redirect Root to Login */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Legacy public routes */}
                        <Route path="/public" element={<PublicHome />} />
                        <Route path="/public/search" element={<PublicSearch />} />
                        <Route path="/public/family/:id" element={<PublicFamilyView />} />
                        <Route path="/certificate/marriage" element={<MarriageCertificate />} />

                        {/* Public Portal — all wrapped in PortalProvider so usePortal() works everywhere */}
                        <Route element={<PortalProvider />}>
                            <Route path="/portal" element={<PortalHomePage />} />
                            <Route path="/portal/services" element={<PortalServicesPage />} />
                            <Route path="/portal/announcements" element={<PortalAnnouncementsPage />} />
                            <Route path="/portal/about" element={<PortalAboutPage />} />
                            <Route path="/portal/contact" element={<PortalContactPage />} />
                            <Route path="/portal/services/marriage-certificate" element={<PortalMarriageCertPage />} />
                            <Route path="/portal/services/death-certificate" element={<PortalDeathCertPage />} />
                            <Route path="/portal/services/results" element={<PortalResultsPage />} />
                            <Route path="/portal/services/blood-donor" element={<PortalBloodDonorPage />} />
                            <Route path="/portal/services/islamic-services" element={<PortalIslamicServicesPage />} />
                        </Route>

                        {/* Login Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Platform Admin Routes (Independent Layout) */}
                        <Route element={<PlatformAdminRoute />}>
                            <Route path="/platform-admin" element={<PlatformAdminDashboard />} />
                            <Route path="/platform-admin/tenants" element={<TenantsList />} />
                            <Route path="/platform-admin/tenants/create" element={<CreateTenant />} />
                            <Route path="/platform-admin/tenants/:id/edit" element={<EditTenant />} />
                        </Route>

                        {/* Protected Routes Wrapper (With Sidebar) */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/analytics" element={<Analytics />} />

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

                            {/* Finance Routes */}
                            <Route path="/finance/varisankhya" element={<Varisankhya />} />
                            <Route path="/finance/income" element={<Income />} />
                            <Route path="/finance/expense" element={<Expense />} />
                            <Route path="/finance/reports" element={<Reports />} />

                            {/* Settings Routes */}
                            <Route path="/settings/general" element={<GeneralSettings />} />
                            <Route path="/settings/varisankhya-config" element={<VarisankhyaConfig />} />
                            <Route path="/settings/public-portal" element={<PublicPortalSettings />} />

                            {/* Community Routes */}
                            <Route path="/community/welfare" element={<Welfare />} />
                            <Route path="/community/death-registry" element={<DeathRegistry />} />
                            <Route path="/community/communication" element={<CommunicationCenter />} />

                            {/* Result Management Routes */}
                            <Route path="/results" element={<ResultManagement />} />
                            <Route path="/results/settings" element={<ResultSettingsPage />} />

                            {/* Islamic Library Routes */}
                            <Route path="/islamic-library/surah" element={<SurahLibrary />} />
                            <Route path="/islamic-library/dua" element={<DuaLibrary />} />

                            {/* Admin Routes */}
                            <Route path="/admin/marriages" element={<Marriages />} />

                            {/* Add other protected pages here */}
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SidebarProvider>
        </AuthProvider>
    );
}

export default App;
