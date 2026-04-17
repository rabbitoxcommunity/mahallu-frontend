import {
    LayoutDashboard,
    Box,
    Mail,
    Flag,
    Calendar,
    UserCircle,
    MessageSquare,
    Wallet,
    CreditCard
} from "lucide-react";
import { permissionModules } from "./permissionModules";

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
                    { label: "അനുമതി", path: "/super-admin", roles: ["superAdmin"] },
                    { label: "അനലിറ്റിക്സ്", path: "/analytics", roles: ["superAdmin"] }
                ]
            },
            {
                label: "കുടുംബ വിവരങ്ങൾ",
                icon: Box,
                path: "/family",
                permission: "family",
                roles: ["superAdmin"],
                subItems: [
                    { label: "കുടുംബ രജിസ്ട്രേഷൻ", path: "/family/register", roles: ["superAdmin"] },
                    { label: "വീട് രജിസ്ട്രേഷൻ", path: "/family/house/register", roles: ["superAdmin"] },
                    { label: "അംഗങ്ങളുടെ രജിസ്ട്രേഷൻ", path: "/family/member/register", roles: ["superAdmin"] }
                ]
            },
            {
                label: "ഫിനാൻസ്",
                icon: Wallet,
                path: "/finance",
                permission: "finance",
                roles: ["admin", "superAdmin"],
                subItems: [
                    { label: "വരിസംഖ്യ", path: "/finance/varisankhya", roles: ["admin", "superAdmin"] }
                ]
            },
            // Dynamically generate menu items from permission modules
            ...permissionModules
                .filter(module => module.key !== 'family') // Exclude family as it's handled above
                .map(module => ({
                    label: module.label,
                    icon: module.icon,
                    path: `/${module.key}`,
                    permission: module.key,
                    roles: ["admin", "superAdmin"]
                }))
        ]
    },
];
