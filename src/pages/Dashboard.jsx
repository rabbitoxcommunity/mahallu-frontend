import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, Home, UserCheck,
  CreditCard, IndianRupee, TrendingDown, BarChart3,
  Heart, HandHeart, BookOpen,
  Settings, Sliders, LayoutDashboard,
  ChevronRight
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const FeatureCard = ({ icon: Icon, label, description, path, color }) => (
  <Link to={path}>
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      className="group flex items-center gap-4 p-4 bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200 cursor-pointer"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] transition-colors truncate">
          {label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-[#0B65F6] shrink-0 transition-colors" />
    </motion.div>
  </Link>
);

const SectionHeader = ({ title }) => (
  <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
    {title}
  </h2>
);

export default function Dashboard() {
  const { t } = useTranslation();

  const sections = [
    {
      titleKey: 'sidebar.family',
      items: [
        {
          icon: Users,
          labelKey: 'sidebar.familyRegistration',
          descKey: 'homeDashboard.desc.familyRegistration',
          path: '/family/register',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
          icon: Home,
          labelKey: 'sidebar.houseRegistration',
          descKey: 'homeDashboard.desc.houseRegistration',
          path: '/family/house/register',
          color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        },
        {
          icon: UserCheck,
          labelKey: 'sidebar.memberRegistration',
          descKey: 'homeDashboard.desc.memberRegistration',
          path: '/family/member/register',
          color: 'bg-gradient-to-br from-violet-500 to-violet-600',
        },
      ],
    },
    {
      titleKey: 'sidebar.finance',
      items: [
        {
          icon: CreditCard,
          labelKey: 'sidebar.varisankhya',
          descKey: 'homeDashboard.desc.varisankhya',
          path: '/finance/varisankhya',
          color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        },
        {
          icon: IndianRupee,
          labelKey: 'sidebar.income',
          descKey: 'homeDashboard.desc.income',
          path: '/finance/income',
          color: 'bg-gradient-to-br from-green-500 to-green-600',
        },
        {
          icon: TrendingDown,
          labelKey: 'sidebar.expense',
          descKey: 'homeDashboard.desc.expense',
          path: '/finance/expense',
          color: 'bg-gradient-to-br from-orange-500 to-orange-600',
        },
        {
          icon: BarChart3,
          labelKey: 'sidebar.reports',
          descKey: 'homeDashboard.desc.financeReports',
          path: '/finance/reports',
          color: 'bg-gradient-to-br from-amber-500 to-amber-600',
        },
      ],
    },
    {
      titleKey: 'sidebar.community',
      items: [
        {
          icon: HandHeart,
          labelKey: 'sidebar.welfare',
          descKey: 'homeDashboard.desc.welfare',
          path: '/community/welfare',
          color: 'bg-gradient-to-br from-pink-500 to-pink-600',
        },
        {
          icon: BookOpen,
          labelKey: 'sidebar.deathRegistry',
          descKey: 'homeDashboard.desc.deathRegistry',
          path: '/community/death-registry',
          color: 'bg-gradient-to-br from-slate-500 to-slate-600',
        },
        {
          icon: Heart,
          labelKey: 'marriage.title',
          descKey: 'homeDashboard.desc.marriages',
          path: '/admin/marriages',
          color: 'bg-gradient-to-br from-rose-500 to-rose-600',
        },
      ],
    },
    {
      titleKey: 'sidebar.settings',
      items: [
        {
          icon: Settings,
          labelKey: 'sidebar.incomeCategory',
          descKey: 'homeDashboard.desc.generalSettings',
          path: '/settings/general',
          color: 'bg-gradient-to-br from-gray-500 to-gray-600',
        },
        {
          icon: Sliders,
          labelKey: 'finance.settings.varisankhyaConfig.title',
          descKey: 'homeDashboard.desc.varisankhyaConfig',
          path: '/settings/varisankhya-config',
          color: 'bg-gradient-to-br from-gray-400 to-gray-500',
        },
      ],
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('homeDashboard.title')}</h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">{t('homeDashboard.description')}</p>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        className="space-y-8"
      >
        {sections.map((section) => (
          <div key={section.titleKey}>
            <SectionHeader title={t(section.titleKey)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {section.items.map((item) => (
                <FeatureCard
                  key={item.path}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  description={t(item.descKey)}
                  path={item.path}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
