import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  IndianRupee,
  Calendar,
  RefreshCw,
  Download,
  Printer,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Users,
  Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  getDashboardSummary,
  getMonthlyReport,
  getIncomeReport,
  getExpenseReport,
  getVarisankhyaReport
} from '../../api/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    this_month_income: 0,
    this_month_expense: 0
  });

  // Monthly report data
  const [monthlyReportData, setMonthlyReportData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    total_income: 0,
    total_expense: 0,
    balance: 0,
    data: []
  });
  const [monthlyFilters, setMonthlyFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Income report data
  const [incomeReportData, setIncomeReportData] = useState({
    total_income: 0,
    category_totals: [],
    data: []
  });
  const [incomeFilters, setIncomeFilters] = useState({
    date_from: '',
    date_to: '',
    category: '',
    payment_method: ''
  });

  // Expense report data
  const [expenseReportData, setExpenseReportData] = useState({
    total_expense: 0,
    category_totals: [],
    data: []
  });
  const [expenseFilters, setExpenseFilters] = useState({
    date_from: '',
    date_to: '',
    category: '',
    payment_method: ''
  });

  // Varisankhya report data
  const [varisankhyaReportData, setVarisankhyaReportData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    total_houses: 0,
    paid_houses: 0,
    unpaid_houses: 0,
    partial_houses: 0,
    total_collected: 0,
    pending_amount: 0,
    data: []
  });
  const [varisankhyaFilters, setVarisankhyaFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Fetch dashboard summary
  const fetchDashboardSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDashboardSummary();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch monthly report
  const fetchMonthlyReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMonthlyReport(monthlyFilters);
      setMonthlyReportData(data);
    } catch (error) {
      toast.error('Failed to fetch monthly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [monthlyFilters]);

  // Fetch income report
  const fetchIncomeReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncomeReport(incomeFilters);
      setIncomeReportData(data);
    } catch (error) {
      toast.error('Failed to fetch income report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [incomeFilters]);

  // Fetch expense report
  const fetchExpenseReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpenseReport(expenseFilters);
      setExpenseReportData(data);
    } catch (error) {
      toast.error('Failed to fetch expense report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [expenseFilters]);

  // Fetch varisankhya report
  const fetchVarisankhyaReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVarisankhyaReport(varisankhyaFilters);
      setVarisankhyaReportData(data);
    } catch (error) {
      toast.error('Failed to fetch varisankhya report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [varisankhyaFilters]);

  // Initial load
  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    } else if (activeTab === 'income') {
      fetchIncomeReport();
    } else if (activeTab === 'expense') {
      fetchExpenseReport();
    } else if (activeTab === 'varisankhya') {
      fetchVarisankhyaReport();
    }
  }, [activeTab, fetchMonthlyReport, fetchIncomeReport, fetchExpenseReport, fetchVarisankhyaReport]);

  // Dashboard cards
  const DashboardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <IndianRupee size={24} />
          </div>
          <span className="text-sm font-medium opacity-90">Total Income</span>
        </div>
        <p className="text-3xl font-bold">₹{dashboardData.total_income.toLocaleString()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Wallet size={24} />
          </div>
          <span className="text-sm font-medium opacity-90">Total Expense</span>
        </div>
        <p className="text-3xl font-bold">₹{dashboardData.total_expense.toLocaleString()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`bg-gradient-to-br rounded-2xl p-6 text-white shadow-lg ${dashboardData.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <span className="text-sm font-medium opacity-90">Balance</span>
        </div>
        <p className="text-3xl font-bold">₹{dashboardData.balance.toLocaleString()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <IndianRupee size={24} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month Income</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{dashboardData.this_month_income.toLocaleString()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Wallet size={24} className="text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month Expense</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{dashboardData.this_month_expense.toLocaleString()}</p>
      </motion.div>
    </div>
  );

  // Dashboard charts
  const DashboardCharts = () => {
    const chartData = [
      { name: 'Income', value: dashboardData.total_income },
      { name: 'Expense', value: dashboardData.total_expense }
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0B65F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Monthly Report Tab
  const MonthlyReportTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
            <select
              value={monthlyFilters.month}
              onChange={(e) => setMonthlyFilters({ ...monthlyFilters, month: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{moment().month(i).format('MMMM')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
            <select
              value={monthlyFilters.year}
              onChange={(e) => setMonthlyFilters({ ...monthlyFilters, year: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchMonthlyReport}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-green-600">₹{monthlyReportData.total_income.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">₹{monthlyReportData.total_expense.toLocaleString()}</p>
        </div>
        <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border ${monthlyReportData.balance >= 0 ? 'border-blue-200 dark:border-blue-800' : 'border-orange-200 dark:border-orange-800'}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
          <p className={`text-2xl font-bold ${monthlyReportData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>₹{monthlyReportData.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Transactions</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
              <Printer size={18} />
              Print
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Income</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Expense</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReportData.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                monthlyReportData.data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{moment(item.date).format('DD MMM YYYY')}</td>
                    <td className="py-3 px-4 text-right text-sm text-green-600 font-medium">₹{item.income.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm text-red-600 font-medium">₹{item.expense.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${item.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>₹{item.balance.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Income Report Tab
  const IncomeReportTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
            <input
              type="date"
              value={incomeFilters.date_from}
              onChange={(e) => setIncomeFilters({ ...incomeFilters, date_from: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
            <input
              type="date"
              value={incomeFilters.date_to}
              onChange={(e) => setIncomeFilters({ ...incomeFilters, date_to: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <select
              value={incomeFilters.payment_method}
              onChange={(e) => setIncomeFilters({ ...incomeFilters, payment_method: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <button
            onClick={fetchIncomeReport}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
        <p className="text-2xl font-bold text-green-600">₹{incomeReportData.total_income.toLocaleString()}</p>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category-wise Totals</h3>
        </div>
        <div className="p-6">
          {incomeReportData.category_totals.length === 0 ? (
            <p className="text-center text-gray-500">No data</p>
          ) : (
            <div className="space-y-3">
              {incomeReportData.category_totals.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item._id || 'Uncategorized'}</span>
                  <span className="text-sm font-bold text-green-600">₹{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Income Transactions</h3>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Source</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Method</th>
              </tr>
            </thead>
            <tbody>
              {incomeReportData.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                incomeReportData.data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{moment(item.date).format('DD MMM YYYY, h:mm A')}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.category || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.source || '-'}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-green-600">₹{item.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300 capitalize">{item.payment_method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Expense Report Tab
  const ExpenseReportTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
            <input
              type="date"
              value={expenseFilters.date_from}
              onChange={(e) => setExpenseFilters({ ...expenseFilters, date_from: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
            <input
              type="date"
              value={expenseFilters.date_to}
              onChange={(e) => setExpenseFilters({ ...expenseFilters, date_to: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <input
              type="text"
              value={expenseFilters.category}
              onChange={(e) => setExpenseFilters({ ...expenseFilters, category: e.target.value })}
              placeholder="Enter category"
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <select
              value={expenseFilters.payment_method}
              onChange={(e) => setExpenseFilters({ ...expenseFilters, payment_method: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <button
            onClick={fetchExpenseReport}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Expense</p>
        <p className="text-2xl font-bold text-red-600">₹{expenseReportData.total_expense.toLocaleString()}</p>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category-wise Totals</h3>
        </div>
        <div className="p-6">
          {expenseReportData.category_totals.length === 0 ? (
            <p className="text-center text-gray-500">No data</p>
          ) : (
            <div className="space-y-3">
              {expenseReportData.category_totals.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item._id || 'Uncategorized'}</span>
                  <span className="text-sm font-bold text-red-600">₹{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Transactions</h3>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Paid To</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Method</th>
              </tr>
            </thead>
            <tbody>
              {expenseReportData.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                expenseReportData.data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{moment(item.date).format('DD MMM YYYY, h:mm A')}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.paid_to}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-red-600">₹{item.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300 capitalize">{item.payment_method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Varisankhya Report Tab
  const VarisankhyaReportTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
            <select
              value={varisankhyaFilters.month}
              onChange={(e) => setVarisankhyaFilters({ ...varisankhyaFilters, month: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{moment().month(i).format('MMMM')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
            <select
              value={varisankhyaFilters.year}
              onChange={(e) => setVarisankhyaFilters({ ...varisankhyaFilters, year: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchVarisankhyaReport}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Houses</p>
          <p className="text-2xl font-bold text-blue-600">{varisankhyaReportData.total_houses}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid Houses</p>
          <p className="text-2xl font-bold text-green-600">{varisankhyaReportData.paid_houses}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid Houses</p>
          <p className="text-2xl font-bold text-red-600">{varisankhyaReportData.unpaid_houses}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Partial Houses</p>
          <p className="text-2xl font-bold text-yellow-600">{varisankhyaReportData.partial_houses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">₹{varisankhyaReportData.total_collected.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
          <p className="text-2xl font-bold text-orange-600">₹{varisankhyaReportData.pending_amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">House-wise Details</h3>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">House</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Due</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Paid</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Balance</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {varisankhyaReportData.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                varisankhyaReportData.data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <p className="font-medium">{item.house_code}</p>
                        <p className="text-xs text-gray-500">{item.householder_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">₹{item.amount_due.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm text-green-600 font-medium">₹{item.amount_paid.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{item.balance.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'paid' ? 'bg-green-100 text-green-700' :
                        item.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">View and analyze financial reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'monthly', label: 'Monthly Report', icon: Calendar },
          { id: 'income', label: 'Income Report', icon: IndianRupee },
          { id: 'expense', label: 'Expense Report', icon: Wallet },
          { id: 'varisankhya', label: 'Varisankhya Report', icon: Home }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0B65F6] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DashboardCards />
            <DashboardCharts />
          </motion.div>
        )}

        {activeTab === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MonthlyReportTab />
          </motion.div>
        )}

        {activeTab === 'income' && (
          <motion.div
            key="income"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <IncomeReportTab />
          </motion.div>
        )}

        {activeTab === 'expense' && (
          <motion.div
            key="expense"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ExpenseReportTab />
          </motion.div>
        )}

        {activeTab === 'varisankhya' && (
          <motion.div
            key="varisankhya"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VarisankhyaReportTab />
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 flex items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#0B65F6]" />
            <span className="text-gray-900 dark:text-white">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
