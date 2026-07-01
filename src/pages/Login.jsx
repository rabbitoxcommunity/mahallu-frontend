import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getFirstAccessiblePath } from "../utils/permissions";

export default function Login() {
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Prevent authenticated users from lingering on login page.
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const storedUser = localStorage.getItem("user");
                const user = storedUser ? JSON.parse(storedUser) : null;
                navigate(getFirstAccessiblePath(user), { replace: true });
            } catch (err) {
                console.error("Invalid token found during redirect check", err);
            }
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const res = await api.post("/auth/login", data);
            if (res.data && res.data.token) {
                // Use the centralized login function to update state immediately
                login(res.data.user, res.data.token);
                toast.success("Login successful!");
                navigate(getFirstAccessiblePath(res.data.user), { replace: true });
            }
        } catch (err) {
            // Error is handled globally by axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 bg-white">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo area */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-14 h-14  flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-none">Mahallu</div>
                            <div className="font-light text-gray-900 dark:text-gray-400 leading-none">Connect</div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in to your Account</h2>
                    <p className="text-gray-500 mb-8">Welcome back! Please enter your details.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={`w-full pl-11  pr-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] focus:border-transparent transition-colors text-gray-900`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && <p className="mt-1  text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={`w-full pl-11  pr-12 py-3 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] focus:border-transparent transition-colors text-gray-900`}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {errors.password && <p className="mt-1  text-red-500">{errors.password.message}</p>}
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#0B65F6] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Log in"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#0B65F6] flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative background circles matching image abstractness */}
                <div className="absolute w-[600px] h-[600px] bg-[#1a71f7] rounded-full flex items-center justify-center opacity-80">
                    <div className="w-[450px] h-[450px] bg-[#2d7df8] rounded-full flex items-center justify-center">
                        <div className="w-[300px] h-[300px] bg-[#3f88f9] rounded-full"></div>
                    </div>
                </div>

                {/* Dashboard abstract illustration */}
                <div className="relative z-10 w-full max-w-sm mt-8">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden min-h-[300px] flex flex-col relative z-20">
                        {/* Window header */}
                        <div className="bg-gray-50 border-b border-gray-100 flex items-center gap-2 px-4 py-3">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="ml-auto w-16 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                        {/* Window body */}
                        <div className="p-5 flex-1 flex flex-col gap-4">
                            {/* Mock bar */}
                            <div className="w-1/3 h-3 bg-gray-200 rounded-full mb-2"></div>
                            {/* Mock items */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="w-1/2 h-2.5 bg-gray-200 rounded-full"></div>
                                        <div className="w-3/4 h-2 bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connecting lines */}
                    <div className="absolute top-1/2 -left-16 w-16 h-1 bg-[#478df8] z-0 -translate-y-1/2"></div>
                    <div className="absolute top-20 -left-12 w-12 h-1 bg-[#478df8] z-0"></div>
                    <div className="absolute top-20 -left-12 w-1 h-[100px] bg-[#478df8] z-0"></div>

                    {/* Floating nodes to mimic the image */}
                    <div className="absolute -left-12 top-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-[#0B65F6] z-10">
                        {/* Purple Icon Mock */}
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                    </div>

                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-[#0B65F6] z-10">
                        {/* Blue Box Mock */}
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                    </div>

                    <div className="absolute -left-12 bottom-12 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-[#0B65F6] z-10">
                        <span className="text-xl font-bold text-red-500">G</span>
                    </div>
                </div>

                <div className="relative z-10 text-center mt-12 text-white max-w-sm">
                    <h3 className="text-2xl font-bold mb-3 tracking-wide">Connect with every application.</h3>
                    <p className="text-blue-100 ">Everything you need in an easily customizable dashboard.</p>

                    {/* Pagination dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}