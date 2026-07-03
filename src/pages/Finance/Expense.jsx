/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import {
  Wallet, IndianRupee, Calendar, Search, ChevronLeft, ChevronRight,
  RefreshCw, Eye, Image, Printer, Plus, X, Edit2, Trash2,
  CreditCard, Banknote, Smartphone, History, CheckCircle,
  AlertCircle, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense, getExpenseSummary,
  getDueExpenses, createDueExpense, updateDueExpense, deleteDueExpense,
  markDueExpensePayment, getDueExpenseTemplateEntries, getDueExpenseSummary, viewReceipt
} from '../../api/expenseService';
import { getExpenseCategories } from '../../api/expenseCategoryService';

// ==================== PRINT STYLES ====================
const printStyles = `
  @media print {
    .no-print { display: none !important; }
    body { background: white !important; }
    .print-only { display: block !important; }
    aside, nav, [class*="sidebar"], [class*="Sidebar"], [class*="menu"], [class*="Menu"] { display: none !important; }
    header, [class*="header"], [class*="Header"] { display: none !important; }
  }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}

// ==================== SHARED HELPERS ====================
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const isEntryCurrentOrPast = (entryMonth, entryYear) => {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  return entryYear < cy || (entryYear === cy && entryMonth <= cm);
};

const getStatusBadge = (status) => {
  const styles = {
    paid:     'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    partial:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    unpaid:   'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    overdue:  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    upcoming: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };
  return styles[status] || styles.unpaid;
};

const PaymentMethodBadge = ({ method }) => {
  const styles = {
    cash: 'bg-green-100 text-green-700 border-green-200',
    upi: 'bg-blue-100 text-blue-700 border-blue-200',
    bank: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const icons = { cash: Banknote, upi: Smartphone, bank: CreditCard };
  const Icon = icons[method] || Banknote;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium border ${styles[method] || styles.cash}`}>
      <Icon size={12} /><span className="capitalize">{method}</span>
    </span>
  );
};

const SummaryCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
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
  </div>
);

// ==================== SELECT STYLES ====================
const selectStyles = {
  control: (base) => ({
    ...base, minHeight: '42px', fontSize: '14px',
    borderColor: '#e5e7eb', borderRadius: '0.75rem',
    backgroundColor: '#f9fafb',
  }),
  menu: (base) => ({
    ...base, backgroundColor: '#ffffff', zIndex: 50, borderRadius: '0.75rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff',
    color: '#374151',
  }),
  singleValue: (base) => ({ ...base, color: '#374151' }),
  placeholder: (base) => ({ ...base, color: '#9ca3af' }),
};

