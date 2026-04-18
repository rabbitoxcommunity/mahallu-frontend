
import { permissionModules } from "./permissionModules";

export const menuConfig = [
    {
        title: "MAIN",
        items: [
            // Dynamically generate menu items from permission modules
            ...permissionModules.map(module => ({
                    label: module.label,
                    icon: module.icon,
                    path: module.path || `/${module.key}`,
                    permission: module.permission || module.key,
                    roles: module.roles || ["admin", "superAdmin"],
                    subItems: module.subItems || undefined
                }))
        ]
    },
];
