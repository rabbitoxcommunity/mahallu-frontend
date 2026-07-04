/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IndianRupee, Search, Filter, ChevronLeft, ChevronRight, Plus,
  History, Edit2, Trash2, Download, X, CheckCircle, Calendar,
  CreditCard, Banknote, Smartphone, Receipt, AlertCircle, TrendingUp,
  Wallet, Building2, ShoppingBag, Palmtree, Home, MoreHorizontal,
  DollarSign, PartyPopper, Heart, Box, Eye, Printer, MessageCircle, Phone,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { getDueIncome, getDirectIncome, createDueIncome, updateDueIncome, deleteDueIncome, createDirectIncome, updateDirectIncome, deleteDirectIncome, getIncomeSummary, markDuePayment, getDuePaymentHistory, getTemplateEntries } from '../../api/incomeService';
import { getHadiyaSummary } from '../../api/hadiyaService';
import { getIncomeCategories } from '../../api/incomeCategoryService';
import IncomeReceipt from './IncomeReceipt';
import QuickHadiya from './QuickHadiya';

export const Income = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('incomeActiveTab');
    return savedTab || 'due';
  });
  // Persist the selected Month/Year so a page refresh keeps the same view
  // instead of resetting to the current month.
  const [month, setMonth] = useState(() => {
    const saved = localStorage.getItem('incomeViewMonth');
    return saved ? Number(saved) : new Date().getMonth() + 1;
  });
  const [year, setYear] = useState(() => {
    const saved = localStorage.getItem('incomeViewYear');
    return saved ? Number(saved) : new Date().getFullYear();
  });
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dueCategories, setDueCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const [summary, setSummary] = useState({
    due_based: {}, direct: {},
    total_income: 0, this_month_income: 0, pending_amount: 0
  });

  const [hadiyaSummary, setHadiyaSummary] = useState({
    today_total: 0,
    today_count: 0,
    month_total: 0,
    month_count: 0,
    house_total: 0,
    house_count: 0,
    external_total: 0,
    external_count: 0
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('incomeActiveTab', activeTab);
  }, [activeTab]);

  const [dueData, setDueData] = useState({ incomes: [], total: 0, page: 1, pages: 1 });
  const [directData, setDirectData] = useState({ incomes: [], total: 0, page: 1, pages: 1 });

  // Modals
  const [dueModal, setDueModal] = useState({ isOpen: false, income: null, isEdit: false });
  const [directModal, setDirectModal] = useState({ isOpen: false, income: null, isEdit: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, income: null, entry: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, history: [], templateName: '', income: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, income: null, type: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, income: null });
  const [reminderModal, setReminderModal] = useState({ isOpen: false, income: null, phone: '', message: '', language: 'en' });

  // Forms with react-hook-form
  const {
    register: registerDue,
    handleSubmit: handleSubmitDue,
    reset: resetDue,
    setValue: setDueValue,
    trigger: triggerDue,
    formState: { errors: dueErrors }
  } = useForm({
    defaultValues: {
      start_month: new Date().getMonth() + 1,
      start_year: new Date().getFullYear(),
      category: '',
      source_name: '',
      whatsapp: '',
      amount_due: '',
      notes: '',
    }
  });

  const {
    register: registerDirect,
    handleSubmit: handleSubmitDirect,
    reset: resetDirect,
    setValue: setDirectValue,
    trigger: triggerDirect,
    formState: { errors: directErrors }
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'donation',
      source_name: '',
      amount: '',
      payment_method: 'cash'
    }
  });

  const [selectedDueCategory, setSelectedDueCategory] = useState(null);
  const [selectedDirectCategory, setSelectedDirectCategory] = useState(null);

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

  // Common react-select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      fontSize: '14px',
      borderColor: state.isFocused ? '#0B65F6' : '#e5e7eb',
      '&:hover': { borderColor: state.isFocused ? '#0B65F6' : '#d1d5db' },
      boxShadow: state.isFocused ? '0 0 0 3px rgba(11, 101, 246, 0.1)' : 'none',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1e1f25' : '#ffffff',
      borderRadius: '0.5rem'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1e1f25' : '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 50
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.25rem',
      borderRadius: '0.5rem'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#252731' : '#f3f4f6') : 'transparent',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#2f3038' : '#e5e7eb'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
    }),
    placeholder: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
      '&:hover': {
        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
      '&:hover': {
        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
      }
    })
  };
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Fetch income categories
  const fetchCategories = useCallback(async () => {
    try {
      const dueCats = await getIncomeCategories({ type: 'due' });
      const incCats = await getIncomeCategories({ type: 'direct' });
      setDueCategories(dueCats);
      setIncomeCategories(incCats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('finance.income.fetchCategoriesFailed'));
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getIncomeSummary({ month, year });
      setSummary(res);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [month, year]);

  const fetchHadiyaSummaryData = useCallback(async () => {
    try {
      const res = await getHadiyaSummary();
      setHadiyaSummary(res);
    } catch (error) {
      console.error('Error fetching hadiya summary:', error);
    }
  }, []);

  const fetchDue = useCallback(async (page = 1) => {
    try {
      const data = await getDueIncome({
        page, limit: 20, search: searchTerm, month, year,
        category: categoryFilter, status: statusFilter
      });
      setDueData(data);
    } catch {
      toast.error(t('finance.income.fetchDueFailed'));
    }
  }, [searchTerm, month, year, categoryFilter, statusFilter, t]);

  const fetchDirect = useCallback(async (page = 1) => {
    try {
      const data = await getDirectIncome({
        page, limit: 20, search: searchTerm, month, year,
        category: categoryFilter, payment_method: paymentMethodFilter
      });
      setDirectData(data);
    } catch {
      toast.error(t('finance.income.fetchDirectFailed'));
    }
  }, [searchTerm, month, year, categoryFilter, paymentMethodFilter, t]);

  useEffect(() => {
    localStorage.setItem('incomeViewMonth', String(month));
    localStorage.setItem('incomeViewYear', String(year));
  }, [month, year]);

  useEffect(() => {
    fetchSummary();
  }, [month, year, fetchSummary]);

  useEffect(() => {
    if (activeTab === 'hadiya') fetchHadiyaSummaryData();
  }, [activeTab, fetchHadiyaSummaryData]);

  useEffect(() => {
    if (activeTab === 'due') fetchDue(1);
    else if (activeTab === 'direct') fetchDirect(1);
  }, [activeTab, fetchDue, fetchDirect]);

  const handleCreateDue = async (data) => {
    try {
      const payload = {
        category: selectedDueCategory?.value || data.category,
        source_name: data.source_name,
        whatsapp: data.whatsapp || '',
        amount_due: Number(data.amount_due),
        start_month: Number(data.start_month),
        start_year: Number(data.start_year),
        notes: data.notes || '',
      };
      await createDueIncome(payload);
      toast.success(t('finance.income.dueIncomeCreated'));
      setDueModal({ isOpen: false, income: null, isEdit: false });
      resetDue();
      setSelectedDueCategory(null);
      // Jump the table view to the subscription's start month so the newly created entry is visible
      // (otherwise the view stays on the current month and shows a later auto-generated entry).
      const startM = Number(data.start_month);
      const startY = Number(data.start_year);
      if (startM === month && startY === year) {
        // Already viewing the start month — closure values are current, so fetch directly.
        fetchDue(); fetchSummary();
      } else {
        // Changing month/year re-runs the fetch effects with the new values.
        // Avoid calling fetchDue() here too — that would fire a second request with the
        // stale (old) month and can race the correct one, overwriting it.
        setMonth(startM);
        setYear(startY);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdateDue = async (data) => {
    try {
      const payload = {
        category: selectedDueCategory?.value || data.category,
        source_name: data.source_name,
        whatsapp: data.whatsapp || '',
        amount_due: Number(data.amount_due),
        notes: data.notes || '',
      };
      await updateDueIncome(dueModal.income._id, payload);
      toast.success(t('finance.income.dueIncomeUpdated'));
      setDueModal({ isOpen: false, income: null, isEdit: false });
      resetDue();
      setSelectedDueCategory(null);
      fetchDue(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteDue = async (id) => {
    const result = await Swal.fire({ title: t('finance.income.deleteConfirm'), text: t('finance.income.deleteConfirmText'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: t('finance.income.yesDelete') });
    if (result.isConfirmed) {
      try {
        await deleteDueIncome(id);
        toast.success(t('finance.income.incomeDeleted'));
        fetchDue(); fetchSummary();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleMarkPayment = async () => {
    try {
      await markDuePayment(paymentModal.entry._id, paymentForm);
      toast.success(t('finance.income.paymentRecorded'));
      setPaymentModal({ isOpen: false, income: null, entry: null });
      setPaymentForm({ payment_amount: '', payment_method: 'cash', reference_no: '', notes: '' });
      fetchDue(); fetchSummary();
      // If paid from the Subscription History modal, refresh its list in place
      // so the user can keep clearing other overdue months without reopening it.
      if (historyModal.isOpen && historyModal.income) {
        const data = await getTemplateEntries(historyModal.income._id);
        setHistoryModal(prev => ({ ...prev, history: data.entries }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('finance.income.paymentRecorded'));
    }
  };

  const handleCreateDirect = async (data) => {
    try {
      const payload = {
        date: data.date,
        category: selectedDirectCategory?.value || data.category || 'donation',
        source_name: data.source_name,
        amount: Number(data.amount),
        payment_method: data.payment_method
      };
      await createDirectIncome(payload);
      toast.success(t('finance.income.directIncomeCreated'));
      setDirectModal({ isOpen: false, income: null, isEdit: false });
      resetDirect();
      setSelectedDirectCategory(null);
      fetchDirect(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdateDirect = async (data) => {
    try {
      const payload = {
        date: data.date,
        category: selectedDirectCategory?.value || data.category,
        source_name: data.source_name,
        amount: Number(data.amount),
        payment_method: data.payment_method
      };
      await updateDirectIncome(directModal.income._id, payload);
      toast.success(t('finance.income.directIncomeUpdated'));
      setDirectModal({ isOpen: false, income: null, isEdit: false });
      resetDirect();
      setSelectedDirectCategory(null);
      fetchDirect(); fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteDirect = async (id) => {
    const result = await Swal.fire({ title: t('finance.income.deleteConfirm'), text: t('finance.income.deleteConfirmText'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: t('finance.income.yesDelete') });
    if (result.isConfirmed) {
      try {
        await deleteDirectIncome(id);
        toast.success(t('finance.income.incomeDeleted'));
        fetchDirect(); fetchSummary();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const viewHistory = async (income) => {
    try {
      const data = await getTemplateEntries(income._id);
      setHistoryModal({ isOpen: true, history: data.entries, templateName: income.source_name, income });
    } catch {
      toast.error(t('finance.income.fetchPaymentHistoryFailed'));
    }
  };

  const openPaymentModalForEntry = (income, entry) => {
    setPaymentModal({ isOpen: true, income, entry });
    setPaymentForm({ payment_amount: entry.balance.toString(), payment_method: 'cash', reference_no: '', notes: '' });
  };

  const openPaymentModal = (income) => openPaymentModalForEntry(income, income.entry);

  const openEditDue = (income) => {
    setDueModal({ isOpen: true, income, isEdit: true });
    resetDue({
      start_month: income.start_month,
      start_year: income.start_year,
      category: income.category,
      source_name: income.source_name,
      whatsapp: income.whatsapp || '',
      amount_due: income.amount_due.toString(),
      notes: income.notes || '',
    });
    setSelectedDueCategory({ value: income.category, label: income.category });
  };

  const openAddDue = () => {
    setDueModal({
      isOpen: true,
      income: null,
      isEdit: false
    });
    resetDue();
    setSelectedDueCategory(null);
  };

  const openEditDirect = (income) => {
    setDirectModal({
      isOpen: true,
      income,
      isEdit: true
    });
    resetDirect({
      date: new Date(income.date).toISOString().split('T')[0],
      category: income.category,
      source_name: income.source_name,
      amount: income.amount.toString(),
      payment_method: income.payment_method
    });
    setSelectedDirectCategory({ value: income.category, label: income.category });
  };

  const openAddDirect = () => {
    setDirectModal({
      isOpen: true,
      income: null,
      isEdit: false
    });
    resetDirect({
      date: new Date().toISOString().split('T')[0],
      category: '',
      source_name: '',
      amount: '',
      payment_method: 'cash'
    });
    setSelectedDirectCategory(null);
  };

  const isEntryCurrentOrPast = (entryMonth, entryYear) => {
    const now = new Date();
    const cm = now.getMonth() + 1;
    const cy = now.getFullYear();
    return entryYear < cy || (entryYear === cy && entryMonth <= cm);
  };

  const malayalamMonths = {
    1: 'ജനുവരി', 2: 'ഫെബ്രുവരി', 3: 'മാർച്ച്', 4: 'ഏപ്രിൽ',
    5: 'മെയ്', 6: 'ജൂൺ', 7: 'ജൂലൈ', 8: 'ഓഗസ്റ്റ്',
    9: 'സെപ്റ്റംബർ', 10: 'ഒക്ടോബർ', 11: 'നവംബർ', 12: 'ഡിസംബർ'
  };

  const buildReminderMessage = (income, language) => {
    const entry = income.entry;
    const amount = entry.balance?.toLocaleString();
    const category = income.category?.replaceAll('_', ' ');

    if (language === 'ml') {
      const monthName = malayalamMonths[entry.month] || '';
      return (
        `അസ്സലാമു അലൈക്കും, പ്രിയപ്പെട്ട *${income.source_name}*,\n\n` +
        `*${monthName} ${entry.year}* മാസത്തെ (${category}) നിങ്ങളുടെ *₹${amount}* കുടിശ്ശിക ഇനിയും അടച്ചിട്ടില്ല എന്ന് ഓർമ്മപ്പെടുത്തുന്നു.\n\n` +
        `ദയവായി എത്രയും വേഗം തുക അടയ്ക്കാൻ അപേക്ഷിക്കുന്നു.\n\n` +
        `നന്ദി 🙏`
      );
    }

    const monthName = months.find(m => m.value === entry.month)?.label || '';
    return (
      `Assalamu Alaikum, Dear *${income.source_name}*,\n\n` +
      `This is a gentle reminder that your payment of *₹${amount}* ` +
      `for *${monthName} ${entry.year}* (${category}) is still pending.\n\n` +
      `Kindly make the payment at your earliest convenience.\n\n` +
      `Thank you 🙏`
    );
  };

  const openReminderModal = (income) => {
    const message = buildReminderMessage(income, 'en');
    setReminderModal({ isOpen: true, income, phone: income.whatsapp || '', message, language: 'en' });
  };

  const setReminderLanguage = (language) => {
    setReminderModal(prev => ({
      ...prev,
      language,
      message: prev.income ? buildReminderMessage(prev.income, language) : prev.message
    }));
  };

  const sendWhatsAppReminder = () => {
    const { phone, message } = reminderModal;
    const cleaned = phone.replace(/\D/g, '');
    const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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

  // A due-based subscription's monthly entry may not exist yet for the month/year
  // currently being viewed. That happens for two different reasons, which must not
  // be conflated:
  //   1. "notStarted"  — the viewed month is before the subscription's start date.
  //      Nothing is due for that period at all.
  //   2. "notGenerated" — the subscription has already started, but the entry for
  //      a future month (relative to today) hasn't been auto-generated yet.
  // Previously both cases displayed the subscription's original start month/year
  // regardless of which month was being viewed, making the table look "stuck" when
  // browsing forward. This derives the correct label/amounts for each case instead.
  const getDueRowInfo = (income) => {
    const entry = income.entry;
    const notStarted = income.start_year > year || (income.start_year === year && income.start_month > month);
    const entryStatus = entry?.status || 'upcoming';
    const showActions = !!entry && entryStatus !== 'paid';

    const monthYearLabel = entry
      ? `${months[entry.month - 1]?.label} ${entry.year}`
      : notStarted
        ? `${t('finance.income.startsFrom', 'Starts')} ${months[income.start_month - 1]?.label} ${income.start_year}`
        : `${months[month - 1]?.label} ${year}`;

    // Only project the recurring amount for a month the subscription has actually
    // reached; before the start date there is genuinely nothing due yet.
    const dueAmount     = entry ? entry.amount_due    : (notStarted ? null : income.amount_due);
    const paidAmount    = entry ? entry.amount_paid   : (notStarted ? null : 0);
    const balanceAmount = entry ? entry.balance       : (notStarted ? null : income.amount_due);

    return { entry, notStarted, entryStatus, showActions, monthYearLabel, dueAmount, paidAmount, balanceAmount };
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeTab === 'hadiya' ? t('finance.income.quickHadiya') : t('finance.income.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{activeTab === 'hadiya' ? t('finance.income.hadiyaDescription') : t('finance.income.description')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeTab !== 'hadiya' && (() => {
              const now = new Date();
              const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
              return (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">
                    {t('finance.income.viewingPeriod', 'Viewing')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 rounded-xl border transition-colors ${
                      isCurrentMonth
                        ? 'bg-white dark:bg-[#1e1f25] border-gray-200 dark:border-gray-700'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    }`}>
                      <Calendar size={16} className={`ml-3 shrink-0 ${isCurrentMonth ? 'text-gray-400' : 'text-amber-500'}`} />
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        aria-label={t('finance.income.monthYear')}
                        className="pl-1 pr-2 py-2 bg-transparent focus:outline-none"
                      >
                        {months.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        aria-label={t('common.year', 'Year')}
                        className="pr-3 py-2 bg-transparent focus:outline-none border-l border-gray-200 dark:border-gray-700"
                      >
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    {!isCurrentMonth && (
                      <button
                        onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }}
                        className="px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-xl transition-colors whitespace-nowrap"
                      >
                        {t('finance.income.jumpToThisMonth', 'This Month')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="sm:hidden flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25] text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {showStats ? t('common.hideSummary') : t('common.showSummary')}
        {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {activeTab === 'due' ? (
        <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.totalDue')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{(summary?.due_based?.total_due || 0).toLocaleString()}</h3>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.totalPaid')}</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">₹{(summary?.due_based?.total_paid || 0).toLocaleString()}</h3>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.pending')}</p>
                <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{(summary?.due_based?.total_pending || 0).toLocaleString()}</h3>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.paidCount')}</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{summary?.due_based?.paid_count || 0}</h3>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.overdue')}</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{summary?.due_based?.overdue_count || 0}</h3>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <X size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : activeTab === 'direct' ? (
        <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.totalIncome')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{(summary?.direct?.total_income || 0).toLocaleString()}</h3>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.cashIncome')}</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">₹{(summary?.direct?.cash_income || 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.upiIncome')}</p>
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.bankIncome')}</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">₹{(summary?.direct?.bank_income || 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <CreditCard size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : activeTab === 'hadiya' ? (
        <div className={`${showStats ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.todayTotal')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{hadiyaSummary.today_total.toLocaleString()}</h3>
                <p className=" text-gray-400 mt-1">{hadiyaSummary.today_count} {t('finance.income.collections')}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Calendar size={24} className="text-white" />
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.thisMonthTotal')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{hadiyaSummary.month_total.toLocaleString()}</h3>
                <p className=" text-gray-400 mt-1">{hadiyaSummary.month_count} {t('finance.income.collections')}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <Wallet size={24} className="text-white" />
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.houseContributions')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{hadiyaSummary.house_total.toLocaleString()}</h3>
                <p className=" text-gray-400 mt-1">{hadiyaSummary.house_count} {t('finance.income.houses')}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Building2 size={24} className="text-white" />
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
                <p className=" text-gray-500 dark:text-gray-400">{t('finance.income.externalContributions')}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{hadiyaSummary.external_total.toLocaleString()}</h3>
                <p className=" text-gray-400 mt-1">{hadiyaSummary.external_count} {t('finance.income.guests')}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500">
                <Heart size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === 'due'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Calendar size={16} className="shrink-0" />
              <span className="hidden sm:inline">{t('finance.income.dueBasedIncome')}</span>
              <span className="sm:hidden">Due Based</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === 'direct'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Wallet size={16} className="shrink-0" />
              <span className="hidden sm:inline">{t('finance.income.directIncome')}</span>
              <span className="sm:hidden">Direct</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hadiya')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === 'hadiya'
                ? 'text-[#0B65F6] border-b-2 border-[#0B65F6] bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Heart size={16} className="shrink-0" />
              <span className="hidden sm:inline">{t('finance.income.quickHadiya')}</span>
              <span className="sm:hidden">Hadiya</span>
            </div>
          </button>
        </div>

        {/* Search & Filter Bar - Hide for hadiya tab */}
        {activeTab !== 'hadiya' && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              {/* Filters row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'due' ? t('finance.income.searchDue') : t('finance.income.searchDirect')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  />
                </div>

                <Select
                  value={categoryFilter ? { value: categoryFilter, label: activeTab === 'due' ? dueCategories.find(c => c.name === categoryFilter)?.name : incomeCategories.find(c => c.name === categoryFilter)?.name } : null}
                  onChange={(selected) => setCategoryFilter(selected ? selected.value : '')}
                  options={activeTab === 'due' ? dueCategories.map(c => ({ value: c.name, label: c.name })) : incomeCategories.map(c => ({ value: c.name, label: c.name }))}
                  placeholder={t('finance.income.allCategories')}
                  className="w-full sm:w-44"
                  styles={selectStyles}
                />

                {activeTab === 'due' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  >
                    <option value="">{t('finance.income.allStatus')}</option>
                    <option value="paid">{t('common.paid')}</option>
                    <option value="partial">{t('finance.income.partial')}</option>
                    <option value="unpaid">{t('common.unpaid')}</option>
                    <option value="overdue">{t('finance.income.overdue')}</option>
                    <option value="upcoming">{t('finance.income.upcoming')}</option>
                  </select>
                )}

                {activeTab === 'direct' && (
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-[#1e1f25] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                  >
                    <option value="">{t('finance.income.allMethods')}</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                  </select>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3">
                {(categoryFilter || statusFilter || paymentMethodFilter) && (
                  <button
                    onClick={() => { setCategoryFilter(''); setStatusFilter(''); setPaymentMethodFilter(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all hover:shadow-md active:scale-95 text-sm"
                  >
                    <X size={16} />
                    {t('common.clearFilters')}
                  </button>
                )}
                <button
                  onClick={() => activeTab === 'due' ? openAddDue() : openAddDirect()}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={18} />
                  {activeTab === 'due' ? t('finance.income.addDue') : t('finance.income.addDirect')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Due Based Income Table */}
        {activeTab === 'due' && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.code')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.category')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.source')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.monthYear')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.due')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.paid')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase">Balance</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.status')}</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dueData.incomes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <IndianRupee size={32} className="opacity-30" />
                          <p>{t('common.noData')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dueData.incomes.map((income) => {
                      const { entry, entryStatus, showActions, monthYearLabel, dueAmount, paidAmount, balanceAmount } = getDueRowInfo(income);
                      return (
                      <tr key={income._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{income.income_code}</td>
                        <td className="py-3 px-4"><span className="capitalize">{formatCategory(income.category)}</span></td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{income.source_name}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {entry ? monthYearLabel : <span className="text-gray-400 text-xs">{monthYearLabel}</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{dueAmount != null ? `₹${dueAmount.toLocaleString()}` : '—'}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">{paidAmount != null ? `₹${paidAmount.toLocaleString()}` : '—'}</td>
                        <td className="py-3 px-4 text-right font-medium text-orange-600">{balanceAmount != null ? `₹${balanceAmount.toLocaleString()}` : '—'}</td>
                        <td className="py-3 px-4 text-center"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(entryStatus)}`}>{entryStatus}</span></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {showActions && (
                              <button onClick={() => openPaymentModal(income)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={t('finance.income.markPayment')}><IndianRupee size={18} /></button>
                            )}
                            {showActions && isEntryCurrentOrPast(entry.month, entry.year) && (
                              <button onClick={() => openReminderModal(income)} className="p-2 text-[#25D366] hover:bg-green-50 rounded-lg transition-colors" title="Send WhatsApp Reminder"><MessageCircle size={18} /></button>
                            )}
                            <button onClick={() => viewHistory(income)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('finance.income.viewHistory')}><History size={18} /></button>
                            <button onClick={() => openEditDue(income)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={t('common.edit')}><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteDue(income._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('common.delete')}><Trash2 size={18} /></button>
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
            <div className="md:hidden p-4 space-y-3">
              {dueData.incomes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <IndianRupee size={32} className="opacity-30 mx-auto mb-2" />
                  <p>{t('common.noData')}</p>
                </div>
              ) : (
                dueData.incomes.map((income) => {
                  const { entry, entryStatus, showActions, monthYearLabel, dueAmount, paidAmount, balanceAmount } = getDueRowInfo(income);
                  return (
                  <div key={income._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{income.income_code}</p>
                        <p className="text-xs text-gray-500 capitalize">{formatCategory(income.category)} · {income.source_name}</p>
                        <p className="text-xs text-gray-400">{monthYearLabel}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full shrink-0 capitalize ${getStatusBadge(entryStatus)}`}>{entryStatus}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white dark:bg-[#1e1f25] rounded-lg p-2 text-center">
                        <p className="text-gray-500">{t('finance.income.due')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dueAmount != null ? `₹${dueAmount.toLocaleString()}` : '—'}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1e1f25] rounded-lg p-2 text-center">
                        <p className="text-gray-500">{t('finance.income.paid')}</p>
                        <p className="font-semibold text-green-600">{paidAmount != null ? `₹${paidAmount.toLocaleString()}` : '—'}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1e1f25] rounded-lg p-2 text-center">
                        <p className="text-gray-500">Balance</p>
                        <p className="font-semibold text-orange-600">{balanceAmount != null ? `₹${balanceAmount.toLocaleString()}` : '—'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {showActions && (
                        <button onClick={() => openPaymentModal(income)} className="flex-1 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium">{t('finance.income.markPayment')}</button>
                      )}
                      {showActions && isEntryCurrentOrPast(entry.month, entry.year) && (
                        <button onClick={() => openReminderModal(income)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#25D366] text-white rounded-lg font-medium"><MessageCircle size={12} />Remind</button>
                      )}
                      <button onClick={() => viewHistory(income)} className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">History</button>
                      <button onClick={() => openEditDue(income)} className="p-1.5 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteDue(income._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {dueData.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500">{t('finance.income.pageOf', { page: dueData.page, pages: dueData.pages })}</p>
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
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.code')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.date')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.category')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.source')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.amount')}</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.method')}</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 uppercase">{t('finance.income.receipt')}</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {directData.incomes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Wallet size={32} className="opacity-30" />
                          <p>{t('common.noData')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    directData.incomes.map((income) => (
                      <tr key={income._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{income.income_code}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(income.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4"><span className="capitalize">{formatCategory(income.category)}</span></td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{income.source_name}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">₹{income.amount?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {income.payment_method === 'cash' && <Banknote size={18} className="text-green-600" />}
                            {income.payment_method === 'upi' && <Smartphone size={18} className="text-blue-600" />}
                            {income.payment_method === 'bank' && <CreditCard size={18} className="text-purple-600" />}
                            <span className="capitalize">{income.payment_method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{income.receipt_no || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setViewModal({ isOpen: true, income })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('common.view')}><Eye size={18} /></button>
                            <button onClick={() => setReceiptModal({ isOpen: true, income, type: 'direct' })} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title={t('finance.income.receipt')}><Printer size={18} /></button>
                            <button onClick={() => openEditDirect(income)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={t('common.edit')}><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteDirect(income._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('common.delete')}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {directData.incomes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <Wallet size={32} className="opacity-30 mx-auto mb-2" />
                  <p>{t('common.noData')}</p>
                </div>
              ) : (
                directData.incomes.map((income) => (
                  <div key={income._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{income.income_code}</p>
                        <p className="text-xs text-gray-500 capitalize">{formatCategory(income.category)} · {income.source_name}</p>
                        <p className="text-xs text-gray-400">{new Date(income.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white shrink-0">₹{income.amount?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {income.payment_method === 'cash' && <Banknote size={14} className="text-green-600" />}
                        {income.payment_method === 'upi' && <Smartphone size={14} className="text-blue-600" />}
                        {income.payment_method === 'bank' && <CreditCard size={14} className="text-purple-600" />}
                        <span className="capitalize">{income.payment_method}</span>
                      </div>
                      <span>{income.receipt_no || '-'}</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button onClick={() => setViewModal({ isOpen: true, income })} className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium">{t('common.view')}</button>
                      <button onClick={() => setReceiptModal({ isOpen: true, income, type: 'direct' })} className="flex-1 py-1.5 text-xs bg-purple-600 text-white rounded-lg font-medium">Receipt</button>
                      <button onClick={() => openEditDirect(income)} className="p-1.5 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteDirect(income._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {directData.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500">{t('finance.income.pageOf', { page: directData.page, pages: directData.pages })}</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchDirect(directData.page - 1)} disabled={directData.page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronLeft size={18} /></button>
                  <button onClick={() => fetchDirect(directData.page + 1)} disabled={directData.page === directData.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Hadiya Collection */}
        {activeTab === 'hadiya' && <QuickHadiya onRefresh={fetchHadiyaSummaryData} />}
      </div>

      {/* Due Income Modal */}
      {/* FIX: Wrapped all modals in AnimatePresence so exit animations work */}
      <AnimatePresence>
        {dueModal.isOpen && (
          <>
            <motion.div key="due-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDueModal({ isOpen: false, income: null, isEdit: false })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="due-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Calendar size={24} className="text-[#0B65F6]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{dueModal.isEdit ? t('finance.income.editDue') : t('finance.income.addDue')}</h2>
                      <p className=" text-gray-500">{dueModal.isEdit ? t('finance.income.updateDue') : t('finance.income.createDue')}</p>
                    </div>
                  </div>
                  <button onClick={() => setDueModal({ isOpen: false, income: null, isEdit: false })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Start month/year — shown only when creating */}
                  {!dueModal.isEdit && (
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Start Month / Year *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <select {...registerDue('start_month', { required: true })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select {...registerDue('start_year', { required: true })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Monthly entries auto-generate from this month onwards.</p>
                    </div>
                  )}
                  {dueModal.isEdit && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                      Subscription started {months.find(m => m.value === dueModal.income?.start_month)?.label} {dueModal.income?.start_year}. Start date cannot be changed.
                    </div>
                  )}
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.category')} *</label>
                    <input type="hidden" {...registerDue('category', { required: t('finance.income.categoryRequired') })} />
                    <Select
                      value={selectedDueCategory}
                      onChange={(selected) => {
                        setSelectedDueCategory(selected);
                        setDueValue('category', selected?.value || '');
                        triggerDue('category');
                      }}
                      options={dueCategories.map(c => ({ value: c.name, label: c.name }))}
                      placeholder={t('common.selectCategory')}
                      styles={{
                        ...selectStyles,
                        control: (base, state) => ({
                          ...selectStyles.control(base, state),
                          borderColor: dueErrors.category ? '#ef4444' : (state.isFocused ? '#0B65F6' : '#e5e7eb')
                        })
                      }}
                    />
                    {dueErrors.category && <p className="text-red-500  mt-1">{t('finance.income.categoryRequired')}</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.sourceName')} *</label>
                    <input type="text" {...registerDue('source_name', { required: t('finance.income.sourceNameRequired') })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder={t('finance.income.enterSourceName')} />
                    {dueErrors.source_name && <p className="text-red-500  mt-1">{dueErrors.source_name.message}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp Number
                    </label>
                    <input type="tel" {...registerDue('whatsapp')} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="e.g. 9876543210 (for reminders)" />
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Amount *</label>
                    <input type="number" {...registerDue('amount_due', { required: t('finance.income.amountRequired'), min: { value: 1, message: t('finance.income.amountPositive') } })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder="e.g. 2000" />
                    {dueErrors.amount_due && <p className="text-red-500  mt-1">{dueErrors.amount_due.message}</p>}
                    {dueModal.isEdit && <p className="text-xs text-amber-500 mt-1">Changing this updates all current/future unpaid entries.</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea {...registerDue('notes')} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25] resize-none" placeholder="Optional notes..." />
                  </div>
                </div>
                <div className="shrink-0 flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setDueModal({ isOpen: false, income: null, isEdit: false }); resetDue(); setSelectedDueCategory(null); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
                  <button onClick={dueModal.isEdit ? handleSubmitDue(handleUpdateDue) : handleSubmitDue(handleCreateDue)} className="px-4 py-2 bg-[#0B65F6] hover:bg-[#0959c9] text-white rounded-lg">{dueModal.isEdit ? t('common.update') : t('common.create')}</button>
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
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Wallet size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{directModal.isEdit ? t('finance.income.editDirect') : t('finance.income.addDirect')}</h2>
                      <p className=" text-gray-500">{directModal.isEdit ? t('finance.income.updateDirect') : t('finance.income.createDirect')}</p>
                    </div>
                  </div>
                  <button onClick={() => setDirectModal({ isOpen: false, income: null, isEdit: false })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.date')} *</label>
                    <input type="date" {...registerDirect('date', { required: t('finance.income.dateRequired') })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" />
                    {directErrors.date && <p className="text-red-500  mt-1">{directErrors.date.message}</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.category')} *</label>
                    <input type="hidden" {...registerDirect('category', { required: t('finance.income.categoryRequired') })} />
                    <Select
                      value={selectedDirectCategory}
                      onChange={(selected) => {
                        setSelectedDirectCategory(selected);
                        setDirectValue('category', selected?.value || '');
                        triggerDirect('category');
                      }}
                      options={incomeCategories.map(c => ({ value: c.name, label: c.name }))}
                      placeholder={t('common.selectCategory')}
                      styles={{
                        ...selectStyles,
                        control: (base, state) => ({
                          ...selectStyles.control(base, state),
                          borderColor: directErrors.category ? '#ef4444' : (state.isFocused ? '#0B65F6' : '#e5e7eb')
                        })
                      }}
                    />
                    {directErrors.category && <p className="text-red-500  mt-1">{t('finance.income.categoryRequired')}</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.sourceName')} *</label>
                    <input type="text" {...registerDirect('source_name', { required: t('finance.income.sourceNameRequired') })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder={t('finance.income.enterSourceName')} />
                    {directErrors.source_name && <p className="text-red-500  mt-1">{directErrors.source_name.message}</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.amount')} *</label>
                    <input type="number" {...registerDirect('amount', { required: t('finance.income.amountRequired'), min: { value: 1, message: t('finance.income.amountPositive') } })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder={t('finance.income.enterAmount')} />
                    {directErrors.amount && <p className="text-red-500  mt-1">{directErrors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.paymentMethod')} *</label>
                    <select {...registerDirect('payment_method', { required: t('finance.income.paymentMethodRequired') })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                      <option value="cash">{t('finance.income.cash')}</option>
                      <option value="upi">{t('finance.income.upi')}</option>
                      <option value="bank">{t('finance.income.bankTransfer')}</option>
                    </select>
                    {directErrors.payment_method && <p className="text-red-500  mt-1">{directErrors.payment_method.message}</p>}
                  </div>
                </div>
                <div className="shrink-0 flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setDirectModal({ isOpen: false, income: null, isEdit: false }); resetDirect(); setSelectedDirectCategory(null); }} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
                  <button onClick={directModal.isEdit ? handleSubmitDirect(handleUpdateDirect) : handleSubmitDirect(handleCreateDirect)} className="px-4 py-2 bg-[#0B65F6] hover:bg-[#0959c9] text-white rounded-lg">{directModal.isEdit ? t('common.update') : t('common.create')}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.isOpen && paymentModal.income && paymentModal.entry && (
          <>
            <motion.div key="payment-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaymentModal({ isOpen: false, income: null, entry: null })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div key="payment-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-[60] p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('finance.income.markPayment')}</h2>
                    <p className="text-xs text-gray-500">{paymentModal.income.source_name} · {months[paymentModal.entry.month - 1]?.label} {paymentModal.entry.year}</p>
                  </div>
                  <button onClick={() => setPaymentModal({ isOpen: false, income: null, entry: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <div className="text-center">
                      <p className=" text-gray-500">{t('finance.income.totalDue')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">₹{paymentModal.entry.amount_due}</p>
                    </div>
                    <div className="text-center">
                      <p className=" text-gray-500">{t('finance.income.alreadyPaid')}</p>
                      <p className="text-lg font-bold text-green-600">₹{paymentModal.entry.amount_paid}</p>
                    </div>
                    <div className="text-center">
                      <p className=" text-gray-500">{t('finance.income.remaining')}</p>
                      <p className="text-lg font-bold text-orange-600">₹{paymentModal.entry.balance}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.paymentAmount')}</label>
                      <input type="number" value={paymentForm.payment_amount} onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" />
                    </div>
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.paymentMethod')}</label>
                      <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]">
                        <option value="cash">{t('finance.income.cash')}</option>
                        <option value="upi">{t('finance.income.upi')}</option>
                        <option value="bank">{t('finance.income.bankTransfer')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.referenceNo')}</label>
                      <input type="text" value={paymentForm.reference_no} onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" placeholder={t('finance.income.optional')} />
                    </div>
                    <div>
                      <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-1">{t('finance.income.notes')}</label>
                      <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1f25]" rows="2" placeholder={t('finance.income.optional')} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setPaymentModal({ isOpen: false, income: null, entry: null })} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">{t('common.cancel')}</button>
                  <button onClick={handleMarkPayment} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">{t('finance.income.recordPayment')}</button>
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
            <motion.div key="history-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryModal({ isOpen: false, history: [], templateName: '', income: null })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="history-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Subscription History</h2>
                    {historyModal.templateName && <p className="text-sm text-gray-500">{historyModal.templateName}</p>}
                  </div>
                  <button onClick={() => setHistoryModal({ isOpen: false, history: [], templateName: '', income: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {historyModal.history.length === 0 ? (
                    <p className="text-center text-gray-500">No entries yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {historyModal.history.map((entry) => (
                        <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {months[entry.month - 1]?.label} {entry.year}
                            </p>
                            <p className="text-xs text-gray-500">
                              Paid: ₹{entry.amount_paid?.toLocaleString()} / ₹{entry.amount_due?.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(entry.status)}`}>{entry.status}</span>
                            {entry.status !== 'paid' && (
                              <button
                                onClick={() => openPaymentModalForEntry(historyModal.income, entry)}
                                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title={t('finance.income.markPayment')}
                              >
                                <IndianRupee size={14} />
                                {t('finance.income.payNow', 'Pay Now')}
                              </button>
                            )}
                          </div>
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

      {/* WhatsApp Reminder Modal */}
      <AnimatePresence>
        {reminderModal.isOpen && reminderModal.income && (
          <>
            <motion.div key="reminder-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReminderModal({ isOpen: false, income: null, phone: '', message: '' })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="reminder-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#25D36620' }}>
                      <MessageCircle size={22} style={{ color: '#25D366' }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">WhatsApp Reminder</h2>
                      <p className="text-xs text-gray-500">{reminderModal.income.source_name}</p>
                    </div>
                  </div>
                  <button onClick={() => setReminderModal({ isOpen: false, income: null, phone: '', message: '' })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} className="text-gray-500" /></button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Due summary */}
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                    <AlertCircle size={16} className="text-orange-500 shrink-0" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      <span className="font-semibold">₹{reminderModal.income.entry?.balance?.toLocaleString()}</span> pending for {months.find(m => m.value === reminderModal.income.entry?.month)?.label} {reminderModal.income.entry?.year}
                    </p>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} /> WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={reminderModal.phone}
                      onChange={e => setReminderModal(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252731] text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] dark:text-white"
                      placeholder="e.g. 9876543210"
                    />
                    {!reminderModal.phone && (
                      <p className="text-xs text-amber-500 mt-1">No number saved — enter a number to send the reminder.</p>
                    )}
                  </div>

                  {/* Message preview */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message Preview</label>
                      <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-[#252731] rounded-lg">
                        <button
                          type="button"
                          onClick={() => setReminderLanguage('en')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            reminderModal.language === 'en'
                              ? 'bg-white dark:bg-[#1e1f25] text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderLanguage('ml')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            reminderModal.language === 'ml'
                              ? 'bg-white dark:bg-[#1e1f25] text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          മലയാളം
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={reminderModal.message}
                      onChange={e => setReminderModal(prev => ({ ...prev, message: e.target.value }))}
                      rows={7}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252731] text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] dark:text-white resize-none font-mono leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-1">You can edit the message before sending.</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setReminderModal({ isOpen: false, income: null, phone: '', message: '' })} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                  <button
                    onClick={sendWhatsAppReminder}
                    disabled={!reminderModal.phone.trim()}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle size={16} />
                    Open WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.income && (
          <>
            <motion.div key="view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal({ isOpen: false, income: null })} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div key="view-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('finance.income.incomeDetails')}</h2>
                  <button onClick={() => setViewModal({ isOpen: false, income: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className=" text-gray-500">{t('finance.income.incomeCode')}</p><p className="font-medium">{viewModal.income.income_code}</p></div>
                    <div><p className=" text-gray-500">{t('common.date')}</p><p className="font-medium">{new Date(viewModal.income.date).toLocaleDateString()}</p></div>
                  </div>
                  {/* FIX: Use formatCategory helper with replaceAll */}
                  <div><p className=" text-gray-500">{t('common.category')}</p><p className="font-medium capitalize">{formatCategory(viewModal.income.category)}</p></div>
                  <div><p className=" text-gray-500">{t('finance.income.source')}</p><p className="font-medium">{viewModal.income.source_name}</p></div>
                  <div><p className=" text-gray-500">{t('common.amount')}</p><p className="font-medium text-green-600 text-lg">₹{viewModal.income.amount?.toLocaleString()}</p></div>
                  <div><p className=" text-gray-500">{t('finance.income.paymentMethod')}</p><p className="font-medium capitalize">{viewModal.income.payment_method}</p></div>
                  {viewModal.income.reference_no && <div><p className=" text-gray-500">Reference</p><p className="font-medium">{viewModal.income.reference_no}</p></div>}
                  {viewModal.income.description && <div><p className=" text-gray-500">Description</p><p className="font-medium">{viewModal.income.description}</p></div>}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


