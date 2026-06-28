import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Gift,
  FolderHeart,
  BarChart3
} from 'lucide-react';;;
import WelfareDashboard from '../../components/community/welfare/Dashboard';
import Beneficiaries from '../../components/community/welfare/Beneficiaries';
import Distribution from '../../components/community/welfare/Distribution';
import Programs from '../../components/community/welfare/Programs';
import Reports from '../../components/community/welfare/Reports';

const TABS = [
  { id: 'dashboard', labelKey: 'welfare.tabs.dashboard', icon: LayoutDashboard },
  { id: 'beneficiaries', labelKey: 'welfare.tabs.beneficiaries', icon: Users },
  { id: 'distribution', labelKey: 'welfare.tabs.distribution', icon: Gift },
  { id: 'programs', labelKey: 'welfare.tabs.programs', icon: FolderHeart },
  { id: 'reports', labelKey: 'welfare.tabs.reports', icon: BarChart3 }
];

const Welfare = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preselectedFamily, setPreselectedFamily] = useState(null);

  const handleNewDistribution = (house) => {
    setPreselectedFamily(house);
    setActiveTab('distribution');
  };

  const handleClearPreselected = () => {
    setPreselectedFamily(null);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WelfareDashboard />;
      case 'beneficiaries':
        return <Beneficiaries onNewDistribution={handleNewDistribution} />;
      case 'distribution':
        return (
          <Distribution
            preselectedFamily={preselectedFamily}
            onClearPreselected={handleClearPreselected}
          />
        );
      case 'programs':
        return <Programs />;
      case 'reports':
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('welfare.title')}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">
          {t('welfare.description')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${index === TABS.length - 1 ? 'col-span-2 sm:col-span-1' : ''}
                  ${isActive
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className="shrink-0" />
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Welfare;
