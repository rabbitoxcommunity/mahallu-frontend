import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import { menuConfig } from "../../../configs/sidebarConfig";
import MenuItem from "./MenuItem";
import SubMenu from "./SubMenu";
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
    const { t, i18n } = useTranslation();

    const role = user?.role || "user";

    const filteredMenu = menuConfig.map(section => ({
        ...section,
        items: section.items.filter(item => {
            // SuperAdmin and PlatformAdmin bypass all permission checks
            if (role === "superAdmin" || role === "platformAdmin") {
                return item.roles.includes(role);
            }
            
            // For Admin role, check both role AND permissions
            if (role === "admin") {
                const hasRoleAccess = item.roles.includes(role);
                const requiredPermission = item.permission;
                const hasPermission = requiredPermission ? user?.permissions?.[requiredPermission] : true;
                
                return hasRoleAccess && hasPermission;
            }
            
            return item.roles.includes(role);
        })
    })).filter(section => section.items.length > 0);

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

    const sidebarVariants = {
        expanded: {
            width: "280px",
            transition: { duration: 0.25, ease: "easeInOut" }
        },
        collapsed: {
            width: "88px",
            transition: { duration: 0.25, ease: "easeInOut" }
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobile}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Sidebar */}
            <motion.aside
                initial={false}
                animate={isMobileOpen ? { x: 0 } : window.innerWidth < 1024 ? { x: "-100%" } : isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className={`
                    fixed top-0 left-0 h-full bg-white dark:bg-[#16171d] border-r border-gray-200 dark:border-gray-800 z-50
                    flex flex-col transition-all duration-300 ease-in-out
                    ${isMobileOpen ? 'shadow-2xl' : ''}
                `}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10  flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-full h-full object-cover" />
                        </div>
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col overflow-hidden"
                                >
                                    <span className="font-bold whitespace-nowrap text-xl leading-none text-[#0B65F6]">Mahallu</span>
                                    <span className="font-light whitespace-nowrap text-md leading-none text-gray-900 dark:text-gray-400">Connect</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Menu Items */}
                <div className={`flex-1 px-4 space-y-8 scrollbar-hide py-2 ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
                    {filteredMenu.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            {!isCollapsed && (
                                <h3 className="text-xs font-bold text-gray-400 px-3 tracking-widest uppercase mb-3 ">
                                    {t(section.title)}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    item.subItems ? (
                                        <SubMenu key={itemIdx} item={item} />
                                    ) : (
                                        <MenuItem key={itemIdx} item={item} />
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions & User Section */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    {/* User Profile */}
                    <div className={`
                        flex items-center gap-3 p-2
                        ${isCollapsed ? 'justify-center' : 'bg-gray-50 dark:bg-gray-800/50 rounded-2xl'}
                    `}>
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-200 cursor-pointer shadow-sm">
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                        )}
                    </div>

                    {/* Language Switch & Logout - Only show if not collapsed, otherwise just an icon */}
                    {!isCollapsed ? (
                        <div className="space-y-2">
                            {/* Language Selector */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <select
                                    value={i18n.language}
                                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B65F6] appearance-none cursor-pointer transition-all shadow-sm hover:border-blue-300 dark:hover:border-gray-600"
                                >
                                    <option value="en">English</option>
                                    <option value="ml">മലയാളം</option>
                                </select>
                                {/* Custom arrow to replace native select arrow */}
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronRight size={14} className="text-gray-400 rotate-90" />
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button 
                                onClick={handleLogout} 
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-500 dark:bg-red-500/10 dark:hover:bg-red-500 rounded-xl transition-colors shadow-sm"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 items-center pt-2">
                            <button
                                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ml' : 'en')}
                                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors text-xs font-bold text-gray-500"
                                title="Switch Language"
                            >
                                {i18n.language === 'en' ? 'EN' : 'ML'}
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 flex items-center justify-center transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50 hidden lg:flex"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </motion.aside>
        </>
    );
};

export default Sidebar;
