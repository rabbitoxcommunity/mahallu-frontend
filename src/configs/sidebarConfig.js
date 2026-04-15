import {
    LayoutDashboard,
    Box,
    Mail,
    Flag,
    Calendar,
    UserCircle,
    MessageSquare
} from "lucide-react";
import { permissionModules } from "./permissionModules";

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
                    { label: "Services", path: "/dashboard", roles: ["admin", "superAdmin"] },
                    { label: "Analytics", path: "/analytics", roles: ["admin", "superAdmin"] }
                ]
            },
            {
                label: "Family Management",
                icon: Box,
                path: "/family",
                permission: "family",
                roles: ["superAdmin"],
                subItems: [
                    { label: "Family Registration", path: "/family/register", roles: ["superAdmin"] },
                    { label: "House Registration", path: "/family/house/register", roles: ["superAdmin"] },
                    { label: "Member Registration", path: "/family/member/register", roles: ["superAdmin"] }
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
