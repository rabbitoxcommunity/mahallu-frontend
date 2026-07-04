import Sidebar from "./Sidebar";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, ChevronDown, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const DashboardLayout = ({ children }) => {
    const { isCollapsed, toggleMobile } = useSidebar();
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        if (i18n.language === 'en') {
            document.documentElement.style.fontSize = '16px';
        } else {
            document.documentElement.style.fontSize = '15px';
        }
    }, [i18n.language]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        Swal.fire({
            title: "Sign Out",
            text: "Are you sure you want to log out of your session?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0B65F6",
            cancelButtonColor: "#000",
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            },
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
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#111217]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main 
                className={`
                    flex-1 flex flex-col transition-all duration-300
                    ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}
                `}
            >
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white dark:bg-[#16171d] border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={toggleMobile}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="ml-4 font-bold text-gray-900 dark:text-gray-100">{user?.tenant_name || 'Mahallu'} CRM</span>
                    </div>

                    <div className="flex items-center gap-1">
                    {/* Refresh Page (mobile only) */}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Refresh page"
                    >
                        <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <ChevronDown
                                size={14}
                                className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <div className="p-2">
                                        <select
                                            value={i18n.language}
                                            onChange={(e) => i18n.changeLanguage(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                                        >
                                            <option value="en">{t('language.english')}</option>
                                            <option value="ml">{t('language.malayalam')}</option>
                                        </select>
                                    </div>
                                    <div className="p-2 pt-0">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-500 dark:bg-red-500/10 dark:hover:bg-red-500 rounded-xl transition-colors"
                                        >
                                            <LogOut size={16} />
                                            {t('common.logout')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8 flex-1 overflow-x-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
