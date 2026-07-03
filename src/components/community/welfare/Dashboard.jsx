import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, ShieldCheck, CalendarCheck, IndianRupee, FolderHeart, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getWelfareDashboard } from '../../../api/welfareService';

const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const COLORS = ['#0B65F6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SummaryCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className={`bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  </div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const d = await getWelfareDashboard();
      setData(d);
    } catch (e) {
      // Toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  const summaryCards = [
    {
      label: t('welfare.dashboard.totalBeneficiaryFamilies'),
      value: summary.total_beneficiary_families || 0,
      icon: Users,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      label: t('welfare.dashboard.zakatEligibleFamilies'),
      value: summary.zakat_eligible_families || 0,
      icon: ShieldCheck,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      label: t('welfare.dashboard.familiesAssistedThisMonth'),
      value: summary.families_assisted_this_month || 0,
      icon: CalendarCheck,
      gradient: 'bg-gradient-to-br from-orange-400 to-orange-500'
    },
    {
      label: t('welfare.dashboard.totalDistributionAmount'),
      value: formatAmount(summary.total_distribution_amount),
      icon: IndianRupee,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      label: t('welfare.dashboard.activePrograms'),
      value: summary.active_welfare_programs || 0,
      icon: FolderHeart,
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600'
    }
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
      <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4`}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : summaryCards.map((card, i) => <SummaryCard key={i} {...card} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Distribution Bar Chart */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('welfare.dashboard.monthlyDistribution')}
            </h3>
            <button onClick={fetchData} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <RefreshCw size={14} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loading ? (
            <div className="h-52 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (charts.monthly_distribution?.length > 0) ? (
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={charts.monthly_distribution} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip
                  formatter={(value) => [formatAmount(value), 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="total" fill="#0B65F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
              {t('welfare.dashboard.noChartData')}
            </div>
          )}
        </div>

        {/* By Program Pie Chart */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {t('welfare.dashboard.distributionByProgram')}
          </h3>
          {loading ? (
            <div className="h-52 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (charts.by_program?.length > 0) ? (
            <ResponsiveContainer width="100%" height={208}>
              <PieChart>
                <Pie
                  data={charts.by_program}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="total"
                  nameKey="program_name"
                  paddingAngle={2}
                >
                  {charts.by_program.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatAmount(value), name]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
              {t('welfare.dashboard.noChartData')}
            </div>
          )}
        </div>
      </div>

      {/* By Source Chart */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {t('welfare.dashboard.distributionBySource')}
        </h3>
        {loading ? (
          <div className="h-44 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ) : (charts.by_source?.length > 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {charts.by_source.map((src, i) => (
              <div key={src._id} className="text-center p-4 bg-gray-50 dark:bg-[#252731] rounded-xl">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{src._id}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {formatAmount(src.total)}
                </p>
                <p className="text-xs text-gray-400">{src.count} dist.</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            {t('welfare.dashboard.noChartData')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
