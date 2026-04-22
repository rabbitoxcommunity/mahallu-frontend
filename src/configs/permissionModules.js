import {
  Wallet,
  LayoutDashboard,
  Box,
  Settings
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
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "കുടുംബ രജിസ്ട്രേഷൻ", path: "/family/register", roles: ["admin", "superAdmin"] },
      { label: "വീട് രജിസ്ട്രേഷൻ", path: "/family/house/register", roles: ["admin", "superAdmin"] },
      { label: "അംഗങ്ങളുടെ രജിസ്ട്രേഷൻ", path: "/family/member/register", roles: ["admin", "superAdmin"] }
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
      { label: "വരിസംഖ്യ", path: "/finance/varisankhya", roles: ["admin", "superAdmin"] },
      { label: "വരുമാനം", path: "/finance/income", roles: ["admin", "superAdmin"] },
      { label: "Expense", path: "/finance/expense", roles: ["admin", "superAdmin"] }
    ]
  },
  {
    key: 'settings',
    label: 'ക്രമീകരണങ്ങൾ',
    icon: Settings,
    path: "/settings/general",
    description: 'Manage general settings',
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "Income Category", path: "/settings/general", roles: ["admin", "superAdmin"] }
    ]
  },
];

export default permissionModules;