// ==================== MAIN COMPONENT ====================
const Expense = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(() =>
    localStorage.getItem('expenseActiveTab') || 'direct'
  );

  useEffect(() => {
    localStorage.setItem('expenseActiveTab', activeTab);
  }, [activeTab]);

  // Shared month/year for due tab
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const [showStats, setShowStats] = useState(false);

  // ==================== DIRECT EXPENSE STATE ====================
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const [expensesData, setExpensesData] = useState({ expenses: [], total: 0, page: 1, pages: 1 });
  const [summaryData, setSummaryData] = useState({ today_total: 0, month_total: 0, cash_total: 0, bank_total: 0, total: 0 });
  const [expenseCategories, setExpenseCategories] = useState([]);

  const [addModal, setAddModal] = useState({ isOpen: false });
  const [viewModal, setViewModal] = useState({ isOpen: false, expense: null });
  const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, expense: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, loading: false, blobUrl: null, contentType: null });
  const [printModal, setPrintModal] = useState({ isOpen: false, allExpenses: [] });

  const fileInputRef = useRef(null);
  const voucherRef = useRef(null);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: addErrors }, reset: resetAddForm, control: controlAdd } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: '', paid_to: '', amount: '', payment_method: 'cash', reference_no: '', notes: '', bill_file: ''
    }
  });

  const [editForm, setEditForm] = useState({
    date: '', category: '', paid_to: '', amount: '', payment_method: 'cash', reference_no: '', notes: '', bill_file: ''
  });

  // ==================== DUE EXPENSE STATE ====================
  const [dueSearchTerm, setDueSearchTerm] = useState('');
  const [dueCategoryFilter, setDueCategoryFilter] = useState('');
  const [dueStatusFilter, setDueStatusFilter] = useState('');
  const [dueLoading, setDueLoading] = useState(false);
  const [dueData, setDueData] = useState({ expenses: [], total: 0, page: 1, pages: 1 });
  const [dueSummary, setDueSummary] = useState({
    total_due: 0, total_paid: 0, total_pending: 0,
    paid_count: 0, partial_count: 0, unpaid_count: 0, overdue_count: 0,
  });

  // Due expense modals
  const [dueModal, setDueModal] = useState({ isOpen: false, expense: null, isEdit: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, expense: null, entry: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, history: [], templateName: '' });

  const [selectedDueCategory, setSelectedDueCategory] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' });

  const { register: registerDue, handleSubmit: handleSubmitDue, reset: resetDue, formState: { errors: dueErrors } } = useForm({
    defaultValues: {
      category: '', paid_to: '', amount: '',
      start_month: new Date().getMonth() + 1,
      start_year: new Date().getFullYear(),
      notes: '',
    }
  });

  // ==================== DIRECT EXPENSE FETCHERS ====================
  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getExpenses({
        page, limit: 20, search: searchTerm, category: categoryFilter,
        payment_method: paymentMethodFilter, date_from: dateFrom, date_to: dateTo
      });
      setExpensesData(data);
    } catch {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, paymentMethodFilter, dateFrom, dateTo]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getExpenseSummary();
      setSummaryData(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await getExpenseCategories();
      setExpenseCategories(cats);
    } catch (e) { console.error(e); }
  }, []);

  const fetchAllExpensesForPrint = async () => {
    setLoading(true);
    try {
      const data = await getExpenses({ page: 1, limit: 1000, search: searchTerm, category: categoryFilter, payment_method: paymentMethodFilter, date_from: dateFrom, date_to: dateTo });
      setPrintModal({ isOpen: true, allExpenses: data.expenses });
    } catch { toast.error('Failed to fetch expenses'); }
    finally { setLoading(false); }
  };

  // ==================== DUE EXPENSE FETCHERS ====================
  const fetchDue = useCallback(async (page = 1) => {
    setDueLoading(true);
    try {
      const data = await getDueExpenses({
        page, limit: 20, search: dueSearchTerm, month, year,
        category: dueCategoryFilter, status: dueStatusFilter
      });
      setDueData(data);
    } catch { toast.error('Failed to fetch due expenses'); }
    finally { setDueLoading(false); }
  }, [dueSearchTerm, month, year, dueCategoryFilter, dueStatusFilter]);

  const fetchDueSummary = useCallback(async () => {
    try {
      const data = await getDueExpenseSummary({ month, year });
      setDueSummary(data);
    } catch (e) { console.error(e); }
  }, [month, year]);

  // ==================== EFFECTS ====================
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'direct') { fetchExpenses(1); fetchSummary(); }
  }, [activeTab, fetchExpenses, fetchSummary]);

  useEffect(() => {
    if (activeTab === 'due') { fetchDue(1); fetchDueSummary(); }
  }, [activeTab, fetchDue, fetchDueSummary]);

  // Debounced re-fetch on search change for direct tab
  useEffect(() => {
    if (activeTab === 'direct') fetchExpenses(1);
  }, [searchTerm, categoryFilter, paymentMethodFilter, dateFrom, dateTo]);

  // Re-fetch due when search/filter changes
  useEffect(() => {
    if (activeTab === 'due') fetchDue(1);
  }, [dueSearchTerm, dueCategoryFilter, dueStatusFilter]);

  // ==================== DIRECT EXPENSE HANDLERS ====================
  const handleCreate = async (data) => {
    try {
      const payload = { ...data, amount: Number(data.amount), category: data.category?.value || data.category, payment_method: data.payment_method?.value || data.payment_method };
      if (fileInputRef.current?.files[0]) payload.bill_file = fileInputRef.current.files[0];
      await createExpense(payload);
      toast.success('Expense created successfully');
      setAddModal({ isOpen: false });
      resetAddForm();
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchExpenses(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    }
  };

  const handleUpdate = async () => {
    if (!editForm.category) { toast.error('Category is required'); return; }
    if (!editForm.paid_to) { toast.error('Paid To is required'); return; }
    if (!editForm.amount || Number(editForm.amount) <= 0) { toast.error('Amount must be greater than 0'); return; }
    if (!editForm.date) { toast.error('Date is required'); return; }
    try {
      await updateExpense(editModal.expense._id, { ...editForm, amount: Number(editForm.amount) });
      toast.success('Expense updated successfully');
      setEditModal({ isOpen: false, expense: null });
      fetchExpenses(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(deleteModal.expense._id);
      toast.success('Expense deleted successfully');
      setDeleteModal({ isOpen: false, expense: null });
      fetchExpenses(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const openEditModal = (expense) => {
    setEditModal({ isOpen: true, expense });
    setEditForm({
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: expense.category, paid_to: expense.paid_to,
      amount: expense.amount?.toString() || '', payment_method: expense.payment_method,
      reference_no: expense.reference_no || '', notes: expense.notes || '', bill_file: expense.bill_file || ''
    });
  };

  const handleViewReceipt = async (expenseId) => {
    setReceiptModal({ isOpen: true, loading: true, blobUrl: null, contentType: null });
    try {
      const blob = await viewReceipt(expenseId);
      setReceiptModal({ isOpen: true, loading: false, blobUrl: URL.createObjectURL(blob), contentType: blob.type });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load receipt');
      setReceiptModal({ isOpen: false, loading: false, blobUrl: null, contentType: null });
    }
  };

  const closeReceiptModal = () => {
    if (receiptModal.blobUrl) URL.revokeObjectURL(receiptModal.blobUrl);
    setReceiptModal({ isOpen: false, loading: false, blobUrl: null, contentType: null });
  };

  // ==================== DUE EXPENSE HANDLERS ====================
  const handleCreateDue = async (data) => {
    try {
      const payload = {
        category: selectedDueCategory?.value || data.category,
        paid_to: data.paid_to,
        amount: Number(data.amount),
        start_month: Number(data.start_month),
        start_year: Number(data.start_year),
        notes: data.notes || '',
      };
      await createDueExpense(payload);
      toast.success('Due expense subscription created');
      setDueModal({ isOpen: false, expense: null, isEdit: false });
      resetDue();
      setSelectedDueCategory(null);
      fetchDue(); fetchDueSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create due expense');
    }
  };

  const handleUpdateDue = async (data) => {
    try {
      const payload = {
        category: selectedDueCategory?.value || data.category,
        paid_to: data.paid_to,
        amount: Number(data.amount),
        notes: data.notes || '',
      };
      await updateDueExpense(dueModal.expense._id, payload);
      toast.success('Due expense updated');
      setDueModal({ isOpen: false, expense: null, isEdit: false });
      resetDue();
      setSelectedDueCategory(null);
      fetchDue(); fetchDueSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update due expense');
    }
  };

  const handleDeleteDue = async (id) => {
    const result = await Swal.fire({
      title: 'Delete subscription?', text: 'This will deactivate the recurring expense. Existing entries will be preserved.',
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete'
    });
    if (result.isConfirmed) {
      try {
        await deleteDueExpense(id);
        toast.success('Due expense deleted');
        fetchDue(); fetchDueSummary();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleMarkPayment = async () => {
    try {
      await markDueExpensePayment(paymentModal.entry._id, paymentForm);
      toast.success('Payment recorded successfully');
      setPaymentModal({ isOpen: false, expense: null, entry: null });
      setPaymentForm({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' });
      fetchDue(); fetchDueSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const openPaymentModal = (expense) => {
    const entry = expense.entry;
    setPaymentModal({ isOpen: true, expense, entry });
    setPaymentForm({ payment_amount: entry.balance.toString(), payment_method: 'cash', reference_no: '', notes: '' });
  };

  const openEditDue = (expense) => {
    setDueModal({ isOpen: true, expense, isEdit: true });
    resetDue({
      category: expense.category, paid_to: expense.paid_to,
      amount: expense.amount.toString(),
      start_month: expense.start_month, start_year: expense.start_year,
      notes: expense.notes || '',
    });
    setSelectedDueCategory({ value: expense.category, label: expense.category });
  };

  const openAddDue = () => {
    setDueModal({ isOpen: true, expense: null, isEdit: false });
    resetDue();
    setSelectedDueCategory(null);
  };

  const viewHistory = async (expense) => {
    try {
      const data = await getDueExpenseTemplateEntries(expense._id);
      setHistoryModal({ isOpen: true, history: data.entries, templateName: expense.paid_to });
    } catch {
      toast.error('Failed to fetch history');
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('finance.expense.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('finance.expense.description')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'due' && (
              <>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]">
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={openAddDue} className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus size={18} /> Add Due Expense
                </button>
              </>
            )}
            {activeTab === 'direct' && (
              <>
                <button onClick={() => setAddModal({ isOpen: true })} className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus size={18} />{t('finance.expense.addExpense')}
                </button>
                <button onClick={fetchAllExpensesForPrint} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Printer size={18} />{t('finance.expense.printReport')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#252731] rounded-xl mb-6 w-fit no-print">
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-[#1e1f25] text-[#0B65F6] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Direct Expense
        </button>
        <button
          onClick={() => setActiveTab('due')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'due' ? 'bg-white dark:bg-[#1e1f25] text-[#0B65F6] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Due Based
        </button>
      </div>

      {/* ===================== DUE BASED TAB ===================== */}
      {activeTab === 'due' && (
        <>
          {/* Due Summary Cards */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="sm:hidden flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25] text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {showStats ? t('common.hideSummary') : t('common.showSummary')}
            {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6`}>
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5">
              <p className="text-red-100 text-sm">Total Due</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{(dueSummary.total_due || 0).toLocaleString()}</h3>
            </div>
            <SummaryCard title="Total Paid" value={`₹${(dueSummary.total_paid || 0).toLocaleString()}`} icon={CheckCircle} color="bg-green-500" />
            <SummaryCard title="Pending" value={`₹${(dueSummary.total_pending || 0).toLocaleString()}`} icon={AlertCircle} color="bg-orange-500" />
            <SummaryCard title="Paid" value={dueSummary.paid_count || 0} subtext="subscriptions" icon={CheckCircle} color="bg-green-600" />
            <SummaryCard title="Partial" value={dueSummary.partial_count || 0} subtext="subscriptions" icon={TrendingUp} color="bg-yellow-500" />
            <SummaryCard title="Unpaid" value={(dueSummary.unpaid_count || 0) + (dueSummary.overdue_count || 0)} subtext="incl. overdue" icon={AlertCircle} color="bg-red-500" />
          </div>

          {/* Due Filter + Table */}
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden no-print">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="Search by payee or code..."
                    value={dueSearchTerm} onChange={(e) => setDueSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
                <select
                  value={dueStatusFilter} onChange={(e) => setDueStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Upcoming</option>
                </select>
                {(dueSearchTerm || dueStatusFilter || dueCategoryFilter) && (
                  <button
                    onClick={() => { setDueSearchTerm(''); setDueStatusFilter(''); setDueCategoryFilter(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                  >
                    <X size={16} /> Clear
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {dueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw size={32} className="text-[#0B65F6] animate-spin" />
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid To</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Monthly Amt</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Balance</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dueData.expenses.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <Wallet size={32} className="opacity-30" />
                                <p className="text-sm">No due expenses found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          dueData.expenses.map((expense) => {
                            const entry = expense.entry;
                            const entryStatus = entry?.status || 'upcoming';
                            const showActions = !!entry && entryStatus !== 'paid';
                            return (
                              <tr key={expense._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{expense.expense_code}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 capitalize">{expense.category?.replaceAll('_', ' ')}</td>
                                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.paid_to}</td>
                                <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">₹{expense.amount?.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                  {entry ? `₹${entry.balance?.toLocaleString()}` : '—'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(entryStatus)}`}>{entryStatus}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-1">
                                    {showActions && (
                                      <button onClick={() => openPaymentModal(expense)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark Payment">
                                        <IndianRupee size={16} />
                                      </button>
                                    )}
                                    <button onClick={() => viewHistory(expense)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View History">
                                      <History size={16} />
                                    </button>
                                    <button onClick={() => openEditDue(expense)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                      <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteDue(expense._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {dueData.expenses.length === 0 ? (
                      <p className="py-12 text-center text-gray-500 text-sm">No due expenses found.</p>
                    ) : (
                      dueData.expenses.map((expense) => {
                        const entry = expense.entry;
                        const entryStatus = entry?.status || 'upcoming';
                        const showActions = !!entry && entryStatus !== 'paid';
                        return (
                          <div key={expense._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{expense.paid_to}</p>
                                <p className="text-xs text-gray-500">{expense.expense_code} · {expense.category?.replaceAll('_', ' ')}</p>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full shrink-0 capitalize ${getStatusBadge(entryStatus)}`}>{entryStatus}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Monthly: <span className="font-medium text-gray-900 dark:text-white">₹{expense.amount?.toLocaleString()}</span></span>
                              {entry && <span className="text-gray-500">Balance: <span className="font-medium text-gray-900 dark:text-white">₹{entry.balance?.toLocaleString()}</span></span>}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              {showActions && (
                                <button onClick={() => openPaymentModal(expense)} className="flex-1 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium">Pay</button>
                              )}
                              <button onClick={() => viewHistory(expense)} className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">History</button>
                              <button onClick={() => openEditDue(expense)} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">Edit</button>
                              <button onClick={() => handleDeleteDue(expense._id)} className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg font-medium">Del</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {dueData.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">Showing {((dueData.page - 1) * 20) + 1}–{Math.min(dueData.page * 20, dueData.total)} of {dueData.total}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => fetchDue(dueData.page - 1)} disabled={dueData.page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50">
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Page {dueData.page} of {dueData.pages}</span>
                        <button onClick={() => fetchDue(dueData.page + 1)} disabled={dueData.page === dueData.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===================== DIRECT EXPENSE TAB ===================== */}
      {activeTab === 'direct' && (
        <>
          {/* Summary Cards */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="sm:hidden flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25] text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {showStats ? t('common.hideSummary') : t('common.showSummary')}
            {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8`}>
            <SummaryCard title={t('finance.expense.thisMonth')} value={`₹${summaryData.month_total?.toLocaleString()}`} icon={Calendar} color="bg-green-500" />
            <SummaryCard title={t('finance.expense.cashExpense')} value={`₹${summaryData.cash_total?.toLocaleString()}`} icon={Banknote} color="bg-yellow-500" />
            <SummaryCard title={t('finance.expense.bankExpense')} value={`₹${summaryData.bank_total?.toLocaleString()}`} icon={CreditCard} color="bg-purple-500" />
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-red-100 text-sm">{t('finance.expense.totalExpense')}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">₹{summaryData.total?.toLocaleString()}</h3>
                </div>
                <div className="p-3 rounded-xl bg-white/20"><Wallet size={24} className="text-white" /></div>
              </div>
            </div>
          </div>

          {/* Filter + Table */}
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 no-print">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" placeholder={t('finance.expense.searchPlaceholder')}
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    />
                  </div>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  <Select
                    value={categoryFilter ? { value: categoryFilter, label: categoryFilter } : null}
                    onChange={(s) => setCategoryFilter(s ? s.value : '')}
                    options={[{ value: '', label: 'All Categories' }, ...expenseCategories.map(c => ({ value: c.name, label: c.name }))]}
                    placeholder="All Categories"
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                  <Select
                    value={paymentMethodFilter ? { value: paymentMethodFilter, label: paymentMethodFilter.charAt(0).toUpperCase() + paymentMethodFilter.slice(1) } : null}
                    onChange={(s) => setPaymentMethodFilter(s ? s.value : '')}
                    options={[{ value: '', label: 'All Methods' }, { value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank', label: 'Bank' }]}
                    placeholder="All Methods"
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                {(searchTerm || categoryFilter || paymentMethodFilter || dateFrom || dateTo) && (
                  <div className="flex items-center">
                    <button onClick={() => { setSearchTerm(''); setCategoryFilter(''); setPaymentMethodFilter(''); setDateFrom(''); setDateTo(''); }} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">
                      <X size={16} /> Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw size={32} className="text-[#0B65F6] animate-spin" />
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('finance.expense.voucherNo')}</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.date')}</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.category')}</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('finance.expense.paidTo')}</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.amount')}</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('finance.expense.createdBy')}</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expensesData.expenses.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                              <div className="flex flex-col items-center gap-2">
                                <Wallet size={32} className="opacity-30" />
                                <p className="text-sm">{t('common.noData')}</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          expensesData.expenses.map((expense) => (
                            <tr key={expense._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{expense.voucher_no}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{moment(expense.updatedAt).format('DD MMM YYYY, h:mm A')}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.category}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.paid_to}</td>
                              <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">₹{expense.amount?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.created_by?.name || '-'}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => setViewModal({ isOpen: true, expense })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={18} /></button>
                                  <button onClick={() => openEditModal(expense)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                                  <button onClick={() => setDeleteModal({ isOpen: true, expense })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                                  {expense.bill_file && (
                                    <button onClick={() => handleViewReceipt(expense._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Receipt"><Image size={18} /></button>
                                  )}
                                  <button onClick={() => setVoucherModal({ isOpen: true, expense })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Print Voucher"><Printer size={18} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {expensesData.expenses.length === 0 ? (
                      <p className="py-12 text-center text-gray-500 text-sm">No expenses found.</p>
                    ) : (
                      expensesData.expenses.map((expense) => (
                        <div key={expense._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{expense.voucher_no}</p>
                              <p className="text-xs text-gray-500">{moment(expense.updatedAt).format('DD MMM YYYY, h:mm A')}</p>
                            </div>
                            <PaymentMethodBadge method={expense.payment_method} />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">{expense.category}</span> - {expense.paid_to}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{expense.amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => setViewModal({ isOpen: true, expense })} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">View</button>
                            {expense.bill_file && (
                              <button onClick={() => handleViewReceipt(expense._id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium text-center">Receipt</button>
                            )}
                            <button onClick={() => setVoucherModal({ isOpen: true, expense })} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">Voucher</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {expensesData.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">Showing {((expensesData.page - 1) * 20) + 1} to {Math.min(expensesData.page * 20, expensesData.total)} of {expensesData.total} entries</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => fetchExpenses(expensesData.page - 1)} disabled={expensesData.page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronLeft size={18} /></button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Page {expensesData.page} of {expensesData.pages}</span>
                        <button onClick={() => fetchExpenses(expensesData.page + 1)} disabled={expensesData.page === expensesData.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronRight size={18} /></button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===================== MODALS ===================== */}

      {/* Add/Edit Due Expense Modal */}
      <AnimatePresence>
        {dueModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{dueModal.isEdit ? 'Edit Due Expense' : 'Add Due Expense'}</h2>
                <button onClick={() => { setDueModal({ isOpen: false, expense: null, isEdit: false }); resetDue(); setSelectedDueCategory(null); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitDue(dueModal.isEdit ? handleUpdateDue : handleCreateDue)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <Select
                    value={selectedDueCategory}
                    onChange={setSelectedDueCategory}
                    options={expenseCategories.map(c => ({ value: c.name, label: c.name }))}
                    placeholder="Select category"
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                  {!selectedDueCategory && dueErrors.category && <p className="text-red-500 text-xs mt-1">Category is required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid To *</label>
                  <input {...registerDue('paid_to', { required: 'Paid To is required' })} placeholder="e.g. John Doe (Salary)" className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${dueErrors.paid_to ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  {dueErrors.paid_to && <p className="text-red-500 text-xs mt-1">{dueErrors.paid_to.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Amount *</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" {...registerDue('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' } })} onWheel={(e) => e.target.blur()} className={`w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${dueErrors.amount ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  </div>
                  {dueErrors.amount && <p className="text-red-500 text-xs mt-1">{dueErrors.amount.message}</p>}
                </div>
                {!dueModal.isEdit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Month *</label>
                      <select {...registerDue('start_month', { required: true })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]">
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Year *</label>
                      <select {...registerDue('start_year', { required: true })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea {...registerDue('notes')} rows={3} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => { setDueModal({ isOpen: false, expense: null, isEdit: false }); resetDue(); setSelectedDueCategory(null); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700">{dueModal.isEdit ? 'Update' : 'Create Subscription'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.isOpen && paymentModal.expense && paymentModal.entry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md">
              <div className="p-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mark Payment</h2>
                <button onClick={() => { setPaymentModal({ isOpen: false, expense: null, entry: null }); setPaymentForm({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' }); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Payee</span><span className="font-medium text-gray-900 dark:text-white">{paymentModal.expense.paid_to}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Month</span><span className="font-medium text-gray-900 dark:text-white">{MONTHS.find(m => m.value === paymentModal.entry.month)?.label} {paymentModal.entry.year}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Due</span><span className="font-medium text-gray-900 dark:text-white">₹{paymentModal.entry.amount?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Already Paid</span><span className="font-medium text-green-600">₹{paymentModal.entry.amount_paid?.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-700 pt-2"><span className="text-gray-700 dark:text-gray-300">Balance</span><span className="text-red-600">₹{paymentModal.entry.balance?.toLocaleString()}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Amount *</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" value={paymentForm.payment_amount} onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })} onWheel={(e) => e.target.blur()} className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                  <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]">
                    <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => { setPaymentModal({ isOpen: false, expense: null, entry: null }); setPaymentForm({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' }); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button onClick={handleMarkPayment} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">Record Payment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{historyModal.templateName}</p>
                </div>
                <button onClick={() => setHistoryModal({ isOpen: false, history: [], templateName: '' })} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {historyModal.history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">No history found.</p>
                ) : (
                  historyModal.history.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{MONTHS.find(m => m.value === entry.month)?.label} {entry.year}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Paid: ₹{entry.amount_paid?.toLocaleString()} / Due: ₹{entry.amount?.toLocaleString()}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(entry.status)}`}>{entry.status}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button onClick={() => setHistoryModal({ isOpen: false, history: [], templateName: '' })} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== DIRECT EXPENSE MODALS ===================== */}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {addModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.expense.addExpense')}</h2>
                <button onClick={() => { setAddModal({ isOpen: false }); resetAddForm(); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitAdd(handleCreate)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.date')} *</label>
                  <input type="date" {...registerAdd('date', { required: t('finance.expense.dateRequired') })} className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  {addErrors.date && <p className="text-red-500 text-xs mt-1">{addErrors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.category')} *</label>
                  <Controller
                    name="category" control={controlAdd} rules={{ required: t('finance.expense.categoryRequired') }}
                    render={({ field }) => (
                      <Select {...field} options={expenseCategories.map(c => ({ value: c.name, label: c.name }))} placeholder={t('common.selectCategory')} styles={selectStyles} classNamePrefix="react-select" />
                    )}
                  />
                  {addErrors.category && <p className="text-red-500 text-xs mt-1">{addErrors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid To *</label>
                  <input type="text" {...registerAdd('paid_to', { required: 'Paid To is required' })} className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.paid_to ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  {addErrors.paid_to && <p className="text-red-500 text-xs mt-1">{addErrors.paid_to.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.amount')} *</label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" {...registerAdd('amount', { required: t('finance.expense.amountRequired'), min: { value: 0.01, message: t('finance.expense.amountPositive') } })} onWheel={(e) => e.target.blur()} className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.amount ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  </div>
                  {addErrors.amount && <p className="text-red-500 text-xs mt-1">{addErrors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.paymentMethod')} *</label>
                  <Controller
                    name="payment_method" control={controlAdd} rules={{ required: t('finance.expense.paymentMethodRequired') }}
                    render={({ field }) => (
                      <Select {...field} options={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank', label: 'Bank' }]} placeholder={t('common.selectPaymentMethod')} styles={selectStyles} classNamePrefix="react-select" />
                    )}
                  />
                  {addErrors.payment_method && <p className="text-red-500 text-xs mt-1">{addErrors.payment_method.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill/Receipt Upload</label>
                  <input type="file" accept="image/*,.pdf" ref={fileInputRef} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  <p className="text-xs text-gray-500 mt-1">Accepts images (JPEG, PNG) and PDF files (Max 5MB)</p>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => { setAddModal({ isOpen: false }); resetAddForm(); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
                  <button type="submit" className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700">{t('finance.expense.saveExpense')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.expense.editExpense')}</h2>
                <button onClick={() => setEditModal({ isOpen: false, expense: null })} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.date')} *</label>
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.category')} *</label>
                  <Select value={editForm.category ? { value: editForm.category, label: editForm.category } : null} onChange={(s) => setEditForm({ ...editForm, category: s ? s.value : '' })} options={expenseCategories.map(c => ({ value: c.name, label: c.name }))} placeholder="Select Category" styles={selectStyles} classNamePrefix="react-select" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid To *</label>
                  <input type="text" value={editForm.paid_to} onChange={(e) => setEditForm({ ...editForm, paid_to: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.amount')} *</label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.paymentMethod')} *</label>
                  <Select value={editForm.payment_method ? { value: editForm.payment_method, label: editForm.payment_method.charAt(0).toUpperCase() + editForm.payment_method.slice(1) } : null} onChange={(s) => setEditForm({ ...editForm, payment_method: s ? s.value : '' })} options={[{ value: 'cash', label: 'Cash' }, { value: 'upi', label: 'UPI' }, { value: 'bank', label: 'Bank' }]} placeholder="Select Payment Method" styles={selectStyles} classNamePrefix="react-select" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill/Receipt Upload</label>
                  {editModal.expense?.bill_file && (
                    <div className="mb-2">
                      <button type="button" onClick={() => handleViewReceipt(editModal.expense._id)} className="text-sm text-blue-600 hover:underline">View Current File</button>
                    </div>
                  )}
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setEditForm({ ...editForm, bill_file: e.target.files[0] })} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]" />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing file.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setEditModal({ isOpen: false, expense: null })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button onClick={handleUpdate} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700">{t('finance.expense.updateExpense')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Expense Modal */}
      <AnimatePresence>
        {viewModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Details</h2>
                <button onClick={() => setViewModal({ isOpen: false, expense: null })} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Voucher No</p><p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.voucher_no}</p></div>
                  <div><p className="text-gray-500">{t('common.date')}</p><p className="font-medium text-gray-900 dark:text-white">{moment(viewModal.expense?.updatedAt).format('DD MMM YYYY, h:mm A')}</p></div>
                  <div><p className="text-gray-500">{t('common.category')}</p><p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.category}</p></div>
                  <div><p className="text-gray-500">Paid To</p><p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.paid_to}</p></div>
                  <div><p className="text-gray-500">{t('common.amount')}</p><p className="font-medium text-gray-900 dark:text-white">₹{viewModal.expense?.amount?.toLocaleString()}</p></div>
                  <div><p className="text-gray-500">{t('common.paymentMethod')}</p><p className="font-medium text-gray-900 dark:text-white capitalize">{viewModal.expense?.payment_method}</p></div>
                </div>
                {viewModal.expense?.notes && <div><p className="text-sm text-gray-500">Notes</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.expense.notes}</p></div>}
                <div><p className="text-sm text-gray-500">Added By</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.expense?.created_by?.name || '-'}</p></div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button onClick={() => setViewModal({ isOpen: false, expense: null })} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('finance.expense.deleteExpense')}?</h3>
                <p className="text-sm text-gray-500 mb-6">{t('finance.expense.deleteConfirm')}</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setDeleteModal({ isOpen: false, expense: null })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600">{t('common.delete')}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt View Modal */}
      <AnimatePresence>
        {receiptModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Receipt</h2>
                <button onClick={closeReceiptModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-[#0f1013] rounded-b-2xl overflow-auto flex items-center justify-center">
                {receiptModal.loading && (
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                )}
                {!receiptModal.loading && receiptModal.blobUrl && (
                  receiptModal.contentType?.startsWith('image/') ? (
                    <img src={receiptModal.blobUrl} alt="Receipt" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <iframe src={receiptModal.blobUrl} title="Receipt" className="w-full h-full border-0" />
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Modal */}
      <AnimatePresence>
        {voucherModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Voucher</h2>
                <button onClick={() => setVoucherModal({ isOpen: false, expense: null })} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6">
                <div ref={voucherRef} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6" style={{ width: '80mm', margin: '0 auto' }}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">EXPENSE VOUCHER</h3>
                    <p className="text-sm text-gray-500">{voucherModal.expense?.voucher_no}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">{t('common.date')}:</span><span className="font-medium text-gray-900 dark:text-white">{moment(voucherModal.expense?.updatedAt).format('DD MMM YYYY, h:mm A')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('common.category')}:</span><span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.category}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Paid To:</span><span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.paid_to}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('common.amount')}:</span><span className="font-medium text-gray-900 dark:text-white">₹{voucherModal.expense?.amount?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">{t('common.paymentMethod')}:</span><span className="font-medium text-gray-900 dark:text-white capitalize">{voucherModal.expense?.payment_method}</span></div>
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700"><span className="text-gray-500">Added By:</span><span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.created_by?.name || '-'}</span></div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setVoucherModal({ isOpen: false, expense: null })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
                <button onClick={() => { if (voucherRef.current) { const pc = voucherRef.current.innerHTML; document.body.innerHTML = `<html><head><title>Voucher</title></head><body>${pc}</body></html>`; window.print(); window.location.reload(); } }} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700 flex items-center gap-2"><Printer size={18} />Print</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {printModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Report</h2>
                <button onClick={() => setPrintModal({ isOpen: false, allExpenses: [] })} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]" id="print-content">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Voucher No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Paid To</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printModal.allExpenses.map((expense) => (
                      <tr key={expense._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{expense.voucher_no}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{moment(expense.updatedAt).format('DD MMM YYYY, h:mm A')}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{expense.category}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{expense.paid_to}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">₹{expense.amount?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300 capitalize">{expense.payment_method}</td>
                      </tr>
                    ))}
                    {printModal.allExpenses.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No expenses found</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                      <td colSpan={4} className="py-3 px-4 font-bold text-gray-900 dark:text-white text-right">Total:</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white text-right">₹{printModal.allExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setPrintModal({ isOpen: false, allExpenses: [] })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Close</button>
                <button onClick={() => { const pc = document.getElementById('print-content'); document.body.innerHTML = pc.innerHTML; window.print(); window.location.reload(); }} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl text-sm hover:bg-blue-700 flex items-center gap-2"><Printer size={18} />Print</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expense;
