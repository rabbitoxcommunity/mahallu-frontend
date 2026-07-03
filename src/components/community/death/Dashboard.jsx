import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getDeathDashboard } from '../../../api/deathService';

const SummaryCard = ({ icon: Icon, label, value, gradient }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${gradient}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </motion.div>
);

const SkeletonCard = () => (
    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="flex items-start justify-between">
            <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
    </div>
);

const DeathDashboard = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const d = await getDeathDashboard();
            setData(d);
        } catch (e) {
            // Handled by axios interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const summary = data?.summary || {};
    const monthly_stats = data?.monthly_stats || [];

    const summaryCards = [
        {
            label: t('death.dashboard.totalRecords'),
            value: summary.total_records || 0,
            icon: Users,
            gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            label: t('death.dashboard.thisMonth'),
            value: summary.this_month || 0,
            icon: Calendar,
            gradient: 'bg-gradient-to-br from-green-500 to-green-600',
        },
        {
            label: t('death.dashboard.thisYear'),
            value: summary.this_year || 0,
            icon: TrendingUp,
            gradient: 'bg-gradient-to-br from-orange-400 to-orange-500',
        },
        {
            label: t('death.dashboard.certificatesGenerated'),
            value: summary.certificates_generated || 0,
            icon: FileText,
            gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <button
                onClick={() => setShowStats(!showStats)}
                className="sm:hidden flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25] text-sm font-medium text-gray-700 dark:text-gray-200"
            >
                {showStats ? t('common.hideSummary') : t('common.showSummary')}
                {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : summaryCards.map((card, i) => <SummaryCard key={i} {...card} />)}
            </div>

            {/* Monthly Statistics Chart */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('death.dashboard.monthlyStats')}
                    </h3>
                    <button
                        onClick={fetchData}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <RefreshCw
                            size={14}
                            className={`text-gray-400 ${loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
                {loading ? (
                    <div className="h-52 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ) : monthly_stats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={208}>
                        <BarChart
                            data={monthly_stats}
                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                formatter={(value) => [value, 'Deaths']}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '12px',
                                }}
                            />
                            <Bar dataKey="count" fill="#0B65F6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-52 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                        No data available yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeathDashboard;
