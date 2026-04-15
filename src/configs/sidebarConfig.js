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
                label: "ഡാഷ്ബോർഡ്",
                icon: LayoutDashboard,
                path: "/dashboard",
                roles: ["admin", "superAdmin"],
                subItems: [
                    { label: "സേവനങ്ങൾ", path: "/dashboard", roles: ["admin", "superAdmin"] },
                    { label: "വിശകലനം", path: "/analytics", roles: ["admin", "superAdmin"] }
                ]
            },
            {
                label: "കുടുംബ വിരങ്ങൾ",
                icon: Box,
                path: "/family",
                permission: "family", // Add permission key
                roles: ["superAdmin"],
                subItems: [
                    { label: "കുടുംബ രജിസ്ട്രേഷൻ", path: "/family/register", roles: ["superAdmin"] },
                    { label: "വീടിൻ്റെ രജിസ്ട്രേഷൻ", path: "/family/house/register", roles: ["superAdmin"] },
                    { label: "അംഗങ്ങളുടെ രജിസ്ട്രേഷൻ", path: "/family/member/register", roles: ["superAdmin"] }
                ]
            },
            {
                label: "Payments",
                icon: Mail,
                path: "/payments",
                permission: "payments", // Admin needs payments permission
                roles: ["admin", "superAdmin"]
            },
            {
                label: "Campaigns", 
                icon: Calendar,
                path: "/campaigns",
                permission: "campaigns", // Admin needs campaigns permission
                roles: ["admin", "superAdmin"]
            },
            {
                label: "Reports",
                icon: MessageSquare,
                path: "/reports", 
                permission: "reports", // Admin needs reports permission
                roles: ["admin", "superAdmin"]
            },
            {
                label: "Settings",
                icon: Flag,
                path: "/settings",
                permission: "settings", // Admin needs settings permission
                roles: ["admin", "superAdmin"]
            }
        ]
    },
];
