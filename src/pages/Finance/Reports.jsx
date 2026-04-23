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
  FileText,
  PieChart,
  Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import {
  getSummary,
  getStatement,
  getTrends,
  exportReport
} from '../../api/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Reports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    this_month_income: 0,
    this_month_expense: 0,
    total_varisankhya: 0
  });

  // Statement data
  const [statementData, setStatementData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    opening_balance: 0,
    opening_income: 0,
    opening_expense: 0,
    month_income: 0,
    month_expense: 0,
    closing_balance: 0,
    income_breakdown: [],
    expense_breakdown: [],
    income_transactions: [],
    expense_transactions: []
  });
  const [statementFilters, setStatementFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Trends data
  const [trendsData, setTrendsData] = useState({
    data: [],
    growth: []
  });

  // Export data
  const [exportFilters, setExportFilters] = useState({
    type: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [exportData, setExportData] = useState(null);

  // Print handler
  const handlePrint = () => {
    if (!exportData) return;

    const reportType = exportData.type === 'monthly' ? 'Monthly Report' : 'Annual Report';
    const date = exportData.type === 'monthly' 
      ? `${moment().month(exportData.month - 1).format('MMMM')} ${exportData.year}`
      : `${exportData.year}`;

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { font-size: 20px; margin-bottom: 10px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
          h2 { font-size: 14px; margin-top: 20px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0B65F6; color: white; }
          .income-header { background-color: #10B981; }
          .expense-header { background-color: #EF4444; }
          .amount { text-align: right; }
        </style>
      </head>
      <body>
        <h1>${reportType}</h1>
        <div class="meta">
          <p>Generated on: ${moment().format('DD MMM YYYY, h:mm A')}</p>
          <p>Period: ${date}</p>
        </div>
    `;

    if (exportData.type === 'monthly') {
      printContent += `
        <h2>Financial Summary</h2>
        <table>
          <tr><th>Item</th><th class="amount">Amount</th></tr>
          <tr><td>Opening Balance</td><td class="amount">Rs. ${formatNumber(exportData.opening_balance)}</td></tr>
          <tr><td>Income</td><td class="amount">Rs. ${formatNumber(exportData.income)}</td></tr>
          <tr><td>Expense</td><td class="amount">Rs. ${formatNumber(exportData.expense)}</td></tr>
          <tr><td>Closing Balance</td><td class="amount">Rs. ${formatNumber(exportData.closing_balance)}</td></tr>
        </table>
      `;

      if (exportData.income_transactions && exportData.income_transactions.length > 0) {
        printContent += `
          <h2>Income Transactions</h2>
          <table>
            <tr class="income-header"><th>Date</th><th>Category</th><th>Source</th><th class="amount">Amount</th><th>Payment Method</th></tr>
            ${exportData.income_transactions.map(t => `
              <tr>
                <td>${moment(t.date).format('DD MMM YYYY')}</td>
                <td>${t.category || 'Uncategorized'}</td>
                <td>${t.source || '-'}</td>
                <td class="amount">Rs. ${formatNumber(t.amount)}</td>
                <td>${t.payment_method}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      if (exportData.expense_transactions && exportData.expense_transactions.length > 0) {
        printContent += `
          <h2>Expense Transactions</h2>
          <table>
            <tr class="expense-header"><th>Date</th><th>Category</th><th>Paid To</th><th class="amount">Amount</th><th>Payment Method</th></tr>
            ${exportData.expense_transactions.map(t => `
              <tr>
                <td>${moment(t.date).format('DD MMM YYYY')}</td>
                <td>${t.category || 'Uncategorized'}</td>
                <td>${t.paid_to || '-'}</td>
                <td class="amount">Rs. ${formatNumber(t.amount)}</td>
                <td>${t.payment_method}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }
    } else {
      printContent += `
        <h2>Annual Summary</h2>
        <table>
          <tr><th>Item</th><th class="amount">Amount</th></tr>
          <tr><td>Total Income</td><td class="amount">Rs. ${formatNumber(exportData.total_income)}</td></tr>
          <tr><td>Total Expense</td><td class="amount">Rs. ${formatNumber(exportData.total_expense)}</td></tr>
          <tr><td>Balance</td><td class="amount">Rs. ${formatNumber(exportData.balance)}</td></tr>
        </table>
        <h2>Monthly Breakdown</h2>
        <table>
          <tr><th>Month</th><th class="amount">Income</th><th class="amount">Expense</th><th class="amount">Balance</th></tr>
          ${exportData.monthly_breakdown.map(m => `
            <tr>
              <td>${m.month_name}</td>
              <td class="amount">Rs. ${formatNumber(m.income)}</td>
              <td class="amount">Rs. ${formatNumber(m.expense)}</td>
              <td class="amount">Rs. ${formatNumber(m.balance)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    printContent += `
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Format number for PDF (simple comma separation)
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!exportData) return;

    const doc = new jsPDF();
    const reportType = exportData.type === 'monthly' ? 'Monthly Report' : 'Annual Report';
    const date = exportData.type === 'monthly' 
      ? `${moment().month(exportData.month - 1).format('MMMM')} ${exportData.year}`
      : `${exportData.year}`;

    // Title
    doc.setFontSize(20);
    doc.text(reportType, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${moment().format('DD MMM YYYY, h:mm A')}`, 14, 30);
    doc.text(`Period: ${date}`, 14, 38);

    let yPos = 50;

    if (exportData.type === 'monthly') {
      // Summary cards
      doc.setFontSize(14);
      doc.text('Financial Summary', 14, yPos);
      yPos += 10;

      const summaryData = [
        ['Opening Balance', `Rs. ${formatNumber(exportData.opening_balance)}`],
        ['Income', `Rs. ${formatNumber(exportData.income)}`],
        ['Expense', `Rs. ${formatNumber(exportData.expense)}`],
        ['Closing Balance', `Rs. ${formatNumber(exportData.closing_balance)}`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [11, 101, 246] }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Income transactions
      if (exportData.income_transactions && exportData.income_transactions.length > 0) {
        doc.setFontSize(14);
        doc.text('Income Transactions', 14, yPos);
        yPos += 10;

        const incomeTableData = exportData.income_transactions.map(t => [
          moment(t.date).format('DD MMM YYYY'),
          t.category || 'Uncategorized',
          t.source || '-',
          `Rs. ${formatNumber(t.amount)}`,
          t.payment_method
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Category', 'Source', 'Amount', 'Payment Method']],
          body: incomeTableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Expense transactions
      if (exportData.expense_transactions && exportData.expense_transactions.length > 0) {
        doc.setFontSize(14);
        doc.text('Expense Transactions', 14, yPos);
        yPos += 10;

        const expenseTableData = exportData.expense_transactions.map(t => [
          moment(t.date).format('DD MMM YYYY'),
          t.category || 'Uncategorized',
          t.paid_to || '-',
          `Rs. ${formatNumber(t.amount)}`,
          t.payment_method
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Category', 'Paid To', 'Amount', 'Payment Method']],
          body: expenseTableData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] }
        });
      }
    } else {
      // Annual report
      doc.setFontSize(14);
      doc.text('Annual Summary', 14, yPos);
      yPos += 10;

      const summaryData = [
        ['Total Income', `Rs. ${formatNumber(exportData.total_income)}`],
        ['Total Expense', `Rs. ${formatNumber(exportData.total_expense)}`],
        ['Balance', `Rs. ${formatNumber(exportData.balance)}`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [11, 101, 246] }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Monthly breakdown
      doc.setFontSize(14);
      doc.text('Monthly Breakdown', 14, yPos);
      yPos += 10;

      const monthlyData = exportData.monthly_breakdown.map(m => [
        m.month_name,
        `Rs. ${formatNumber(m.income)}`,
        `Rs. ${formatNumber(m.expense)}`,
        `Rs. ${formatNumber(m.balance)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Income', 'Expense', 'Balance']],
        body: monthlyData,
        theme: 'grid',
        headStyles: { fillColor: [11, 101, 246] }
      });
    }

    doc.save(`${reportType}_${date.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSummary();
      setSummaryData(data);
    } catch (error) {
      toast.error('Failed to fetch summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statement
  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStatement(statementFilters);
      setStatementData(data);
    } catch (error) {
      toast.error('Failed to fetch financial statement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statementFilters]);

  // Fetch trends
  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTrends({ months: 12 });
      setTrendsData(data);
    } catch (error) {
      toast.error('Failed to fetch trends');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch export data
  const fetchExportData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await exportReport(exportFilters);
      setExportData(data);
    } catch (error) {
      toast.error('Failed to fetch export data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [exportFilters]);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'statement') {
      fetchStatement();
    } else if (activeTab === 'trends') {
      fetchTrends();
    } else if (activeTab === 'export') {
      fetchExportData();
    }
  }, [activeTab, fetchStatement, fetchTrends, fetchExportData]);

  // Dashboard Tab
  const DashboardTab = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <IndianRupee size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">{t('finance.reports.totalIncome')}</span>
          </div>
          <p className="text-3xl font-bold">₹{summaryData.total_income.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Home size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">{t('finance.reports.totalVarisankhya')}</span>
          </div>
          <p className="text-3xl font-bold">₹{summaryData.total_varisankhya.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br rounded-2xl p-6 text-white ${summaryData.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">{t('common.balance')}</span>
          </div>
          <p className="text-3xl font-bold">₹{summaryData.balance.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <IndianRupee size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('finance.reports.thisMonthIncome')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{summaryData.this_month_income.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Wallet size={24} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('finance.reports.thisMonthExpense')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{summaryData.this_month_expense.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">{t('finance.reports.totalExpense')}</span>
          </div>
          <p className="text-3xl font-bold">₹{summaryData.total_expense.toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );

  // Financial Statement Tab
  const StatementTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
            <select
              value={statementFilters.month}
              onChange={(e) => setStatementFilters({ ...statementFilters, month: parseInt(e.target.value) })}
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
              value={statementFilters.year}
              onChange={(e) => setStatementFilters({ ...statementFilters, year: parseInt(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchStatement}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Opening Balance</p>
          <p className={`text-2xl font-bold ${statementData.opening_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{statementData.opening_balance.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Month Income</p>
          <p className="text-2xl font-bold text-green-600">₹{statementData.month_income.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Month Expense</p>
          <p className="text-2xl font-bold text-red-600">₹{statementData.month_expense.toLocaleString()}</p>
        </div>
      </div>

      <div className={`bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6 ${statementData.closing_balance >= 0 ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-red-500'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Closing Balance</p>
            <p className={`text-4xl font-bold ${statementData.closing_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{statementData.closing_balance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Formula</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Opening + Income - Expense</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Income Breakdown</h3>
          </div>
          <div className="p-6">
            {statementData.income_breakdown.length === 0 ? (
              <p className="text-center text-gray-500">No data</p>
            ) : (
              <div className="space-y-3">
                {statementData.income_breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item._id || 'Uncategorized'}</span>
                    <span className="text-sm font-bold text-green-600">₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Breakdown</h3>
          </div>
          <div className="p-6">
            {statementData.expense_breakdown.length === 0 ? (
              <p className="text-center text-gray-500">No data</p>
            ) : (
              <div className="space-y-3">
                {statementData.expense_breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item._id || 'Uncategorized'}</span>
                    <span className="text-sm font-bold text-red-600">₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Trends Tab
  const TrendsTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Income vs Expense (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={trendsData.data} barSize={40}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1}/>
                <stop offset="100%" stopColor="#008E53" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1}/>
                <stop offset="100%" stopColor="#FF3939" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#6B7280'
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF' }} align="center" />
            <Bar dataKey="income" fill="url(#incomeGradient)" name="Income" radius={[8, 8, 8, 8]} />
            <Bar dataKey="expense" fill="url(#expenseGradient)" name="Expense" radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Balance Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendsData.data}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B65F6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#0855D6" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#6B7280'
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF' }} align="center" />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="url(#balanceGradient)" 
              strokeWidth={3} 
              name="Balance"
              dot={{ fill: '#0B65F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Export Tab
  const ExportTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <select
              value={exportFilters.type}
              onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value })}
              className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              <option value="monthly">Monthly Report</option>
              <option value="annual">Annual Report</option>
            </select>
          </div>
          {exportFilters.type === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
                <select
                  value={exportFilters.month}
                  onChange={(e) => setExportFilters({ ...exportFilters, month: parseInt(e.target.value) })}
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
                  value={exportFilters.year}
                  onChange={(e) => setExportFilters({ ...exportFilters, year: parseInt(e.target.value) })}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {exportFilters.type === 'annual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
              <select
                value={exportFilters.year}
                onChange={(e) => setExportFilters({ ...exportFilters, year: parseInt(e.target.value) })}
                className="px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={fetchExportData}
            className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Generate
          </button>
        </div>
      </div>

      {exportData && (
        <div id="report-content" className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {exportData.type === 'monthly' ? 'Monthly Report' : 'Annual Report'}
            </h3>
            <div className="flex gap-2">
              {/* <button onClick={handlePrint} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2">
                <Printer size={18} />
                Print
              </button> */}
              <button onClick={handleDownloadPDF} className="px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
          <div className="p-6">
            {exportData.type === 'monthly' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Opening Balance</p>
                    <p className="text-xl font-bold text-blue-600">₹{exportData.opening_balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
                    <p className="text-xl font-bold text-green-600">₹{exportData.income.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expense</p>
                    <p className="text-xl font-bold text-red-600">₹{exportData.expense.toLocaleString()}</p>
                  </div>
                </div>
                <div className={`bg-white dark:bg-[#1e1f25] rounded-xl p-4 border ${exportData.closing_balance >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Closing Balance</p>
                  <p className={`text-2xl font-bold ${exportData.closing_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{exportData.closing_balance.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                    <p className="text-xl font-bold text-green-600">₹{exportData.total_income.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Expense</p>
                    <p className="text-xl font-bold text-red-600">₹{exportData.total_expense.toLocaleString()}</p>
                  </div>
                  <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                    <p className={`text-xl font-bold ${exportData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{exportData.balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e1f25] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-gray-900 dark:text-white">Monthly Breakdown</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Month</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Income</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Expense</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exportData.monthly_breakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.month_name}</td>
                            <td className="py-3 px-4 text-right text-sm text-green-600">₹{item.income.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-sm text-red-600">₹{item.expense.toLocaleString()}</td>
                            <td className={`py-3 px-4 text-right text-sm font-medium ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{item.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('finance.reports.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('finance.reports.description')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: t('finance.reports.dashboard'), icon: BarChart3 },
          { id: 'statement', label: t('finance.reports.financialStatement'), icon: FileText },
          { id: 'trends', label: t('finance.reports.trends'), icon: TrendingUp },
          { id: 'export', label: t('finance.reports.exportAudit'), icon: Download }
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
            <DashboardTab />
          </motion.div>
        )}

        {activeTab === 'statement' && (
          <motion.div
            key="statement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StatementTab />
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TrendsTab />
          </motion.div>
        )}

        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ExportTab />
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 flex items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#0B65F6]" />
            <span className="text-gray-900 dark:text-white">{t('common.loading')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
