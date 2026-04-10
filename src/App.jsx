import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

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
                            {/* Add other protected pages here */}
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SidebarProvider>
        </AuthProvider>
    );
}

export default App;
