import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({
    baseURL: "http://localhost:5005/api"
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
        return Promise.reject(error);
    }
);

export default instance;