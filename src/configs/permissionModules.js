import {
  Wallet,
  LayoutDashboard,
  Box
} from 'lucide-react';

export const permissionModules = [
  {
    key: 'dashboard',
    label: "ഡാഷ്ബോർഡ്",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin", "superAdmin"],
    description: 'Manage dashboard and analytics',
    subItems: [
      { label: "സേവനങ്ങൾ", path: "/dashboard", roles: ["admin", "superAdmin"] },
      { label: "അനുമതി", path: "/super-admin", roles: ["superAdmin"] },
      { label: "അനലിറ്റിക്സ്", path: "/analytics", roles: ["superAdmin"] }
    ]
  },
  {
    key: 'family',
    label: "കുടുംബ വിവരങ്ങൾ",
    description: 'Manage family records and members',
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
    key: 'finance',
    label: 'ഫിനാൻസ്',
    icon: Wallet,
    path: "/finance",
    permission: "finance",
    description: 'Manage finance records and members',
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "വരിസംഖ്യ", path: "/finance/varisankhya", roles: ["admin", "superAdmin"] }
    ]
  },
];

export default permissionModules;
