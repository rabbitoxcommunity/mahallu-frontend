import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import { menuConfig } from "../../../configs/sidebarConfig";
import MenuItem from "./MenuItem";
import SubMenu from "./SubMenu";
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();

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
                                <h3 className="text-[10px] font-bold text-gray-400 px-3 tracking-widest uppercase mb-3 text-xs">
                                    {section.title}
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

                {/* User Section & Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <div className={`
                        flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl
                        ${isCollapsed ? 'justify-center border-none bg-transparent' : ''}
                    `}>
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-200 cursor-pointer">
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button onClick={handleLogout} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors group">
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
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
