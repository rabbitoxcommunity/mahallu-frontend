import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import ScrollToTop from "./components/ScrollToTop";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111217]">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-[#0B65F6] rounded-full animate-spin" />
    </div>
);

// Route guards (each pulls in its own layout, so keep them lazy too)
const PrivateRoute = lazy(() => import("./routes/PrivateRoute"));
const PlatformAdminRoute = lazy(() => import("./routes/PlatformAdminRoute"));

// Auth
const Login = lazy(() => import("./pages/Login"));

// Admin dashboard
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));

// Platform Admin
const PlatformAdminDashboard = lazy(() => import("./pages/PlatformAdmin/PlatformAdminDashboard"));
const TenantsList = lazy(() => import("./pages/PlatformAdmin/TenantsList"));
const CreateTenant = lazy(() => import("./pages/PlatformAdmin/CreateTenant"));
const EditTenant = lazy(() => import("./pages/PlatformAdmin/EditTenant"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/SuperAdminDashboard"));
const StaffList = lazy(() => import("./pages/SuperAdmin/StaffList"));
const CreateStaff = lazy(() => import("./pages/SuperAdmin/CreateStaff"));
const EditStaffPermissions = lazy(() => import("./pages/SuperAdmin/EditStaffPermissions"));

// Family
const FamilyRegistration = lazy(() => import("./pages/Family/FamilyRegistration"));
const HouseRegistration = lazy(() => import("./pages/Family/HouseRegistration"));
const AddFamily = lazy(() => import("./pages/Family/AddFamily"));
const AddHouse = lazy(() => import("./pages/Family/AddHouse"));
const MemberRegistration = lazy(() => import("./pages/Family/MemberRegistration"));
const AddMember = lazy(() => import("./pages/Family/AddMember"));
const HouseDetailedView = lazy(() => import("./pages/Family/HouseDetailedView"));
const MemberDetailedView = lazy(() => import("./pages/Family/MemberDetailedView"));

// Finance
const Varisankhya = lazy(() => import("./pages/Finance/Varisankhya"));
const Income = lazy(() => import("./pages/Finance/Income").then(m => ({ default: m.Income })));
const Expense = lazy(() => import("./pages/Finance/Expense"));
const Reports = lazy(() => import("./pages/Finance/Reports"));

// Settings
const GeneralSettings = lazy(() => import("./pages/Settings/GeneralSettings"));
const OrganizationInfo = lazy(() => import("./pages/Settings/OrganizationInfo"));
const VarisankhyaConfig = lazy(() => import("./pages/Settings/VarisankhyaConfig"));
const PublicPortalSettings = lazy(() => import("./pages/Settings/PublicPortalSettings"));

// Community
const Welfare = lazy(() => import("./pages/community/Welfare"));
const DeathRegistry = lazy(() => import("./pages/community/DeathRegistry"));
const CommunicationCenter = lazy(() => import("./pages/community/CommunicationCenter"));

// Results
const ResultManagement = lazy(() => import("./pages/results/ResultManagement"));
const ResultSettingsPage = lazy(() => import("./pages/results/ResultSettingsPage"));

// Islamic Library
const SurahLibrary = lazy(() => import("./pages/IslamicLibrary/SurahLibrary"));
const DuaLibrary = lazy(() => import("./pages/IslamicLibrary/DuaLibrary"));

// Admin
const Marriages = lazy(() => import("./pages/Admin/Marriages"));
const MarriageNoc = lazy(() => import("./pages/Admin/MarriageNoc"));
const NikahRegister = lazy(() => import("./pages/Admin/NikahRegister"));
const GeneralCertificate = lazy(() => import("./pages/Admin/GeneralCertificate"));

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
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Redirect Root to Login */}
                            <Route path="/" element={<Navigate to="/login" replace />} />

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
                                <Route path="/finance" element={<Navigate to="/finance/varisankhya" replace />} />
                                <Route path="/finance/varisankhya" element={<Varisankhya />} />
                                <Route path="/finance/income" element={<Income />} />
                                <Route path="/finance/expense" element={<Expense />} />
                                <Route path="/finance/reports" element={<Reports />} />

                                {/* Settings Routes */}
                                <Route path="/settings/general" element={<GeneralSettings />} />
                                <Route path="/settings/organization" element={<OrganizationInfo />} />
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
                                <Route path="/admin/marriage-noc" element={<MarriageNoc />} />
                                <Route path="/admin/nikah-register" element={<NikahRegister />} />
                                <Route path="/admin/general-certificate" element={<GeneralCertificate />} />

                                {/* Add other protected pages here */}
                            </Route>
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </SidebarProvider>
        </AuthProvider>
    );
}

export default App;
