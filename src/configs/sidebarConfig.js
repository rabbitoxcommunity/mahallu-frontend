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
                label: "കുടുംബ വിവരങ്ങൾ",
                icon: Box,
                path: "/products",
                roles: ["superAdmin"],
                subItems: [
                    { label: "കുടുംബ രജിസ്ട്രേഷൻ", path: "/family/register", roles: ["superAdmin"] },
                    { label: "വീടിൻ്റെ രജിസ്ട്രേഷൻ", path: "/family/house/register", roles: ["superAdmin"] }
                ]
            },
            // {
            //     label: "Calendar",
            //     icon: Calendar,
            //     path: "/calendar",
            //     roles: ["admin", "superAdmin"]
            // },
        ]
    },
];
