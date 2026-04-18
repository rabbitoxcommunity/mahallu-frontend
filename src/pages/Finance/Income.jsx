/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Search, Filter, ChevronLeft, ChevronRight, Plus,
  History, Edit2, Trash2, Download, X, CheckCircle, Calendar,
  CreditCard, Banknote, Smartphone, Receipt, AlertCircle, TrendingUp,
  Wallet, Building2, ShoppingBag, Palmtree, Home, MoreHorizontal,
  DollarSign, PartyPopper, Heart, Box, Eye
} from 'lucide-react';
import { getDueIncome, getDirectIncome, createDueIncome, updateDueIncome, deleteDueIncome, createDirectIncome, updateDirectIncome, deleteDirectIncome, getIncomeSummary, markDuePayment, getDuePaymentHistory as getIncomePaymentHistory } from '../../api/incomeService';
import IncomeReceipt from './IncomeReceipt';

export const Income = () => {
  const [activeTab, setActiveTab] = useState('due');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  const [summary, setSummary] = useState({
    due_based: {}, direct: {},
    total_income: 0, this_month_income: 0, pending_amount: 0
  });

  const [dueData, setDueData] = useState({ incomes: [], total: 0, page: 1, pages: 1 });
  const [directData, setDirectData] = useState({ incomes: [], total: 0, page: 1, pages: 1 });

  // Modals
  const [dueModal, setDueModal] = useState({ isOpen: false, income: null, isEdit: false });
  const [directModal, setDirectModal] = useState({ isOpen: false, income: null, isEdit: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, income: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, history: [] });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, income: null, type: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, income: null });

  // Forms
  const [dueForm, setDueForm] = useState({
    category: 'building_rent', source_name: '', month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), amount_due: '', due_date: '', notes: ''
  });
  const [directForm, setDirectForm] = useState({
    category: 'donation', source_name: '', amount: '',
    date: new Date().toISOString().split('T')[0], payment_method: 'cash', reference_no: '', description: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '', payment_method: 'cash', reference_no: '', notes: ''
  });

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await getIncomeSummary({ month, year });
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [month, year]);

  const fetchDue = useCallback(async (page = 1) => {
    try {
      const data = await getDueIncome({
        page, limit: 20, search: searchTerm, month, year,
        category: categoryFilter, status: statusFilter
      });
      setDueData(data);
    } catch {
      toast.error('Failed to fetch due income');
    }
  }, [searchTerm, month, year, categoryFilter, statusFilter]);

  const fetchDirect = useCallback(async (page = 1) => {
    try {
      const data = await getDirectIncome({
        page, limit: 20, search: searchTerm, month, year,
        category: categoryFilter, payment_method: paymentMethodFilter
      });
      setDirectData(data);
    } catch {
      toast.error('Failed to fetch direct income');
    }
  }, [searchTerm, month, year, categoryFilter, paymentMethodFilter]);

  useEffect(() => {
    fetchSummary();
  }, [month, year, fetchSummary]);

  useEffect(() => {
    if (activeTab === 'due') fetchDue(1);
    else fetchDirect(1);
  }, [activeTab, fetchDue, fetchDirect]);

  const handleCreateDue = async () => {
    try {
      await createDueIncome(dueForm);
      toast.success('Due income created successfully');
      setDueModal({ isOpen: false, income: null, isEdit: false });
      setDueForm({ category: 'building_rent', source_name: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount_due: '', due_date: '', notes: '' });
      fetchDue(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdateDue = async () => {
    try {
      await updateDueIncome(dueModal.income._id, dueForm);
      toast.success('Due income updated successfully');
      setDueModal({ isOpen: false, income: null, isEdit: false });
      fetchDue(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteDue = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This will delete the income record', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        await deleteDueIncome(id);
        toast.success('Income deleted successfully');
        fetchDue(); fetchSummary();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleMarkPayment = async () => {
    try {
      await markDuePayment(paymentModal.income._id, paymentForm);
      toast.success('Payment recorded successfully');
      setPaymentModal({ isOpen: false, income: null });
      setPaymentForm({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' });
      fetchDue(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleCreateDirect = async () => {
    try {
      await createDirectIncome(directForm);
      toast.success('Direct income recorded successfully');
      setDirectModal({ isOpen: false, income: null, isEdit: false });
      setDirectForm({ category: 'donation', source_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'cash', reference_no: '', description: '' });
      fetchDirect(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdateDirect = async () => {
    try {
      await updateDirectIncome(directModal.income._id, directForm);
      toast.success('Direct income updated successfully');
      setDirectModal({ isOpen: false, income: null, isEdit: false });
      fetchDirect(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteDirect = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'This will delete the income record', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        await deleteDirectIncome(id);
        toast.success('Income deleted successfully');
        fetchDirect(); fetchSummary();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const viewHistory = async (income) => {
    try {
      const data = await getIncomePaymentHistory(income._id);
      setHistoryModal({ isOpen: true, history: data.payments });
    } catch {
      toast.error('Failed to fetch payment history');
    }
  };

  const openPaymentModal = (income) => {
    setPaymentModal({ isOpen: true, income });
    setPaymentForm({ payment_amount: income.balance.toString(), payment_method: 'cash', reference_no: '', notes: '' });
  };

  const openEditDue = (income) => {
    setDueModal({ isOpen: true, income, isEdit: true });
    setDueForm({
      category: income.category, source_name: income.source_name, month: income.month,
      year: income.year, amount_due: income.amount_due.toString(),
      due_date: new Date(income.due_date).toISOString().split('T')[0], notes: income.notes || ''
    });
  };

  const openEditDirect = (income) => {
    setDirectModal({ isOpen: true, income, isEdit: true });
    setDirectForm({
      category: income.category, source_name: income.source_name, amount: income.amount.toString(),
      date: new Date(income.date).toISOString().split('T')[0], payment_method: income.payment_method,
      reference_no: income.reference_no || '', description: income.description || ''
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return styles[status] || styles.unpaid;
  };

  // FIX: Use replaceAll to handle all underscores (e.g. "misc_income" → "misc income")
  const formatCategory = (category) => category?.replaceAll('_', ' ') || '';

  const getCategoryIcon = (category) => {
    const icons = {
      building_rent: Building2, shop_rent: ShoppingBag, coconut_sale: Palmtree,
      hall_rent: Home, donation: Heart, misc_income: DollarSign,
      event_income: PartyPopper, charity_box: Box
    };
    const Icon = icons[category] || MoreHorizontal;
    return <Icon size={16} className="text-gray-500" />;
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage due-based and direct income records</p>
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
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{(summary?.total_income || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">₹{(summary?.this_month_income || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due Pending</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{(summary?.pending_amount || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cash Income</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">₹{(summary?.direct?.cash_income || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <Banknote size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">UPI Income</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">₹{(summary?.direct?.upi_income || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500">
              <Smartphone size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid Count</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{summary?.due_based?.paid_count || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'due'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              Due Based Income
            </div>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'direct'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet size={18} />
              Direct Income
            </div>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center justify-between">
            <div className='flex items-center gap-3 col-span-2'>
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'due' ? 'due income' : 'direct income'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              >
                <option value="">All Categories</option>
                {activeTab === 'due' ? (
                  <><option value="building_rent">Building Rent</option><option value="shop_rent">Shop Rent</option><option value="coconut_sale">Coconut Sale</option><option value="hall_rent">Hall Rent</option><option value="other">Other</option></>
                ) : (
                  <><option value="donation">Donation</option><option value="misc_income">Misc Income</option><option value="event_income">Event Income</option><option value="charity_box">Charity Box</option><option value="other">Other</option></>
                )}
              </select>

              {activeTab === 'due' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
              )}

              {activeTab === 'direct' && (
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank</option>
                </select>
              )}

              {(categoryFilter || statusFilter || paymentMethodFilter) && (
                <button
                  onClick={() => { setCategoryFilter(''); setStatusFilter(''); setPaymentMethodFilter(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all hover:shadow-md active:scale-95"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => activeTab === 'due' ? setDueModal({ isOpen: true, income: null, isEdit: false }) : setDirectModal({ isOpen: true, income: null, isEdit: false })}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add {activeTab === 'due' ? 'Due Income' : 'Direct Income'}
              </button>
            </div>
          </div>
        </div>

        {/* Due Based Income Table */}
        {activeTab === 'due' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Month/Year</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Due</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Balance</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* FIX: Empty state row */}
                  {dueData.incomes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <IndianRupee size={32} className="opacity-30" />
                          <p className="text-sm">No due income records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dueData.incomes.map((income) => (
                      <tr key={income._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{income.income_code}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(income.category)}
                            {/* FIX: Use formatCategory helper with replaceAll */}
                            <span className="capitalize">{formatCategory(income.category)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{income.source_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{months[income.month - 1]?.label} {income.year}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">₹{income.amount_due?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-green-600">₹{income.amount_paid?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-orange-600">₹{income.balance?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(income.status)}`}>{income.status}</span></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {income.status !== 'paid' && (
                              <button onClick={() => openPaymentModal(income)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark Payment"><IndianRupee size={18} /></button>
                            )}
                            <button onClick={() => viewHistory(income)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View History"><History size={18} /></button>
                            <button onClick={() => setReceiptModal({ isOpen: true, income, type: 'due' })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Receipt"><Receipt size={18} /></button>
                            <button onClick={() => openEditDue(income)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteDue(income._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {dueData.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {dueData.page} of {dueData.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchDue(dueData.page - 1)} disabled={dueData.page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronLeft size={18} /></button>
                  <button onClick={() => fetchDue(dueData.page + 1)} disabled={dueData.page === dueData.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Direct Income Table */}
        {activeTab === 'direct' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* FIX: Empty state row */}
                  {directData.incomes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Wallet size={32} className="opacity-30" />
                          <p className="text-sm">No direct income records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    directData.incomes.map((income) => (
                      <tr key={income._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{income.income_code}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{new Date(income.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(income.category)}
                            {/* FIX: Use formatCategory helper with replaceAll */}
                            <span className="capitalize">{formatCategory(income.category)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{income.source_name}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">₹{income.amount?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {income.payment_method === 'cash' && <Banknote size={18} className="text-green-600" />}
                            {income.payment_method === 'upi' && <Smartphone size={18} className="text-blue-600" />}
                            {income.payment_method === 'bank' && <CreditCard size={18} className="text-purple-600" />}
                            <span className="capitalize text-xs">{income.payment_method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">{income.receipt_no || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* FIX: Eye was used but not imported — now imported at top */}
                            <button onClick={() => setViewModal({ isOpen: true, income })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={18} /></button>
                            <button onClick={() => setReceiptModal({ isOpen: true, income, type: 'direct' })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Receipt"><Receipt size={18} /></button>
                            <button onClick={() => openEditDirect(income)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteDirect(income._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {directData.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {directData.page} of {directData.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchDirect(directData.page - 1)} disabled={directData.page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronLeft size={18} /></button>
                  <button onClick={() => fetchDirect(directData.page + 1)} disabled={directData.page === directData.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Due Income Modal */}
      {/* FIX: Wrapped all modals in AnimatePresence so exit animations work */}
      <AnimatePresence>
        {dueModal.isOpen && (
          <>
            <motion.div key="due-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDueModal({ isOpen: false, income: null, isEdit: false })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="due-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Calendar size={24} className="text-[#0B65F6]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{dueModal.isEdit ? 'Edit Due Income' : 'Add Due Income'}</h2>
                      <p className="text-sm text-gray-500">{dueModal.isEdit ? 'Update due income record' : 'Create new due income record'}</p>
                    </div>
                  </div>
                  <button onClick={() => setDueModal({ isOpen: false, income: null, isEdit: false })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={dueForm.category} onChange={(e) => setDueForm({ ...dueForm, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                      <option value="building_rent">Building Rent</option>
                      <option value="shop_rent">Shop Rent</option>
                      <option value="coconut_sale">Coconut Sale</option>
                      <option value="hall_rent">Hall Rent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Name</label>
                    <input type="text" value={dueForm.source_name} onChange={(e) => setDueForm({ ...dueForm, source_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Enter source name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                      <select value={dueForm.month} onChange={(e) => setDueForm({ ...dueForm, month: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                      <select value={dueForm.year} onChange={(e) => setDueForm({ ...dueForm, year: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Due</label>
                    <input type="number" value={dueForm.amount_due} onChange={(e) => setDueForm({ ...dueForm, amount_due: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Enter amount" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input type="date" value={dueForm.due_date} onChange={(e) => setDueForm({ ...dueForm, due_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea value={dueForm.notes} onChange={(e) => setDueForm({ ...dueForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" rows="2" placeholder="Optional notes" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setDueModal({ isOpen: false, income: null, isEdit: false })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button onClick={dueModal.isEdit ? handleUpdateDue : handleCreateDue} className="px-4 py-2 bg-[#0B65F6] hover:bg-[#0959c9] text-white rounded-lg">{dueModal.isEdit ? 'Update' : 'Create'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Direct Income Modal */}
      <AnimatePresence>
        {directModal.isOpen && (
          <>
            <motion.div key="direct-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDirectModal({ isOpen: false, income: null, isEdit: false })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="direct-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Wallet size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{directModal.isEdit ? 'Edit Direct Income' : 'Add Direct Income'}</h2>
                      <p className="text-sm text-gray-500">{directModal.isEdit ? 'Update direct income record' : 'Create new direct income record'}</p>
                    </div>
                  </div>
                  <button onClick={() => setDirectModal({ isOpen: false, income: null, isEdit: false })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" value={directForm.date} onChange={(e) => setDirectForm({ ...directForm, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={directForm.category} onChange={(e) => setDirectForm({ ...directForm, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                      <option value="donation">Donation</option>
                      <option value="misc_income">Misc Income</option>
                      <option value="event_income">Event Income</option>
                      <option value="charity_box">Charity Box</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Name</label>
                    <input type="text" value={directForm.source_name} onChange={(e) => setDirectForm({ ...directForm, source_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Enter source name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <input type="number" value={directForm.amount} onChange={(e) => setDirectForm({ ...directForm, amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Enter amount" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                    <select value={directForm.payment_method} onChange={(e) => setDirectForm({ ...directForm, payment_method: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference No</label>
                    <input type="text" value={directForm.reference_no} onChange={(e) => setDirectForm({ ...directForm, reference_no: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Optional reference number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={directForm.description} onChange={(e) => setDirectForm({ ...directForm, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" rows="2" placeholder="Optional description" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setDirectModal({ isOpen: false, income: null, isEdit: false })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button onClick={directModal.isEdit ? handleUpdateDirect : handleCreateDirect} className="px-4 py-2 bg-[#0B65F6] hover:bg-[#0959c9] text-white rounded-lg">{directModal.isEdit ? 'Update' : 'Create'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.isOpen && paymentModal.income && (
          <>
            <motion.div key="payment-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaymentModal({ isOpen: false, income: null })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="payment-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mark Payment</h2>
                  <button onClick={() => setPaymentModal({ isOpen: false, income: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Due</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{paymentModal.income.amount_due}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Already Paid</p>
                      <p className="text-lg font-bold text-green-600">₹{paymentModal.income.amount_paid}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-lg font-bold text-orange-600">₹{paymentModal.income.balance}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Amount</label>
                      <input type="number" value={paymentForm.payment_amount} onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                      <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference No</label>
                      <input type="text" value={paymentForm.reference_no} onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                      <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" rows="2" placeholder="Optional" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setPaymentModal({ isOpen: false, income: null })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button onClick={handleMarkPayment} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Record Payment</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyModal.isOpen && (
          <>
            <motion.div key="history-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryModal({ isOpen: false, history: [] })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="history-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h2>
                  <button onClick={() => setHistoryModal({ isOpen: false, history: [] })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {historyModal.history.length === 0 ? (
                    <p className="text-center text-gray-500">No payment history found</p>
                  ) : (
                    <div className="space-y-3">
                      {historyModal.history.map((payment, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-[#252731] rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">₹{payment.payment_amount?.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Method: {payment.payment_method}</span>
                            {payment.reference_no && <span className="text-gray-600">Ref: {payment.reference_no}</span>}
                          </div>
                          {payment.notes && <p className="text-sm text-gray-500 mt-2">{payment.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <IncomeReceipt isOpen={receiptModal.isOpen} onClose={() => setReceiptModal({ isOpen: false, income: null, type: '' })} income={receiptModal.income} type={receiptModal.type} />

      {/* View Modal */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.income && (
          <>
            <motion.div key="view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal({ isOpen: false, income: null })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="view-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Income Details</h2>
                  <button onClick={() => setViewModal({ isOpen: false, income: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-500">Income Code</p><p className="font-medium">{viewModal.income.income_code}</p></div>
                    <div><p className="text-xs text-gray-500">Date</p><p className="font-medium">{new Date(viewModal.income.date).toLocaleDateString()}</p></div>
                  </div>
                  {/* FIX: Use formatCategory helper with replaceAll */}
                  <div><p className="text-xs text-gray-500">Category</p><p className="font-medium capitalize">{formatCategory(viewModal.income.category)}</p></div>
                  <div><p className="text-xs text-gray-500">Source</p><p className="font-medium">{viewModal.income.source_name}</p></div>
                  <div><p className="text-xs text-gray-500">Amount</p><p className="font-medium text-green-600 text-lg">₹{viewModal.income.amount?.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium capitalize">{viewModal.income.payment_method}</p></div>
                  {viewModal.income.reference_no && <div><p className="text-xs text-gray-500">Reference</p><p className="font-medium">{viewModal.income.reference_no}</p></div>}
                  {viewModal.income.description && <div><p className="text-xs text-gray-500">Description</p><p className="font-medium">{viewModal.income.description}</p></div>}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


