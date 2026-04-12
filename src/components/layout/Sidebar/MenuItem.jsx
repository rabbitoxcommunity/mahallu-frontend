import { NavLink } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

const MenuItem = ({ item }) => {
    const { isCollapsed, closeMobile } = useSidebar();
    const Icon = item.icon;

    return (
        <NavLink
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group hover:z-50
                ${isActive
                    ? "bg-[#0B65F6] text-white shadow-lg shadow-blue-500/30"
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
                        <span className="text-xs font-medium whitespace-nowrap ml-1">
                            {item.label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Badges */}
            {item.badge && !isCollapsed && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                    {item.badge}
                </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className="absolute text-xs left-[calc(100%+12px)] px-3 py-2 bg-gray-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible shadow-xl z-[9999] whitespace-nowrap">
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
            )}
        </NavLink>
    );
};

export default MenuItem;
