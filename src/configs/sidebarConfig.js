import { 
    LayoutDashboard, 
    Box, 
    Mail, 
    Flag, 
    Calendar, 
    UserCircle,
    MessageSquare
} from "lucide-react";

export const menuConfig = [
    {
        title: "MAIN",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/dashboard",
                roles: ["admin", "superAdmin"],
                subItems: [
                    { label: "Overview", path: "/dashboard", roles: ["admin", "superAdmin"] },
                    { label: "Analytics", path: "/dashboard/analytics", roles: ["admin", "superAdmin"] }
                ]
            },
            {
                label: "Products",
                icon: Box,
                path: "/products",
                roles: ["admin", "superAdmin"],
                subItems: [
                    { label: "Inventory", path: "/products/inventory", roles: ["admin", "superAdmin"] },
                    { label: "Categories", path: "/products/categories", roles: ["admin", "superAdmin"] }
                ]
            },
            {
                label: "Mail",
                icon: Mail,
                path: "/mail",
                roles: ["admin", "superAdmin"],
                badge: "12"
            },
            {
                label: "Campaigns",
                icon: Flag,
                path: "/campaigns",
                roles: ["admin", "superAdmin"],
                subItems: [
                    { label: "Active", path: "/campaigns/active", roles: ["admin", "superAdmin"] },
                    { label: "History", path: "/campaigns/history", roles: ["admin", "superAdmin"] }
                ]
            },
            {
                label: "Calendar",
                icon: Calendar,
                path: "/calendar",
                roles: ["admin", "superAdmin"]
            },
            {
                label: "Contacts",
                icon: UserCircle,
                path: "/contacts",
                roles: ["admin", "superAdmin"]
            }
        ]
    },
    {
        title: "ACCOUNT",
        items: [
            {
                label: "Chat",
                icon: MessageSquare,
                path: "/chat",
                roles: ["admin", "superAdmin"],
                badge: "8",
                badgeColor: "bg-[#FFB100] text-white"
            }
        ]
    }
];
