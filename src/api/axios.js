import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5005/api"
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global Error Handler
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong!";
        toast.error(message);

        if (error.response?.status === 401 && window.location.pathname !== "/login") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default instance;