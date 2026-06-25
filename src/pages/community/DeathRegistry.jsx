import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, BarChart3 } from 'lucide-react';
import DeathDashboard from '../../components/community/death/Dashboard';
import DeathTable from '../../components/community/death/DeathTable';
import DeathReports from '../../components/community/death/Reports';

const TABS = [
    { id: 'dashboard', labelKey: 'death.tabs.dashboard', icon: LayoutDashboard },
    { id: 'registry', labelKey: 'death.tabs.registry', icon: BookOpen },
    { id: 'reports', labelKey: 'death.tabs.reports', icon: BarChart3 },
];

const DeathRegistry = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderTab = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DeathDashboard />;
            case 'registry':
                return <DeathTable />;
            case 'reports':
                return <DeathReports />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('death.title')}
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('death.description')}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                                    transition-all duration-200 flex-shrink-0
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="deathActiveTab"
                                        className="absolute inset-0 bg-blue-600 rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={16} />
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

export default DeathRegistry;
