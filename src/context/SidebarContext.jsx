import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [tooltip, setTooltip] = useState(null); // { label, rect }

    // Close mobile sidebar on larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false);
                setTooltip(null);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        setTooltip(null);
    };
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider 
            value={{ 
                isCollapsed, 
                setIsCollapsed, 
                toggleCollapse, 
                isMobileOpen, 
                toggleMobile, 
                closeMobile,
                tooltip,
                setTooltip
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
