import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Users,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  History,
  CreditCard,
  Printer,
  TrendingUp,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getMonthlyVarisankhya,
  generateMonthlyDues,
  getDefaulters,
  getPaymentHistory,
  getHousePaymentHistory
} from '../../api/varisankhyaService';
import PaymentModal from './PaymentModal';
import Receipt from './Receipt';

const Varisankhya = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // '', 'today', 'this_month', 'last_month', 'this_year'
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data states
  const [monthlyData, setMonthlyData] = useState({
    varisankhya: [],
    total: 0,
    page: 1,
    pages: 1,
    summary: {}
  });
  const [defaultersData, setDefaultersData] = useState({
    defaulters: [],
    total: 0,
    page: 1,
    pages: 1
  });
  const [paymentHistoryData, setPaymentHistoryData] = useState({
    payments: [],
    total: 0,
    page: 1,
    pages: 1,
    total_collected: 0
  });

  // Modal states
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    record: null
  });
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    record: null,
    printMode: false
  });
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    houseId: null,
    houseName: '',
    data: null,
    loading: false
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Fetch monthly data
  const fetchMonthlyData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMonthlyVarisankhya(month, year, page, 20, searchTerm);
      setMonthlyData(data);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch defaulters data
  const fetchDefaulters = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getDefaulters(year, page, 20);
      setDefaultersData(data);
    } catch (error) {
      console.error('Error fetching defaulters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total collected from payment history
  const calculateTotalCollected = () => {
    if (!paymentHistoryData.payments || !Array.isArray(paymentHistoryData.payments)) {
      return 0;
    }
    return paymentHistoryData.payments.reduce((total, payment) => {
      return total + (payment.amount || 0);
    }, 0);
  };

  // Fetch payment history
  const fetchPaymentHistory = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getPaymentHistory(
        page,
        20,
        searchTerm,
        customDateRange.from,
        customDateRange.to,
        dateFilter
      );
      setPaymentHistoryData(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch house payment history
  const fetchHouseHistory = async (houseId) => {
    if (!houseId) return;
    setHistoryModal(prev => ({ ...prev, loading: true }));
    try {
      const data = await getHousePaymentHistory(houseId);
      setHistoryModal(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      console.error('Error fetching house history:', error);
      toast.error('Failed to fetch house history');
      setHistoryModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Debounced search
  const debouncedFetchMonthlyData = useCallback(
    debounce((page) => fetchMonthlyData(page), 500),
    [month, year, searchTerm]
  );

  const debouncedFetchPaymentHistory = useCallback(
    debounce((page) => fetchPaymentHistory(page), 500),
    [searchTerm]
  );

  // Debounce helper function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Generate monthly dues
  const handleGenerateDues = async () => {
    const result = await Swal.fire({
      title: 'Generate Monthly Dues?',
      text: `This will create varisankhya records for all active houses for ${months.find(m => m.value === month)?.label} ${year}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0B65F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Generate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setGenerating(true);
      try {
        const response = await generateMonthlyDues(month, year);
        toast.success(`Generated ${response.summary.created} dues. Skipped ${response.summary.skipped} existing records.`);
        fetchMonthlyData();
      } catch (error) {
        console.error('Error generating dues:', error);
        toast.error('Failed to generate monthly dues');
      } finally {
        setGenerating(false);
      }
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentModal({ isOpen: false, record: null });
    fetchMonthlyData(monthlyData.page);
    if (activeTab === 'defaulters') fetchDefaulters(defaultersData.page);
    if (activeTab === 'history') fetchPaymentHistory(paymentHistoryData.page);
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyData();
    } else if (activeTab === 'defaulters') {
      fetchDefaulters();
    } else if (activeTab === 'history') {
      fetchPaymentHistory();
    }
  }, [activeTab, month, year]);

  // Debounced search effect
  useEffect(() => {
    if (activeTab === 'monthly') {
      debouncedFetchMonthlyData();
    } else if (activeTab === 'history') {
      debouncedFetchPaymentHistory();
    }
  }, [searchTerm]);

  // Date filter effect
  useEffect(() => {
    if (activeTab === 'history') {
      fetchPaymentHistory();
    }
  }, [dateFilter, customDateRange.from, customDateRange.to]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      unpaid: 'bg-red-100 text-red-700 border-red-200',
      partial: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };

    const labels = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      partial: 'Partial'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.unpaid}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Varisankhya Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage monthly subscription collections per house</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={handleGenerateDues}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              {generating ? 'Generating...' : 'Generate Dues'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'monthly' && monthlyData.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <SummaryCard
            title="Total Houses"
            value={monthlyData.summary.total_houses || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <SummaryCard
            title="Paid Houses"
            value={monthlyData.summary.paid_houses || 0}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <SummaryCard
            title="Unpaid Houses"
            value={monthlyData.summary.unpaid_houses || 0}
            icon={XCircle}
            color="bg-red-500"
          />
          <SummaryCard
            title="Total Expected"
            value={`₹${(monthlyData.summary.total_expected || 0).toLocaleString()}`}
            icon={IndianRupee}
            color="bg-purple-500"
          />
          <SummaryCard
            title="Pending Amount"
            value={`₹${(monthlyData.summary.pending_amount || 0).toLocaleString()}`}
            icon={AlertCircle}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              Monthly Collection
            </div>
          </button>
          <button
            onClick={() => setActiveTab('defaulters')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'defaulters'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertCircle size={18} />
              Defaulters
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History size={18} />
              Payment History
            </div>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'monthly' ? 'houses' : activeTab === 'defaulters' ? 'defaulters' : 'payments'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              />
            </div>

            {/* Date Filters - Only for Payment History Tab */}
            {activeTab === 'history' && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCustomDateRange({ from: '', to: '' });
                  }}
                  className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === 'custom' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customDateRange.from}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    />
                    <input
                      type="date"
                      value={customDateRange.to}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    />
                  </div>
                )}

                {(dateFilter || customDateRange.from || customDateRange.to) && (
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setCustomDateRange({ from: '', to: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all hover:shadow-md active:scale-95"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="text-[#0B65F6] animate-spin" />
            </div>
          ) : (
            <>
              {/* Monthly Collection Tab */}
              {activeTab === 'monthly' && (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">House</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Family</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Due</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.varisankhya.map((record) => (
                          <tr key={record._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">{record.house_id?.house_code}</span>
                                <span className="text-xs text-gray-500">{record.house_id?.householder_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {record.house_id?.family_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {record.house_id?.primary_contact || '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                              ₹{record.amount_due}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-medium text-green-600">
                              ₹{record.amount_paid}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <StatusBadge status={record.status} />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {record.status !== 'paid' && (
                                  <button
                                    onClick={() => setPaymentModal({ isOpen: true, record })}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Mark Paid"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                )}
                                {record.receipt_no && (
                                  <button
                                    onClick={() => setReceiptModal({ isOpen: true, record })}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Receipt"
                                  >
                                    <Eye size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setHistoryModal({
                                      isOpen: true,
                                      houseId: record.house_id?._id,
                                      houseName: `${record.house_id?.house_code} - ${record.house_id?.householder_name}`,
                                      data: null,
                                      loading: true
                                    });
                                    fetchHouseHistory(record.house_id?._id);
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View History"
                                >
                                  <History size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {monthlyData.varisankhya.length === 0 && (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-gray-500">
                              No records found. Generate dues for this month to see data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {monthlyData.varisankhya.map((record) => (
                      <div key={record._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{record.house_id?.house_code}</p>
                            <p className="text-sm text-gray-500">{record.house_id?.householder_name}</p>
                            <p className="text-xs text-gray-400">{record.house_id?.family_name}</p>
                          </div>
                          <StatusBadge status={record.status} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due: <span className="font-medium text-gray-900">₹{record.amount_due}</span></span>
                          <span className="text-gray-500">Paid: <span className="font-medium text-green-600">₹{record.amount_paid}</span></span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {record.status !== 'paid' && (
                            <button
                              onClick={() => setPaymentModal({ isOpen: true, record })}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                            >
                              Pay
                            </button>
                          )}
                          {record.receipt_no && (
                            <button
                              onClick={() => setReceiptModal({ isOpen: true, record })}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                            >
                              Receipt
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setHistoryModal({
                                isOpen: true,
                                houseId: record.house_id?._id,
                                houseName: `${record.house_id?.house_code} - ${record.house_id?.householder_name}`,
                                data: null,
                                loading: true
                              });
                              fetchHouseHistory(record.house_id?._id);
                            }}
                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                          >
                            History
                          </button>
                        </div>
                      </div>
                    ))}
                    {monthlyData.varisankhya.length === 0 && (
                      <p className="py-12 text-center text-gray-500">No records found.</p>
                    )}
                  </div>

                  {/* Pagination */}
                  {monthlyData.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">
                        Showing {((monthlyData.page - 1) * 20) + 1} to {Math.min(monthlyData.page * 20, monthlyData.total)} of {monthlyData.total} entries
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchMonthlyData(monthlyData.page - 1)}
                          disabled={monthlyData.page === 1}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {monthlyData.page} of {monthlyData.pages}
                        </span>
                        <button
                          onClick={() => fetchMonthlyData(monthlyData.page + 1)}
                          disabled={monthlyData.page === monthlyData.pages}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Defaulters Tab */}
              {activeTab === 'defaulters' && (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">House</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Family</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pending</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount Due</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {defaultersData.defaulters.map((defaulter) => (
                          <tr key={defaulter.house_id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">{defaulter.house_code}</span>
                                <span className="text-xs text-gray-500">{defaulter.house_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {defaulter.family_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                {defaulter.pending_months_count} months
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-red-600">
                              ₹{defaulter.pending_amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setHistoryModal({
                                      isOpen: true,
                                      houseId: defaulter.house_id,
                                      houseName: `${defaulter.house_code} - ${defaulter.house_name}`,
                                      data: null,
                                      loading: true
                                    });
                                    fetchHouseHistory(defaulter.house_id);
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View History"
                                >
                                  <History size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {defaultersData.defaulters.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-12 text-center text-gray-500">
                              No defaulters found. All houses are up to date!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {defaultersData.defaulters.map((defaulter) => (
                      <div key={defaulter.house_id} className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 space-y-2 border border-red-100 dark:border-red-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{defaulter.house_code}</p>
                            <p className="text-sm text-gray-500">{defaulter.house_name}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            {defaulter.pending_months_count} months
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{defaulter.family_name}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-red-200 dark:border-red-800">
                          <span className="text-sm text-gray-500">Due: <span className="font-bold text-red-600">₹{defaulter.pending_amount.toLocaleString()}</span></span>
                          <button
                            onClick={() => {
                              setHistoryModal({
                                isOpen: true,
                                houseId: defaulter.house_id,
                                houseName: `${defaulter.house_code} - ${defaulter.house_name}`,
                                data: null,
                                loading: true
                              });
                              fetchHouseHistory(defaulter.house_id);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View History"
                          >
                            <History size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {defaultersData.defaulters.length === 0 && (
                      <p className="py-12 text-center text-gray-500">No defaulters found. All houses are up to date!</p>
                    )}
                  </div>

                  {/* Pagination */}
                  {defaultersData.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">
                        Showing {((defaultersData.page - 1) * 20) + 1} to {Math.min(defaultersData.page * 20, defaultersData.total)} of {defaultersData.total} entries
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchDefaulters(defaultersData.page - 1)}
                          disabled={defaultersData.page === 1}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {defaultersData.page} of {defaultersData.pages}
                        </span>
                        <button
                          onClick={() => fetchDefaulters(defaultersData.page + 1)}
                          disabled={defaultersData.page === defaultersData.pages}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Payment History Tab */}
              {activeTab === 'history' && (
                <>
                  {/* Total Collected Card - Near Filters */}
                  <div className="mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-linear-to-r from-teal-500 to-cyan-600 rounded-2xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <TrendingUp size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-white/90">Total Collected</p>
                            <h3 className="text-2xl font-bold text-white">
                              ₹{calculateTotalCollected().toLocaleString()}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/70">{paymentHistoryData.payments?.length || 0} payments</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">House</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Month/Year</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistoryData.payments.map((payment) => (
                          <tr key={payment._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                              {payment.receipt_no}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">{payment.house_id?.house_code}</span>
                                <span className="text-xs text-gray-500">{payment.house_id?.householder_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                              {months.find(m => m.value === payment.month)?.label} {payment.year}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-green-600">
                              ₹{payment.amount_paid.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                              {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setReceiptModal({ isOpen: true, record: payment })}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Receipt"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    const printWindow = window.open('', '_blank');
                                    const receiptContent = `
                                      <html>
                                        <head>
                                          <title>Receipt - ${payment.receipt_no}</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; padding: 40px; }
                                            .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                            .row { display: flex; justify-content: space-between; margin: 10px 0; }
                                            .amount { font-size: 24px; font-weight: bold; color: green; text-align: center; margin: 20px 0; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="receipt">
                                            <div class="header">
                                              <h2>VARISANKHYA RECEIPT</h2>
                                              <p>Mahallu Management System</p>
                                            </div>
                                            <div class="row"><span>Receipt No:</span><strong>${payment.receipt_no}</strong></div>
                                            <div class="row"><span>House:</span><strong>${payment.house_id?.house_code}</strong></div>
                                            <div class="row"><span>Month/Year:</span><strong>${months.find(m => m.value === payment.month)?.label} ${payment.year}</strong></div>
                                            <div class="amount">₹${payment.amount_paid?.toLocaleString()}</div>
                                            <div class="row"><span>Method:</span><strong>${payment.payment_method?.toUpperCase()}</strong></div>
                                            <div class="row"><span>Date:</span><strong>${new Date(payment.paid_date).toLocaleDateString()}</strong></div>
                                            <div class="row"><span>Collected By:</span><strong>${payment.received_by?.name || 'Admin'}</strong></div>
                                          </div>
                                          <script>window.print();</script>
                                        </body>
                                      </html>
                                    `;
                                    printWindow.document.write(receiptContent);
                                    printWindow.document.close();
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Print Receipt"
                                >
                                  <Printer size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paymentHistoryData.payments.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-gray-500">
                              No payment history found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {paymentHistoryData.payments.map((payment) => (
                      <div key={payment._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{payment.house_id?.house_code}</p>
                            <p className="text-sm text-gray-500">{payment.house_id?.householder_name}</p>
                          </div>
                          <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                            ₹{payment.amount_paid.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{months.find(m => m.value === payment.month)?.label} {payment.year}</span>
                          <span>{payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Receipt: <span className="font-medium text-gray-700">{payment.receipt_no}</span></span>
                          <span className="text-gray-500 capitalize">{payment.payment_method}</span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setReceiptModal({ isOpen: true, record: payment })}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              const printWindow = window.open('', '_blank');
                              const receiptContent = `
                                <html>
                                  <head>
                                    <title>Receipt - ${payment.receipt_no}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; padding: 40px; }
                                      .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                                      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                      .row { display: flex; justify-content: space-between; margin: 10px 0; }
                                      .amount { font-size: 24px; font-weight: bold; color: green; text-align: center; margin: 20px 0; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="receipt">
                                      <div class="header">
                                        <h2>VARISANKHYA RECEIPT</h2>
                                        <p>Mahallu Management System</p>
                                      </div>
                                      <div class="row"><span>Receipt No:</span><strong>${payment.receipt_no}</strong></div>
                                      <div class="row"><span>House:</span><strong>${payment.house_id?.house_code}</strong></div>
                                      <div class="row"><span>Month/Year:</span><strong>${months.find(m => m.value === payment.month)?.label} ${payment.year}</strong></div>
                                      <div class="amount">₹${payment.amount_paid?.toLocaleString()}</div>
                                      <div class="row"><span>Method:</span><strong>${payment.payment_method?.toUpperCase()}</strong></div>
                                      <div class="row"><span>Date:</span><strong>${new Date(payment.paid_date).toLocaleDateString()}</strong></div>
                                      <div class="row"><span>Collected By:</span><strong>${payment.received_by?.name || 'Admin'}</strong></div>
                                    </div>
                                    <script>window.print();</script>
                                  </body>
                                </html>
                              `;
                              printWindow.document.write(receiptContent);
                              printWindow.document.close();
                            }}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                          >
                            Print
                          </button>
                        </div>
                      </div>
                    ))}
                    {paymentHistoryData.payments.length === 0 && (
                      <p className="py-12 text-center text-gray-500">No payment history found.</p>
                    )}
                  </div>

                  {/* Summary for History */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Collected</span>
                        {dateFilter && (
                          <p className="text-xs text-gray-500">
                            {dateFilter === 'today' && 'Today'}
                            {dateFilter === 'this_month' && 'This Month'}
                            {dateFilter === 'last_month' && 'Last Month'}
                            {dateFilter === 'this_year' && 'This Year'}
                            {dateFilter === 'custom' && `${customDateRange.from || '...'} to ${customDateRange.to || '...'}`}
                          </p>
                        )}
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{paymentHistoryData.total_collected?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  {/* Pagination */}
                  {paymentHistoryData.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">
                        Showing {((paymentHistoryData.page - 1) * 20) + 1} to {Math.min(paymentHistoryData.page * 20, paymentHistoryData.total)} of {paymentHistoryData.total} entries
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchPaymentHistory(paymentHistoryData.page - 1)}
                          disabled={paymentHistoryData.page === 1}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {paymentHistoryData.page} of {paymentHistoryData.pages}
                        </span>
                        <button
                          onClick={() => fetchPaymentHistory(paymentHistoryData.page + 1)}
                          disabled={paymentHistoryData.page === paymentHistoryData.pages}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, record: null })}
        record={paymentModal.record}
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <Receipt
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, record: null, printMode: false })}
        record={receiptModal.record}
        printMode={receiptModal.printMode}
      />

      {/* History Modal */}
      <AnimatePresence>
        {historyModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModal({ isOpen: false, houseId: null, houseName: '', data: null, loading: false })}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <History size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h2>
                      <p className="text-sm text-gray-500">{historyModal.houseName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryModal({ isOpen: false, houseId: null, houseName: '', data: null, loading: false })}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {historyModal.loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw size={32} className="text-purple-600 animate-spin" />
                    </div>
                  ) : historyModal.data?.history?.length > 0 ? (
                    <>
                      <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Total Due</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{historyModal.data.summary?.total_due?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Total Paid</p>
                            <p className="text-lg font-bold text-green-600">₹{historyModal.data.summary?.total_paid?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Payments Made</p>
                            <p className="text-lg font-bold text-blue-600">{historyModal.data.summary?.payments_count || 0}</p>
                          </div>
                        </div>
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Month/Year</th>
                            <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Due</th>
                            <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                            <th className="text-center py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyModal.data.history.map((h) => (
                            <tr key={h._id} className="border-b border-gray-50 dark:border-gray-800/50">
                              <td className="py-2 px-4 text-sm">{months.find(m => m.value === h.month)?.label} {h.year}</td>
                              <td className="py-2 px-4 text-right text-sm">₹{h.amount_due}</td>
                              <td className="py-2 px-4 text-right text-sm font-medium text-green-600">₹{h.amount_paid}</td>
                              <td className="py-2 px-4 text-center"><StatusBadge status={h.status} /></td>
                              <td className="py-2 px-4 text-sm text-gray-500">
                                {h.paid_date ? new Date(h.paid_date).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No payment history found for this house.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Varisankhya;
