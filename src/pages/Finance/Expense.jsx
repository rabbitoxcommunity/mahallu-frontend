import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  IndianRupee,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  Printer,
  Plus,
  X,
  Edit2,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../../api/expenseService';
import {
  getExpenseCategories
} from '../../api/expenseCategoryService';

// Add print styles
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
    body {
      background: white !important;
    }
    .print-only {
      display: block !important;
    }
    /* Hide common sidebar selectors */
    aside,
    nav,
    [class*="sidebar"],
    [class*="Sidebar"],
    [class*="menu"],
    [class*="Menu"] {
      display: none !important;
    }
    /* Hide header elements */
    header,
    [class*="header"],
    [class*="Header"] {
      display: none !important;
    }
  }
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}

// Payment method badge
const PaymentMethodBadge = ({ method }) => {
  const styles = {
    cash: 'bg-green-100 text-green-700 border-green-200',
    upi: 'bg-blue-100 text-blue-700 border-blue-200',
    bank: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  const icons = {
    cash: Banknote,
    upi: Smartphone,
    bank: CreditCard
  };

  const Icon = icons[method] || Banknote;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[method] || styles.cash}`}>
      <Icon size={12} />
      <span className="capitalize">{method}</span>
    </span>
  );
};

const Expense = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const [expensesData, setExpensesData] = useState({
    expenses: [],
    total: 0,
    page: 1,
    pages: 1
  });

  const [summaryData, setSummaryData] = useState({
    today_total: 0,
    month_total: 0,
    cash_total: 0,
    bank_total: 0,
    total: 0
  });

  const [expenseCategories, setExpenseCategories] = useState([]);

  // Modal states
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [viewModal, setViewModal] = useState({ isOpen: false, expense: null });
  const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, expense: null });
  const [printModal, setPrintModal] = useState({ isOpen: false, allExpenses: [] });

  // File input ref
  const fileInputRef = useRef(null);

  // React Hook Form for Add Expense
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAddForm,
    control: controlAdd,
    setValue: setValueAdd
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: '',
      paid_to: '',
      amount: '',
      payment_method: 'cash',
      reference_no: '',
      notes: '',
      bill_file: ''
    }
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    date: '',
    category: '',
    paid_to: '',
    amount: '',
    payment_method: 'cash',
    reference_no: '',
    notes: '',
    bill_file: ''
  });

  // Fetch expenses
  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getExpenses({
        page,
        limit: 20,
        search: searchTerm,
        category: categoryFilter,
        payment_method: paymentMethodFilter,
        date_from: dateFrom,
        date_to: dateTo
      });
      setExpensesData(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const data = await getExpenseSummary();
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch expense categories
  const fetchCategories = async () => {
    try {
      const categories = await getExpenseCategories();
      setExpenseCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch all expenses for printing
  const fetchAllExpensesForPrint = async () => {
    setLoading(true);
    try {
      const data = await getExpenses({
        page: 1,
        limit: 1000, // Fetch all expenses
        search: searchTerm,
        category: categoryFilter,
        payment_method: paymentMethodFilter,
        date_from: dateFrom,
        date_to: dateTo
      });
      setPrintModal({ isOpen: true, allExpenses: data.expenses });
    } catch (error) {
      console.error('Error fetching expenses for print:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedFetchExpenses = useCallback(
    debounce((page) => fetchExpenses(page), 500),
    [searchTerm, categoryFilter, paymentMethodFilter, dateFrom, dateTo]
  );

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

  // Handle create expense
  const handleCreate = async (data) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        category: data.category?.value || data.category,
        payment_method: data.payment_method?.value || data.payment_method
      };
      // Get file from ref
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        payload.bill_file = fileInputRef.current.files[0];
      }
      await createExpense(payload);
      toast.success('Expense created successfully');
      setAddModal({ isOpen: false });
      resetAddForm();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(error.response?.data?.message || 'Failed to create expense');
    }
  };

  // Handle update expense
  const handleUpdate = async () => {
    // Validation
    if (!editForm.category) {
      toast.error('Category is required');
      return;
    }
    if (!editForm.paid_to) {
      toast.error('Paid To is required');
      return;
    }
    if (!editForm.amount) {
      toast.error('Amount is required');
      return;
    }
    if (!editForm.date) {
      toast.error('Date is required');
      return;
    }

    try {
      const payload = {
        ...editForm,
        amount: Number(editForm.amount)
      };
      await updateExpense(editModal.expense._id, payload);
      toast.success('Expense updated successfully');
      setEditModal({ isOpen: false, expense: null });
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error(error.response?.data?.message || 'Failed to update expense');
    }
  };

  // Handle delete expense
  const handleDelete = async () => {
    try {
      await deleteExpense(deleteModal.expense._id);
      toast.success('Expense deleted successfully');
      setDeleteModal({ isOpen: false, expense: null });
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  };


  // Open edit modal
  const openEditModal = (expense) => {
    setEditModal({ isOpen: true, expense });
    setEditForm({
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: expense.category,
      paid_to: expense.paid_to,
      amount: expense.amount?.toString() || '',
      payment_method: expense.payment_method,
      reference_no: expense.reference_no || '',
      notes: expense.notes || '',
      bill_file: expense.bill_file || ''
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchExpenses();
    fetchSummary();
    fetchCategories();
  }, []);

  // Debounced search effect
  useEffect(() => {
    debouncedFetchExpenses(1);
  }, [searchTerm, categoryFilter, paymentMethodFilter, dateFrom, dateTo]);

  // Summary Card Component
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

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track all outgoing money spent by Mahallu</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAddModal({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Expense
            </button>
            <button
              onClick={fetchAllExpensesForPrint}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {/* <SummaryCard
          title="Today Expense"
          value={`₹${summaryData.today_total.toLocaleString()}`}
          icon={Calendar}
          color="bg-blue-500"
        /> */}
        <SummaryCard
          title="This Month"
          value={`₹${summaryData.month_total.toLocaleString()}`}
          icon={Calendar}
          color="bg-green-500"
        />
        <SummaryCard
          title="Cash Expense"
          value={`₹${summaryData.cash_total.toLocaleString()}`}
          icon={Banknote}
          color="bg-yellow-500"
        />
        <SummaryCard
          title="UPI/Bank Expense"
          value={`₹${summaryData.bank_total.toLocaleString()}`}
          icon={CreditCard}
          color="bg-purple-500"
        />
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-100">Total Expense</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{summaryData.total.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-white/20">
              <Wallet size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 no-print">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                />
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              />
              <Select
                value={categoryFilter ? { value: categoryFilter, label: categoryFilter } : null}
                onChange={(selected) => setCategoryFilter(selected ? selected.value : '')}
                options={[{ value: '', label: 'All Categories' }, ...expenseCategories.map(cat => ({ value: cat.name, label: cat.name }))]}
                placeholder="All Categories"
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#f9fafb',
                    borderColor: '#e5e7eb',
                    height: '42px',
                    minHeight: '42px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: '#ffffff',
                    zIndex: 50,
                    borderRadius: '12px'
                  }),
                  option: (provided) => ({
                    ...provided,
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#374151'
                  })
                }}
              />
              <Select
                value={paymentMethodFilter ? { value: paymentMethodFilter, label: paymentMethodFilter.charAt(0).toUpperCase() + paymentMethodFilter.slice(1) } : null}
                onChange={(selected) => setPaymentMethodFilter(selected ? selected.value : '')}
                options={[
                  { value: '', label: 'All Methods' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'bank', label: 'Bank' }
                ]}
                placeholder="All Methods"
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#f9fafb',
                    borderColor: '#e5e7eb',
                    height: '42px',
                    minHeight: '42px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: '#ffffff',
                    zIndex: 50,
                    borderRadius: '12px'
                  }),
                  option: (provided) => ({
                    ...provided,
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#374151'
                  })
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              {(searchTerm || categoryFilter || paymentMethodFilter || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setPaymentMethodFilter('');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
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
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Voucher No</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid To</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Added By</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesData.expenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Wallet size={32} className="opacity-30" />
                            <p className="text-sm">No expenses found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      expensesData.expenses.map((expense) => (
                        <tr key={expense._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{expense.voucher_no}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.category}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.paid_to}</td>
                          <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                            ₹{expense.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <PaymentMethodBadge method={expense.payment_method} />
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.created_by?.name || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewModal({ isOpen: true, expense })}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(expense)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, expense })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                              {expense.bill_file && (
                                <a
                                  href={`http://localhost:5005/uploads/${expense.bill_file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="View Receipt"
                                >
                                  <Download size={18} />
                                </a>
                              )}
                              <button
                                onClick={() => setVoucherModal({ isOpen: true, expense })}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Print Voucher"
                              >
                                <Printer size={18} />
                              </button>
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
                  <p className="py-12 text-center text-gray-500">No expenses found.</p>
                ) : (
                  expensesData.expenses.map((expense) => (
                    <div key={expense._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{expense.voucher_no}</p>
                          <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <PaymentMethodBadge method={expense.payment_method} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{expense.category}</span> - {expense.paid_to}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">₹{expense.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setViewModal({ isOpen: true, expense })}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          View
                        </button>
                        {expense.bill_file && (
                          <a
                            href={`http://localhost:5005/uploads/${expense.bill_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium text-center"
                          >
                            Receipt
                          </a>
                        )}
                        <button
                          onClick={() => setVoucherModal({ isOpen: true, expense })}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                        >
                          Voucher
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {expensesData.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((expensesData.page - 1) * 20) + 1} to {Math.min(expensesData.page * 20, expensesData.total)} of {expensesData.total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchExpenses(expensesData.page - 1)}
                      disabled={expensesData.page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {expensesData.page} of {expensesData.pages}
                    </span>
                    <button
                      onClick={() => fetchExpenses(expensesData.page + 1)}
                      disabled={expensesData.page === expensesData.pages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {addModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Expense</h2>
                  <button
                    onClick={() => {
                      setAddModal({ isOpen: false });
                      resetAddForm();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitAdd(handleCreate)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    {...registerAdd('date', { required: 'Date is required' })}
                    className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                  />
                  {addErrors.date && <p className="text-red-500 text-xs mt-1">{addErrors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <Controller
                    name="category"
                    control={controlAdd}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={expenseCategories.map(cat => ({ value: cat.name, label: cat.name }))}
                        placeholder="Select Category"
                        className={`react-select-container ${addErrors.category ? 'react-select-error' : ''}`}
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: '#f9fafb',
                            borderColor: addErrors.category ? '#ef4444' : '#e5e7eb',
                            height: '42px',
                            minHeight: '42px',
                            borderRadius: '12px',
                            fontSize: '14px'
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: '#ffffff',
                            zIndex: 50,
                            borderRadius: '12px'
                          }),
                          option: (provided) => ({
                            ...provided,
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            '&:hover': {
                              backgroundColor: '#f3f4f6'
                            }
                          })
                        }}
                      />
                    )}
                  />
                  {addErrors.category && <p className="text-red-500 text-xs mt-1">{addErrors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid To *</label>
                  <input
                    type="text"
                    {...registerAdd('paid_to', { required: 'Paid To is required' })}
                    className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.paid_to ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                  />
                  {addErrors.paid_to && <p className="text-red-500 text-xs mt-1">{addErrors.paid_to.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      {...registerAdd('amount', { 
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6] ${addErrors.amount ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                    />
                  </div>
                  {addErrors.amount && <p className="text-red-500 text-xs mt-1">{addErrors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method *</label>
                  <Controller
                    name="payment_method"
                    control={controlAdd}
                    rules={{ required: 'Payment Method is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { value: 'cash', label: 'Cash' },
                          { value: 'upi', label: 'UPI' },
                          { value: 'bank', label: 'Bank' }
                        ]}
                        placeholder="Select Payment Method"
                        className={`react-select-container ${addErrors.payment_method ? 'react-select-error' : ''}`}
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: '#f9fafb',
                            borderColor: addErrors.payment_method ? '#ef4444' : '#e5e7eb',
                            height: '42px',
                            minHeight: '42px',
                            borderRadius: '12px',
                            fontSize: '14px'
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: '#ffffff',
                            zIndex: 50,
                            borderRadius: '12px'
                          }),
                          option: (provided) => ({
                            ...provided,
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            '&:hover': {
                              backgroundColor: '#f3f4f6'
                            }
                          })
                        }}
                      />
                    )}
                  />
                  {addErrors.payment_method && <p className="text-red-500 text-xs mt-1">{addErrors.payment_method.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill/Receipt Upload</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={fileInputRef}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepts images (JPEG, PNG) and PDF files (Max 5MB)</p>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference No</label>
                  <input
                    type="text"
                    value={addForm.reference_no}
                    onChange={(e) => setAddForm({ ...addForm, reference_no: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={addForm.notes}
                    onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    rows="3"
                  />
                </div> */}

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModal({ isOpen: false });
                      resetAddForm();
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700"
                  >
                    Save Expense
                  </button>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Expense</h2>
                  <button
                    onClick={() => setEditModal({ isOpen: false, expense: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <Select
                    value={editForm.category ? { value: editForm.category, label: editForm.category } : null}
                    onChange={(selected) => setEditForm({ ...editForm, category: selected ? selected.value : '' })}
                    options={expenseCategories.map(cat => ({ value: cat.name, label: cat.name }))}
                    placeholder="Select Category"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: '#f9fafb',
                        borderColor: '#e5e7eb',
                        height: '42px',
                        minHeight: '42px',
                        borderRadius: '12px',
                        fontSize: '14px'
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: '#ffffff',
                        zIndex: 50,
                        borderRadius: '12px'
                      }),
                      option: (provided) => ({
                        ...provided,
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        '&:hover': {
                          backgroundColor: '#f3f4f6'
                        }
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#374151'
                      })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paid To *</label>
                  <input
                    type="text"
                    value={editForm.paid_to}
                    onChange={(e) => setEditForm({ ...editForm, paid_to: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
                  <div className="relative">
                    <IndianRupee size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method *</label>
                  <Select
                    value={editForm.payment_method ? { value: editForm.payment_method, label: editForm.payment_method.charAt(0).toUpperCase() + editForm.payment_method.slice(1) } : null}
                    onChange={(selected) => setEditForm({ ...editForm, payment_method: selected ? selected.value : '' })}
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'upi', label: 'UPI' },
                      { value: 'bank', label: 'Bank' }
                    ]}
                    placeholder="Select Payment Method"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: '#f9fafb',
                        borderColor: '#e5e7eb',
                        height: '42px',
                        minHeight: '42px',
                        borderRadius: '12px',
                        fontSize: '14px'
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: '#ffffff',
                        zIndex: 50,
                        borderRadius: '12px'
                      }),
                      option: (provided) => ({
                        ...provided,
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        '&:hover': {
                          backgroundColor: '#f3f4f6'
                        }
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#374151'
                      })
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill/Receipt Upload</label>
                  {editModal.expense?.bill_file && (
                    <div className="mb-2">
                      <a
                        href={`http://localhost:5005/uploads/${editModal.expense.bill_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Current File
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setEditForm({ ...editForm, bill_file: file });
                    }}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepts images (JPEG, PNG) and PDF files (Max 5MB). Leave empty to keep existing file.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reference No</label>
                  <input
                    type="text"
                    value={editForm.reference_no}
                    onChange={(e) => setEditForm({ ...editForm, reference_no: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                    rows="3"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setEditModal({ isOpen: false, expense: null })}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700"
                >
                  Update Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Expense Modal */}
      <AnimatePresence>
        {viewModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Details</h2>
                  <button
                    onClick={() => setViewModal({ isOpen: false, expense: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Voucher No</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.voucher_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(viewModal.expense?.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid To</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.paid_to}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">₹{viewModal.expense?.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{viewModal.expense?.payment_method}</p>
                  </div>
                </div>
                {viewModal.expense?.reference_no && (
                  <div>
                    <p className="text-sm text-gray-500">Reference No</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense.reference_no}</p>
                  </div>
                )}
                {viewModal.expense?.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Added By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewModal.expense?.created_by?.name || '-'}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setViewModal({ isOpen: false, expense: null })}
                  className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Expense?</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setDeleteModal({ isOpen: false, expense: null })}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Modal */}
      <AnimatePresence>
        {voucherModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Voucher</h2>
                  <button
                    onClick={() => setVoucherModal({ isOpen: false, expense: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4" id="voucher-content">
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">EXPENSE VOUCHER</h3>
                    <p className="text-sm text-gray-500">{voucherModal.expense?.voucher_no}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(voucherModal.expense?.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid To:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.paid_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{voucherModal.expense?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{voucherModal.expense?.payment_method}</span>
                    </div>
                    {voucherModal.expense?.reference_no && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reference No:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense.reference_no}</span>
                      </div>
                    )}
                    {voucherModal.expense?.notes && (
                      <div>
                        <span className="text-gray-500">Notes:</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">{voucherModal.expense.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-500">Added By:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{voucherModal.expense?.created_by?.name || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setVoucherModal({ isOpen: false, expense: null })}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {printModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Report</h2>
                  <button
                    onClick={() => setPrintModal({ isOpen: false, allExpenses: [] })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[70vh]" id="print-content">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Voucher No</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Paid To</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printModal.allExpenses.map((expense) => (
                      <tr key={expense._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{expense.voucher_no}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.category}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{expense.paid_to}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ₹{expense.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {expense.payment_method}
                        </td>
                      </tr>
                    ))}
                    {printModal.allExpenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          No expenses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                      <td colSpan={4} className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                        Total:
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                        ₹{printModal.allExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setPrintModal({ isOpen: false, allExpenses: [] })}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const printContent = document.getElementById('print-content');
                    const originalContent = document.body.innerHTML;
                    document.body.innerHTML = printContent.innerHTML;
                    window.print();
                    document.body.innerHTML = originalContent;
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expense;
