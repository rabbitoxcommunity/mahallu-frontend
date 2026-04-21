import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to refresh permissions from backend
    const refreshPermissions = async () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const response = await axios.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const freshUser = response.data.user;
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
            return freshUser;
        } catch (error) {
            console.error('Error refreshing permissions:', error);
            if (error.response?.status === 404) {
                // User not found, logout and navigate to login page
                logout();
            }
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Parse JWT token to get basic data
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const storedUser = localStorage.getItem("user");
                
                // Use JWT token data but merge with stored user data
                const freshUserData = storedUser ? 
                    { ...JSON.parse(storedUser), ...decodedToken } : 
                    decodedToken;
                
                setUser(freshUserData);
                
                // Refresh permissions from backend to get latest data
                refreshPermissions();
            } catch (error) {
                console.error('Error parsing JWT token:', error);
                // Fallback to stored user data if token parsing fails
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Merge user data with JWT token data to ensure permissions are included
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const mergedUserData = { ...userData, ...decodedToken };
            setUser(mergedUserData);
            localStorage.setItem("user", JSON.stringify(mergedUserData));
        } catch (error) {
            console.error('Error merging JWT data:', error);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
        localStorage.setItem("token", token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshPermissions }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
