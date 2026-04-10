import Sidebar from "./Sidebar";
import { useSidebar } from "../../context/SidebarContext";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

const DashboardLayout = ({ children }) => {
    const { isCollapsed, toggleMobile } = useSidebar();

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
                <header className="lg:hidden h-16 bg-white dark:bg-[#16171d] border-b border-gray-200 dark:border-gray-800 px-4 flex items-center">
                    <button 
                        onClick={toggleMobile}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="ml-4 font-bold text-gray-900 dark:text-gray-100">Mahallu CRM</span>
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
