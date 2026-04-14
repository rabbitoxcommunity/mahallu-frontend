import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import FamilyRegistration from "./pages/Family/FamilyRegistration";
import HouseRegistration from "./pages/Family/Houseregistration";
import AddFamily from "./pages/Family/AddFamily";
import AddHouse from "./pages/Family/AddHouse";
import MemberRegistration from "./pages/Family/MemberRegistration";
import AddMember from "./pages/Family/AddMember";
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
                            
                            {/* Family Routes */}
                            <Route path="/family/register" element={<FamilyRegistration />} />
                            <Route path="/family/register/create" element={<AddFamily />} />
                            
                            {/* House Routes */}
                            <Route path="/family/house/register" element={<HouseRegistration />} />
                            <Route path="/family/house/add" element={<AddHouse />} />
                            
                            {/* Member Routes */}
                            <Route path="/family/member/register" element={<MemberRegistration />} />
                            <Route path="/family/member/add" element={<AddMember />} />
                            
                            {/* Add other protected pages here */}
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SidebarProvider>
        </AuthProvider>
    );
}

export default App;
