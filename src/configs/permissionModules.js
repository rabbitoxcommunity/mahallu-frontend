import {
  Wallet,
  LayoutDashboard,
  Box,
  Settings,
  HandHeart,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Moon,
  FileText,
} from 'lucide-react';

export const permissionModules = [
  {
    key: 'dashboard',
    label: "sidebar.dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin", "superAdmin"],
    description: 'Manage dashboard and analytics',
    subItems: [
      { label: "sidebar.services", path: "/dashboard", roles: ["admin", "superAdmin"] },
      { label: "sidebar.permissions", path: "/super-admin", roles: ["superAdmin"] }
    ]
  },
  {
    key: 'family',
    label: "sidebar.family",
    description: 'Manage family records and members',
    icon: Box,
    path: "/family",
    permission: "family",
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "sidebar.familyRegistration", path: "/family/register", roles: ["admin", "superAdmin"] },
      { label: "sidebar.houseRegistration", path: "/family/house/register", roles: ["admin", "superAdmin"] },
      { label: "sidebar.memberRegistration", path: "/family/member/register", roles: ["admin", "superAdmin"] }
    ]
  },
  {
    key: 'finance',
    label: "sidebar.finance",
    icon: Wallet,
    path: "/finance",
    permission: "finance",
    description: 'Manage finance records and members',
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "sidebar.varisankhya", path: "/finance/varisankhya", roles: ["admin", "superAdmin"] },
      { label: "sidebar.income", path: "/finance/income", roles: ["admin", "superAdmin"] },
      { label: "sidebar.expense", path: "/finance/expense", roles: ["admin", "superAdmin"] },
      { label: "sidebar.reports", path: "/finance/reports", roles: ["admin", "superAdmin"] }
    ]
  },
  {
    key: 'community',
    label: 'sidebar.community',
    icon: HandHeart,
    path: '/community/welfare',
    description: 'Manage community welfare programs',
    roles: ['admin', 'superAdmin'],
    subItems: [
      { label: 'sidebar.welfare', path: '/community/welfare', roles: ['admin', 'superAdmin'] },
      { label: 'sidebar.communication', path: '/community/communication', roles: ['admin', 'superAdmin'] }
    ]
  },
  {
    key: 'certificates',
    label: 'sidebar.certificates',
    icon: FileText,
    path: '/community/death-registry',
    description: 'Manage death and marriage certificates',
    roles: ['admin', 'superAdmin'],
    subItems: [
      { label: 'sidebar.deathRegistry', path: '/community/death-registry', roles: ['admin', 'superAdmin'] },
      { label: 'marriage.title', path: '/admin/marriages', roles: ['admin', 'superAdmin'] },
      { label: 'noc.sidebarLabel', path: '/admin/marriage-noc', roles: ['admin', 'superAdmin'] },
      { label: 'nikahRegister.sidebarLabel', path: '/admin/nikah-register', roles: ['admin', 'superAdmin'] },
      { label: 'generalCert.sidebarLabel', path: '/admin/general-certificate', roles: ['admin', 'superAdmin'] }
    ]
  },
  {
    key: 'results',
    label: 'sidebar.results',
    icon: GraduationCap,
    path: '/results',
    permission: 'results',
    description: 'Manage madrasa exam results',
    roles: ['admin', 'superAdmin'],
    subItems: [
      { label: 'sidebar.resultsList', path: '/results', roles: ['admin', 'superAdmin'] },
      { label: 'sidebar.resultSettings', path: '/results/settings', roles: ['admin', 'superAdmin'] },
    ],
  },
  {
    key: 'settings',
    label: "sidebar.settings",
    icon: Settings,
    path: "/settings/general",
    description: 'Manage general settings',
    roles: ["admin", "superAdmin"],
    subItems: [
      { label: "sidebar.incomeCategory", path: "/settings/general", roles: ["admin", "superAdmin"] },
      { label: "finance.settings.varisankhyaConfig.title", path: "/settings/varisankhya-config", roles: ["admin", "superAdmin"] },
      { label: "settings.portalSettings", path: "/settings/public-portal", roles: ["admin", "superAdmin"] }
    ]
  },
  {
    key: 'islamicLibrary',
    label: 'sidebar.islamicLibrary',
    icon: Moon,
    path: '/islamic-library/surah',
    description: 'Manage Surah and Dua library',
    roles: ['admin', 'superAdmin'],
    subItems: [
      { label: 'sidebar.surahLibrary', path: '/islamic-library/surah', roles: ['admin', 'superAdmin'] },
      { label: 'sidebar.duaLibrary',   path: '/islamic-library/dua',   roles: ['admin', 'superAdmin'] },
    ],
  },
];

export default permissionModules;
