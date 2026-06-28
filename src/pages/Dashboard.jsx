import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Users, Home, UserCheck,
  CreditCard, IndianRupee, TrendingDown, BarChart3,
  Heart, HandHeart, BookOpen,
  Settings, Sliders, ChevronRight,
  Sparkles, MessageSquare, GraduationCap
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const FeatureCard = ({ icon: Icon, label, description, path, color }) => (
  <Link to={path} className="block h-full">
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative h-full flex flex-col p-6 bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/80 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${color} opacity-10 dark:opacity-5 blur-2xl rounded-full group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-lg shadow-black/5`}>
          <Icon size={24} className="text-white" strokeWidth={1.5} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRight size={16} className="text-gray-400 dark:text-gray-300" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end relative z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] transition-colors mb-1.5 leading-tight">
          {label}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  </Link>
);

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 mb-6">
    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800 dark:to-transparent" />
  </div>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    {
      titleKey: 'sidebar.family',
      items: [
        {
          icon: Users,
          labelKey: 'sidebar.familyRegistration',
          descKey: 'homeDashboard.desc.familyRegistration',
          path: '/family/register',
          color: 'bg-gradient-to-br from-[#0B65F6] to-blue-600',
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
          color: 'bg-gradient-to-br from-violet-500 to-purple-600',
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
          color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
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
          color: 'bg-gradient-to-br from-orange-500 to-red-500',
        },
        {
          icon: BarChart3,
          labelKey: 'sidebar.reports',
          descKey: 'homeDashboard.desc.financeReports',
          path: '/finance/reports',
          color: 'bg-gradient-to-br from-amber-500 to-orange-500',
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
          color: 'bg-gradient-to-br from-pink-500 to-rose-600',
        },
        {
          icon: BookOpen,
          labelKey: 'sidebar.deathRegistry',
          descKey: 'homeDashboard.desc.deathRegistry',
          path: '/community/death-registry',
          color: 'bg-gradient-to-br from-slate-600 to-slate-800',
        },
        {
          icon: Heart,
          labelKey: 'marriage.title',
          descKey: 'homeDashboard.desc.marriages',
          path: '/admin/marriages',
          color: 'bg-gradient-to-br from-rose-500 to-red-600',
        },
        {
          icon: MessageSquare,
          labelKey: 'sidebar.communication',
          descKey: 'homeDashboard.desc.communication',
          path: '/community/communication',
          color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
        },
      ],
    },
    {
      titleKey: 'sidebar.results',
      items: [
        {
          icon: GraduationCap,
          labelKey: 'sidebar.resultsList',
          descKey: 'homeDashboard.desc.resultsList',
          path: '/results',
          color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
        },
        {
          icon: Settings,
          labelKey: 'sidebar.resultSettings',
          descKey: 'homeDashboard.desc.resultSettings',
          path: '/results/settings',
          color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
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
          color: 'bg-gradient-to-br from-gray-600 to-gray-800',
        },
        {
          icon: Sliders,
          labelKey: 'finance.settings.varisankhyaConfig.title',
          descKey: 'homeDashboard.desc.varisankhyaConfig',
          path: '/settings/varisankhya-config',
          color: 'bg-gradient-to-br from-gray-500 to-gray-700',
        },
      ],
    },
  ];

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0B65F6] to-indigo-600 rounded-3xl p-8 sm:p-10 shadow-lg shadow-[#0B65F6]/20"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors rounded-full backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-4">
              <Sparkles size={14} className="text-yellow-300" />
              <span>{currentDate}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Admin'}! 👋
            </h1>
            <p className="text-blue-100 text-lg max-w-xl">
              {t('homeDashboard.description')}
            </p>
          </div>
          
          <div className="hidden lg:flex items-center justify-center">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center p-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <Home className="w-full h-full text-white opacity-90" />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-10"
      >
        {sections.map((section, idx) => (
          <motion.div 
            key={section.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <SectionHeader title={t(section.titleKey)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
