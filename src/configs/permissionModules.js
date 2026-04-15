import {
  Users,
  CreditCard,
  Calendar,
  BarChart,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const permissionModules = [
  {
    key: 'family',
    label: 'കുടുംബ മാനേജ്മെന്റ്',
    icon: Users,
    description: 'Manage family records and members'
  },
  {
    key: 'payments',
    label: 'പേയ്‌മെന്റുകൾ',
    icon: CreditCard,
    description: 'Handle payments and transactions'
  },
  {
    key: 'campaigns',
    label: 'കാമ്പയ്‌നുകൾ',
    icon: Calendar,
    description: 'Manage campaigns and events'
  },
  {
    key: 'reports',
    label: 'റിപ്പോർട്ടുകൾ',
    icon: BarChart,
    description: 'View and generate reports'
  },
  {
    key: 'settings',
    label: 'സെറ്റിംഗുകൾ',
    icon: Settings,
    description: 'Access system settings'
  }
];

export default permissionModules;
