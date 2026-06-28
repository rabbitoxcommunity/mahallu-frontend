import React from 'react';
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { LogOut } from "lucide-react";

const PlatformAdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const handleLogout = () => {
        Swal.fire({
            title: "Sign Out",
            text: "Are you sure you want to log out of your session?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0B65F6",
            cancelButtonColor: "#000",
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-3xl shadow-2xl border border-gray-100",
                confirmButton: "rounded-xl px-6 py-2.5 font-bold transition-transform active:scale-95",
                cancelButton: "rounded-xl px-6 py-2.5 text-gray-500 font-bold transition-transform active:scale-95"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111217] flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white dark:bg-[#16171d] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-8">
                            <Link to="/platform-admin" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold whitespace-nowrap text-xl leading-none text-[#0B65F6]">Mahallu</span>
                                    <span className="font-light whitespace-nowrap text-md leading-none text-gray-900 dark:text-gray-400">Connect</span>
                                </div>
                            </Link>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-4">
                            {/* Language Selector */}
                            <select
                                value={i18n.language}
                                onChange={(e) => i18n.changeLanguage(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                            >
                                <option value="en">{t('language.english') || 'English'}</option>
                                <option value="ml">{t('language.malayalam') || 'Malayalam'}</option>
                            </select>

                            {/* User Profile & Logout */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Admin User'}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default PlatformAdminLayout;
