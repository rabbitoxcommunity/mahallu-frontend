import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const SubMenu = ({ item }) => {
    const { isCollapsed, closeMobile } = useSidebar();
    const { pathname } = useLocation();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const role = user?.role || "user";


    // Filter subItems based on user role and permissions
    const filteredSubItems = item.subItems?.filter(subItem => {
        // SuperAdmin and PlatformAdmin bypass all permission checks
        if (role === "superAdmin" || role === "platformAdmin") {
            return subItem.roles?.includes(role);
        }
        
        // For Admin role, check both role AND permissions
        if (role === "admin") {
            const hasRoleAccess = subItem.roles?.includes(role);
            const requiredPermission = subItem.permission;
            const hasPermission = requiredPermission ? user?.permissions?.[requiredPermission] : true;
            
            return hasRoleAccess && hasPermission;
        }
        
        return subItem.roles?.includes(role);
    }) || [];

    // Auto-expand if a child route is active
    const isChildActive = filteredSubItems.some(sub => pathname === sub.path);
    const [isOpen, setIsOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setIsOpen(true);
        if (isCollapsed) setIsOpen(false);
    }, [isChildActive, isCollapsed]);

    const Icon = item.icon;

    return (
        <div className="flex flex-col">
            {/* Parent Item */}
            <button
                onClick={() => !isCollapsed && setIsOpen(!isOpen)}
                className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full hover:z-50
                    ${isChildActive
                        ? "bg-blue-50/50 text-[#0B65F6] dark:bg-blue-500/10"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                `}
            >
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6">
                    <Icon size={18} />
                </div>

                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-hidden"
                        >
                            <span className={` ${lang === 'en' ? '' : ''} font-medium whitespace-nowrap ml-1 flex items-center justify-between `}>
                                {t(item.label)}
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                    <div className="absolute left-[calc(100%+12px)] px-3 py-2 bg-gray-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible shadow-xl z-[9999] whitespace-nowrap">
                        {t(item.label)}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                )}
            </button>

            {/* Sub Items List */}
            <AnimatePresence>
                {!isCollapsed && isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/40 dark:bg-gray-800/10 rounded-b-xl"
                    >
                        <div className="pl-3 pr-0 py-1 flex flex-col gap-1 border-l-2 border-gray-100 dark:border-gray-800 ml-6 my-1">
                            {filteredSubItems.map((sub, idx) => (
                                <NavLink
                                    key={idx}
                                    to={sub.path}
                                    onClick={closeMobile}
                                    className={({ isActive }) => `
                                        ${lang === 'en' ? 'text-sm' : 'text-[13px]'} py-2 rounded-lg transition-colors
                                        ${isActive
                                            ? "text-[#0B65F6] font-bold"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                                        }
                                    `}
                                >
                                    {t(sub.label)}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubMenu;
