import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
    return (
        <BrowserRouter>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Login />} />
                
                {/* Protected Routes Wrapper */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Add any other protected pages here in the future:
                    <Route path="/settings" element={<Settings />} />
                    */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
