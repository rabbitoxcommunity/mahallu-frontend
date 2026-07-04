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
  FileText,
  Heart,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  getIncomeReport,
  getExpenseReport,
  getStatement,
  getTrends,
  exportReport
} from '../../api/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Brand identity used on every generated PDF/print report
const BRAND_COLOR_RGB = [11, 101, 246]; // #0B65F6
const BRAND_WEBSITE = 'www.mahalluconnect.com';

// Format number for PDF (simple comma separation)
const formatNumber = (num) => (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const dateFmt = (d) => (d ? moment(d).format('DD MMM YYYY') : '-');

// Stamps a brand header (tenant name + context title) and footer (website + page number)
// on every page of a jsPDF document. Must run after all content (incl. autoTable, which
// may span multiple pages) has been drawn, since only then is the final page count known.
const stampPdfBranding = (doc, tenantName, contextTitle) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Header band
    doc.setFillColor(...BRAND_COLOR_RGB);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text(tenantName, 14, 12);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(contextTitle, pageWidth - 14, 12, { align: 'right' });

    // Footer
    doc.setDrawColor(...BRAND_COLOR_RGB);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.text(BRAND_WEBSITE, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }
};

// The print HTML header/footer, styled to match the brand color
const printBrandingHtml = (tenantName, contextTitle) => ({
  headerHtml: `
    <div class="brand-header">
      <span class="brand-header-title">${tenantName}</span>
      <span class="brand-header-context">${contextTitle}</span>
    </div>`,
  footerHtml: `<div class="brand-footer">${BRAND_WEBSITE}</div>`,
  styleCss: `
    .brand-header { background: rgb(${BRAND_COLOR_RGB.join(',')}); color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin: -20px -20px 20px -20px; }
    .brand-header-title { font-size: 16px; font-weight: bold; }
    .brand-header-context { font-size: 12px; opacity: 0.9; }
    .brand-footer { margin-top: 30px; padding-top: 10px; border-top: 2px solid rgb(${BRAND_COLOR_RGB.join(',')}); text-align: center; font-size: 11px; color: #666; }
  `
});

// Column definitions for each report section's table/PDF/print output.
// Built from `t` at call time (inside the component) so headers follow the active language.
const getDueIncomeColumns = (t) => [
  { header: t('common.date'), key: 'date', formatter: dateFmt },
  { header: t('common.category'), key: 'category', formatter: (v) => v || t('finance.reports.uncategorized') },
  { header: t('finance.reports.source'), key: 'source', formatter: (v) => v || '-' },
  { header: t('common.amount'), key: 'amount', formatter: (v) => `Rs. ${formatNumber(v)}`, numeric: true },
  { header: t('common.paymentMethod'), key: 'payment_method', formatter: (v) => v || '-' },
];
const getHadiyaColumns = (t) => [
  { header: t('common.date'), key: 'date', formatter: dateFmt },
  { header: t('finance.reports.source'), key: 'source', formatter: (v) => v || '-' },
  { header: t('common.amount'), key: 'amount', formatter: (v) => `Rs. ${formatNumber(v)}`, numeric: true },
  { header: t('common.paymentMethod'), key: 'payment_method', formatter: (v) => v || '-' },
];
const getDueExpenseColumns = (t) => [
  { header: t('common.date'), key: 'date', formatter: dateFmt },
  { header: t('common.category'), key: 'category', formatter: (v) => v || t('finance.reports.uncategorized') },
  { header: t('finance.expense.paidTo'), key: 'paid_to', formatter: (v) => v || '-' },
  { header: t('common.amount'), key: 'amount', formatter: (v) => `Rs. ${formatNumber(v)}`, numeric: true },
  { header: t('common.paymentMethod'), key: 'payment_method', formatter: (v) => v || '-' },
];

// Build one section's PDF (title, period, total + a single table) — reused by every
// Income/Expense tab card section so filtering to one section only exports that section.
const downloadSectionPDF = ({ t, tenantName, title, period, total, columns, transactions }) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 30);
  doc.setFontSize(11);
  doc.text(`${t('finance.reports.period')}: ${period}`, 14, 38);
  doc.text(`${t('finance.reports.generatedOn')}: ${moment().format('DD MMM YYYY, h:mm A')}`, 14, 45);
  doc.setFontSize(13);
  doc.text(`${t('finance.reports.total')}: Rs. ${formatNumber(total)}`, 14, 55);

  autoTable(doc, {
    startY: 62,
    margin: { top: 22, bottom: 20 },
    head: [columns.map(c => c.header)],
    body: transactions.map(t => columns.map(c => c.formatter ? c.formatter(t[c.key]) : (t[c.key] ?? '-'))),
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR_RGB }
  });

  stampPdfBranding(doc, tenantName, title);
  doc.save(`${title.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`);
  toast.success('PDF downloaded successfully');
};

const printSection = ({ t, tenantName, title, period, total, columns, transactions }) => {
  const printWindow = window.open('', '_blank');
  const rowsHtml = transactions.map(row => `<tr>${columns.map(c =>
    `<td class="${c.numeric ? 'amount' : ''}">${c.formatter ? c.formatter(row[c.key]) : (row[c.key] ?? '-')}</td>`
  ).join('')}</tr>`).join('');
  const { headerHtml, footerHtml, styleCss } = printBrandingHtml(tenantName, title);

  const printContent = `
    <!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 20px; margin-bottom: 10px; }
      .meta { font-size: 12px; color: #666; margin-bottom: 10px; }
      .total { font-size: 14px; font-weight: bold; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #0B65F6; color: white; }
      .amount { text-align: right; }
      ${styleCss}
    </style></head><body>
      ${headerHtml}
      <h1>${title}</h1>
      <div class="meta"><p>${t('finance.reports.period')}: ${period}</p><p>${t('finance.reports.generatedOn')}: ${moment().format('DD MMM YYYY, h:mm A')}</p></div>
      <div class="total">${t('finance.reports.total')}: Rs. ${formatNumber(total)}</div>
      <table>
        <tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr>
        ${rowsHtml}
      </table>
      ${footerHtml}
    </body></html>`;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

// One card in the summary row (Opening Amount / Total Income / Due Based Income / ...)
const SummaryCard = ({ title, value, subtext, icon: Icon, color, gradient }) => (
  <div className={`rounded-2xl p-5 ${gradient ? `bg-gradient-to-br ${gradient} text-white` : 'bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800'}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className={`text-sm truncate ${gradient ? 'opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
        <h3 className={`text-xl sm:text-2xl font-bold mt-1 break-words ${gradient ? '' : 'text-gray-900 dark:text-white'}`}>₹{(value || 0).toLocaleString()}</h3>
        {subtext && <p className={`text-xs mt-1 ${gradient ? 'opacity-80' : 'text-gray-400'}`}>{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${gradient ? 'bg-white/20' : color}`}>
          <Icon size={20} className={gradient ? 'text-white' : 'text-white'} />
        </div>
      )}
    </div>
  </div>
);

// A section block: title + total + Print/Download buttons + its own table.
// Downloading here only exports THIS section's transactions — the point being that
// filtering down to e.g. "Due Based" and downloading only gets that section's data.
const SECTION_PAGE_SIZE = 10;

// The on-screen table is paginated for readability; Print/Download always use the
// FULL `transactions` list (unpaginated) so the exported report is complete for the period.
const ReportSection = ({ tenantName, title, total, totalColor, columns, transactions, period }) => {
  const { t } = useTranslation();
  const [rawPage, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(transactions.length / SECTION_PAGE_SIZE));
  // Clamp during render instead of resetting via an effect — avoids an extra render
  // pass when a new (shorter) transactions list arrives from a filter/period change.
  const page = Math.min(rawPage, pages);
  const pageRows = transactions.slice((page - 1) * SECTION_PAGE_SIZE, page * SECTION_PAGE_SIZE);

  return (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{title}</h3>
        <p className={`text-sm font-semibold mt-0.5 ${totalColor}`}>{t('finance.reports.total')}: ₹{(total || 0).toLocaleString()}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => printSection({ t, tenantName, title, period, total, columns, transactions })}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Printer size={16} /> {t('common.print')}
        </button>
        <button
          onClick={() => downloadSectionPDF({ t, tenantName, title, period, total, columns, transactions })}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700"
        >
          <Download size={16} /> {t('finance.reports.downloadPDF')}
        </button>
      </div>
    </div>
    {transactions.length === 0 ? (
      <p className="text-center text-gray-500 py-8 text-sm">{t('finance.reports.noTransactionsPeriod')}</p>
    ) : (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {columns.map(c => (
                  <th key={c.key} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase ${c.numeric ? 'text-right' : 'text-left'}`}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row._id || i} className="border-b border-gray-100 dark:border-gray-800">
                  {columns.map(c => (
                    <td key={c.key} className={`py-3 px-4 text-sm text-gray-700 dark:text-gray-300 ${c.numeric ? 'text-right font-medium text-gray-900 dark:text-white' : ''}`}>
                      {c.formatter ? c.formatter(row[c.key]) : (row[c.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {pageRows.map((row, i) => (
            <div key={row._id || i} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-1.5">
              {columns.map(c => (
                <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 shrink-0">{c.header}</span>
                  <span className={`text-right truncate ${c.numeric ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {c.formatter ? c.formatter(row[c.key]) : (row[c.key] ?? '-')}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    )}
    {transactions.length > 0 && pages > 1 && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-500">
          {t('finance.reports.showingRows', {
            from: (page - 1) * SECTION_PAGE_SIZE + 1,
            to: Math.min(page * SECTION_PAGE_SIZE, transactions.length),
            total: transactions.length,
            defaultValue: `Showing ${(page - 1) * SECTION_PAGE_SIZE + 1}–${Math.min(page * SECTION_PAGE_SIZE, transactions.length)} of ${transactions.length}`
          })}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('finance.reports.pageOf', { page, pages, defaultValue: `Page ${page} of ${pages}` })}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: moment().month(i).format('MMMM') }));
const YEARS = [2024, 2025, 2026, 2027];

// Shared Month/Year filter row used at the top of both Income and Expense tabs
const PeriodFilter = ({ filters, onChange, onRefresh }) => {
  const { t } = useTranslation();
  const isAnnual = filters.type === 'annual';
  return (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
      <div className="flex-1 sm:flex-none">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.reportType')}</label>
        <select
          value={filters.type || 'monthly'}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
        >
          <option value="monthly">{t('finance.reports.monthlyReport')}</option>
          <option value="annual">{t('finance.reports.annualReport')}</option>
        </select>
      </div>
      {!isAnnual && (
        <div className="flex-1 sm:flex-none">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.month')}</label>
          <select
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: parseInt(e.target.value) })}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
          >
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      )}
      <div className="flex-1 sm:flex-none">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.year')}</label>
        <select
          value={filters.year}
          onChange={(e) => onChange({ ...filters, year: parseInt(e.target.value) })}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
        >
          {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>
      <button
        onClick={onRefresh}
        className="w-full sm:w-auto px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <RefreshCw size={18} />
        {t('common.refresh')}
      </button>
    </div>
  </div>
  );
};

const Reports = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tenantName = user?.tenant_name || 'Mahallu';
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);

  // Income tab
  const [incomeFilters, setIncomeFilters] = useState({ type: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [incomeReport, setIncomeReport] = useState({
    opening_amount: 0, total_income: 0,
    due_based_income: { total: 0, transactions: [] },
    direct_income: { total: 0, transactions: [] },
    hadiya_income: { total: 0, transactions: [] }
  });

  // Expense tab
  const [expenseFilters, setExpenseFilters] = useState({ type: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [expenseReport, setExpenseReport] = useState({
    opening_amount: 0, total_expense: 0,
    due_based_expense: { total: 0, transactions: [] },
    direct_expense: { total: 0, transactions: [] }
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

    const reportType = exportData.type === 'monthly' ? t('finance.reports.monthlyReport') : t('finance.reports.annualReport');
    const date = exportData.type === 'monthly'
      ? `${moment().month(exportData.month - 1).format('MMMM')} ${exportData.year}`
      : `${exportData.year}`;

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const { headerHtml, footerHtml, styleCss } = printBrandingHtml(tenantName, reportType);
    let printContent = `
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
          ${styleCss}
        </style>
      </head>
      <body>
        ${headerHtml}
        <h1>${reportType}</h1>
        <div class="meta">
          <p>${t('finance.reports.generatedOn')}: ${moment().format('DD MMM YYYY, h:mm A')}</p>
          <p>${t('finance.reports.period')}: ${date}</p>
        </div>
    `;

    if (exportData.type === 'monthly') {
      printContent += `
        <h2>${t('finance.reports.financialSummary')}</h2>
        <table>
          <tr><th>${t('finance.reports.item')}</th><th class="amount">${t('common.amount')}</th></tr>
          <tr><td>${t('finance.reports.openingBalance')}</td><td class="amount">Rs. ${formatNumber(exportData.opening_balance)}</td></tr>
          <tr><td>${t('common.income')}</td><td class="amount">Rs. ${formatNumber(exportData.income)}</td></tr>
          <tr><td>${t('common.expense')}</td><td class="amount">Rs. ${formatNumber(exportData.expense)}</td></tr>
          <tr><td>${t('finance.reports.closingBalance')}</td><td class="amount">Rs. ${formatNumber(exportData.closing_balance)}</td></tr>
        </table>
      `;

      if (exportData.income_transactions && exportData.income_transactions.length > 0) {
        printContent += `
          <h2>${t('finance.reports.incomeTransactions')}</h2>
          <table>
            <tr class="income-header"><th>${t('common.date')}</th><th>${t('common.category')}</th><th>${t('finance.reports.source')}</th><th class="amount">${t('common.amount')}</th><th>${t('common.paymentMethod')}</th></tr>
            ${exportData.income_transactions.map(tx => `
              <tr>
                <td>${moment(tx.date).format('DD MMM YYYY')}</td>
                <td>${tx.category || t('finance.reports.uncategorized')}</td>
                <td>${tx.source || '-'}</td>
                <td class="amount">Rs. ${formatNumber(tx.amount)}</td>
                <td>${tx.payment_method}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      if (exportData.expense_transactions && exportData.expense_transactions.length > 0) {
        printContent += `
          <h2>${t('finance.reports.expenseTransactions')}</h2>
          <table>
            <tr class="expense-header"><th>${t('common.date')}</th><th>${t('common.category')}</th><th>${t('finance.expense.paidTo')}</th><th class="amount">${t('common.amount')}</th><th>${t('common.paymentMethod')}</th></tr>
            ${exportData.expense_transactions.map(tx => `
              <tr>
                <td>${moment(tx.date).format('DD MMM YYYY')}</td>
                <td>${tx.category || t('finance.reports.uncategorized')}</td>
                <td>${tx.paid_to || '-'}</td>
                <td class="amount">Rs. ${formatNumber(tx.amount)}</td>
                <td>${tx.payment_method}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }
    } else {
      printContent += `
        <h2>${t('finance.reports.annualSummary')}</h2>
        <table>
          <tr><th>${t('finance.reports.item')}</th><th class="amount">${t('common.amount')}</th></tr>
          <tr><td>${t('finance.reports.totalIncome')}</td><td class="amount">Rs. ${formatNumber(exportData.total_income)}</td></tr>
          <tr><td>${t('finance.reports.totalExpense')}</td><td class="amount">Rs. ${formatNumber(exportData.total_expense)}</td></tr>
          <tr><td>${t('common.balance')}</td><td class="amount">Rs. ${formatNumber(exportData.balance)}</td></tr>
        </table>
        <h2>${t('finance.reports.monthlyBreakdown')}</h2>
        <table>
          <tr><th>${t('finance.reports.month')}</th><th class="amount">${t('common.income')}</th><th class="amount">${t('common.expense')}</th><th class="amount">${t('common.balance')}</th></tr>
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
      ${footerHtml}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!exportData) return;

    const doc = new jsPDF();
    const reportType = exportData.type === 'monthly' ? t('finance.reports.monthlyReport') : t('finance.reports.annualReport');
    const date = exportData.type === 'monthly'
      ? `${moment().month(exportData.month - 1).format('MMMM')} ${exportData.year}`
      : `${exportData.year}`;

    // Title
    doc.setFontSize(18);
    doc.text(reportType, 14, 30);
    doc.setFontSize(12);
    doc.text(`${t('finance.reports.generatedOn')}: ${moment().format('DD MMM YYYY, h:mm A')}`, 14, 40);
    doc.text(`${t('finance.reports.period')}: ${date}`, 14, 48);

    let yPos = 60;

    if (exportData.type === 'monthly') {
      // Summary cards
      doc.setFontSize(14);
      doc.text(t('finance.reports.financialSummary'), 14, yPos);
      yPos += 10;

      const summaryRows = [
        [t('finance.reports.openingBalance'), `Rs. ${formatNumber(exportData.opening_balance)}`],
        [t('common.income'), `Rs. ${formatNumber(exportData.income)}`],
        [t('common.expense'), `Rs. ${formatNumber(exportData.expense)}`],
        [t('finance.reports.closingBalance'), `Rs. ${formatNumber(exportData.closing_balance)}`]
      ];

      autoTable(doc, {
        startY: yPos,
        margin: { top: 22 },
        head: [[t('finance.reports.item'), t('common.amount')]],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: BRAND_COLOR_RGB }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Income transactions
      if (exportData.income_transactions && exportData.income_transactions.length > 0) {
        doc.setFontSize(14);
        doc.text(t('finance.reports.incomeTransactions'), 14, yPos);
        yPos += 10;

        const incomeTableData = exportData.income_transactions.map(tx => [
          moment(tx.date).format('DD MMM YYYY'),
          tx.category || t('finance.reports.uncategorized'),
          tx.source || '-',
          `Rs. ${formatNumber(tx.amount)}`,
          tx.payment_method
        ]);

        autoTable(doc, {
          startY: yPos,
          margin: { top: 22 },
          head: [[t('common.date'), t('common.category'), t('finance.reports.source'), t('common.amount'), t('common.paymentMethod')]],
          body: incomeTableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Expense transactions
      if (exportData.expense_transactions && exportData.expense_transactions.length > 0) {
        doc.setFontSize(14);
        doc.text(t('finance.reports.expenseTransactions'), 14, yPos);
        yPos += 10;

        const expenseTableData = exportData.expense_transactions.map(tx => [
          moment(tx.date).format('DD MMM YYYY'),
          tx.category || t('finance.reports.uncategorized'),
          tx.paid_to || '-',
          `Rs. ${formatNumber(tx.amount)}`,
          tx.payment_method
        ]);

        autoTable(doc, {
          startY: yPos,
          margin: { top: 22 },
          head: [[t('common.date'), t('common.category'), t('finance.expense.paidTo'), t('common.amount'), t('common.paymentMethod')]],
          body: expenseTableData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] }
        });
      }
    } else {
      // Annual report
      doc.setFontSize(14);
      doc.text(t('finance.reports.annualSummary'), 14, yPos);
      yPos += 10;

      const summaryRows = [
        [t('finance.reports.totalIncome'), `Rs. ${formatNumber(exportData.total_income)}`],
        [t('finance.reports.totalExpense'), `Rs. ${formatNumber(exportData.total_expense)}`],
        [t('common.balance'), `Rs. ${formatNumber(exportData.balance)}`]
      ];

      autoTable(doc, {
        startY: yPos,
        margin: { top: 22 },
        head: [[t('finance.reports.item'), t('common.amount')]],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: BRAND_COLOR_RGB }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Monthly breakdown
      doc.setFontSize(14);
      doc.text(t('finance.reports.monthlyBreakdown'), 14, yPos);
      yPos += 10;

      const monthlyData = exportData.monthly_breakdown.map(m => [
        m.month_name,
        `Rs. ${formatNumber(m.income)}`,
        `Rs. ${formatNumber(m.expense)}`,
        `Rs. ${formatNumber(m.balance)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        margin: { top: 22 },
        head: [[t('finance.reports.month'), t('common.income'), t('common.expense'), t('common.balance')]],
        body: monthlyData,
        theme: 'grid',
        headStyles: { fillColor: BRAND_COLOR_RGB }
      });
    }

    stampPdfBranding(doc, tenantName, reportType);
    doc.save(`${reportType}_${date.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  // Fetch Income tab report
  const fetchIncomeReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncomeReport(incomeFilters);
      setIncomeReport(data);
    } catch (error) {
      toast.error('Failed to fetch income report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [incomeFilters]);

  // Fetch Expense tab report
  const fetchExpenseReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpenseReport(expenseFilters);
      setExpenseReport(data);
    } catch (error) {
      toast.error('Failed to fetch expense report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [expenseFilters]);

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

  // Fetch data when tab changes (or that tab's own filters change)
  useEffect(() => {
    if (activeTab === 'income') {
      fetchIncomeReport();
    } else if (activeTab === 'expense') {
      fetchExpenseReport();
    } else if (activeTab === 'statement') {
      fetchStatement();
    } else if (activeTab === 'trends') {
      fetchTrends();
    } else if (activeTab === 'export') {
      fetchExportData();
    }
  }, [activeTab, fetchIncomeReport, fetchExpenseReport, fetchStatement, fetchTrends, fetchExportData]);

  // Income Tab
  const IncomeTab = () => {
    const period = incomeFilters.type === 'annual'
      ? `${incomeFilters.year}`
      : `${moment().month(incomeFilters.month - 1).format('MMMM')} ${incomeFilters.year}`;
    const incomeColumns = getDueIncomeColumns(t);
    return (
      <div>
        <PeriodFilter filters={incomeFilters} onChange={setIncomeFilters} onRefresh={fetchIncomeReport} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title={t('finance.reports.totalIncome')}
            value={incomeReport.total_income}
            subtext={t('finance.reports.incomeFormula')}
            icon={IndianRupee}
            gradient="from-green-500 to-green-600"
          />
          <SummaryCard title={t('finance.reports.dueBasedIncome')} value={incomeReport.due_based_income.total} icon={Calendar} color="bg-orange-500" />
          <SummaryCard title={t('finance.reports.directIncome')} value={incomeReport.direct_income.total} icon={Receipt} color="bg-purple-500" />
          <SummaryCard title={t('finance.reports.quickHadiyaCollection')} value={incomeReport.hadiya_income.total} icon={Heart} color="bg-pink-500" />
        </div>

        <ReportSection
          tenantName={tenantName}
          title={t('finance.reports.dueBasedIncome')} period={period}
          total={incomeReport.due_based_income.total} totalColor="text-orange-600"
          columns={incomeColumns} transactions={incomeReport.due_based_income.transactions}
        />
        <ReportSection
          tenantName={tenantName}
          title={t('finance.reports.directIncome')} period={period}
          total={incomeReport.direct_income.total} totalColor="text-purple-600"
          columns={incomeColumns} transactions={incomeReport.direct_income.transactions}
        />
        <ReportSection
          tenantName={tenantName}
          title={t('finance.reports.quickHadiyaCollection')} period={period}
          total={incomeReport.hadiya_income.total} totalColor="text-pink-600"
          columns={getHadiyaColumns(t)} transactions={incomeReport.hadiya_income.transactions}
        />
      </div>
    );
  };

  // Expense Tab
  const ExpenseTab = () => {
    const period = expenseFilters.type === 'annual'
      ? `${expenseFilters.year}`
      : `${moment().month(expenseFilters.month - 1).format('MMMM')} ${expenseFilters.year}`;
    const expenseColumns = getDueExpenseColumns(t);
    return (
      <div>
        <PeriodFilter filters={expenseFilters} onChange={setExpenseFilters} onRefresh={fetchExpenseReport} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title={t('finance.reports.totalExpense')}
            value={expenseReport.total_expense}
            subtext={t('finance.reports.expenseFormula')}
            icon={Wallet}
            gradient="from-red-500 to-red-600"
          />
          <SummaryCard title={t('finance.reports.dueBasedExpense')} value={expenseReport.due_based_expense.total} icon={Calendar} color="bg-orange-500" />
          <SummaryCard title={t('finance.reports.directExpense')} value={expenseReport.direct_expense.total} icon={Receipt} color="bg-purple-500" />
        </div>

        <ReportSection
          tenantName={tenantName}
          title={t('finance.reports.dueBasedExpense')} period={period}
          total={expenseReport.due_based_expense.total} totalColor="text-orange-600"
          columns={expenseColumns} transactions={expenseReport.due_based_expense.transactions}
        />
        <ReportSection
          tenantName={tenantName}
          title={t('finance.reports.directExpense')} period={period}
          total={expenseReport.direct_expense.total} totalColor="text-purple-600"
          columns={expenseColumns} transactions={expenseReport.direct_expense.transactions}
        />
      </div>
    );
  };

  // Financial Statement Tab
  const StatementTab = () => (
    <div>
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
          <div className="flex-1 sm:flex-none">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.month')}</label>
            <select
              value={statementFilters.month}
              onChange={(e) => setStatementFilters({ ...statementFilters, month: parseInt(e.target.value) })}
              className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{moment().month(i).format('MMMM')}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.year')}</label>
            <select
              value={statementFilters.year}
              onChange={(e) => setStatementFilters({ ...statementFilters, year: parseInt(e.target.value) })}
              className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchStatement}
            className="w-full sm:w-auto px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className=" text-gray-600 dark:text-gray-400">{t('finance.reports.openingBalance')}</p>
          <p className={`text-2xl font-bold ${statementData.opening_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{statementData.opening_balance.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{t('finance.reports.openingBalanceFormula')}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className=" text-gray-600 dark:text-gray-400">{t('finance.reports.monthIncome')}</p>
          <p className="text-2xl font-bold text-green-600">₹{statementData.month_income.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{t('finance.reports.incomeFormula')}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className=" text-gray-600 dark:text-gray-400">{t('finance.reports.monthExpense')}</p>
          <p className="text-2xl font-bold text-red-600">₹{statementData.month_expense.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{t('finance.reports.expenseFormula')}</p>
        </div>
      </div>

      <div className={`bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6 ${statementData.closing_balance >= 0 ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-red-500'}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('finance.reports.closingBalance')}</p>
            <p className={`text-3xl sm:text-4xl font-bold ${statementData.closing_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{statementData.closing_balance.toLocaleString()}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-gray-500">{t('finance.reports.formula')}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('finance.reports.openingIncomeExpenseFormula')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('finance.reports.incomeBreakdown')}</h3>
          </div>
          <div className="p-6">
            {statementData.income_breakdown.length === 0 ? (
              <p className="text-center text-gray-500">{t('common.noData')}</p>
            ) : (
              <div className="space-y-3">
                {statementData.income_breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <span className=" text-gray-700 dark:text-gray-300">{item._id || t('finance.reports.uncategorized')}</span>
                    <span className=" font-bold text-green-600">₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('finance.reports.expenseBreakdown')}</h3>
          </div>
          <div className="p-6">
            {statementData.expense_breakdown.length === 0 ? (
              <p className="text-center text-gray-500">{t('common.noData')}</p>
            ) : (
              <div className="space-y-3">
                {statementData.expense_breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                    <span className=" text-gray-700 dark:text-gray-300">{item._id || t('finance.reports.uncategorized')}</span>
                    <span className=" font-bold text-red-600">₹{item.total.toLocaleString()}</span>
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
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('finance.reports.incomeVsExpense')} ({t('finance.reports.last12Months')})</h3>
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
            <Bar dataKey="income" fill="url(#incomeGradient)" name={t('common.income')} radius={[8, 8, 8, 8]} />
            <Bar dataKey="expense" fill="url(#expenseGradient)" name={t('common.expense')} radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('finance.reports.balanceTrend')}</h3>
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
              name={t('common.balance')}
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
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
          <div className="flex-1 sm:flex-none">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.reportType')}</label>
            <select
              value={exportFilters.type}
              onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value })}
              className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
            >
              <option value="monthly">{t('finance.reports.monthlyReport')}</option>
              <option value="annual">{t('finance.reports.annualReport')}</option>
            </select>
          </div>
          {exportFilters.type === 'monthly' && (
            <>
              <div className="flex-1 sm:flex-none">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.month')}</label>
                <select
                  value={exportFilters.month}
                  onChange={(e) => setExportFilters({ ...exportFilters, month: parseInt(e.target.value) })}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{moment().month(i).format('MMMM')}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 sm:flex-none">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.year')}</label>
                <select
                  value={exportFilters.year}
                  onChange={(e) => setExportFilters({ ...exportFilters, year: parseInt(e.target.value) })}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
                >
                  {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {exportFilters.type === 'annual' && (
            <div className="flex-1 sm:flex-none">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('finance.reports.year')}</label>
              <select
                value={exportFilters.year}
                onChange={(e) => setExportFilters({ ...exportFilters, year: parseInt(e.target.value) })}
                className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B65F6]"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={fetchExportData}
            className="w-full sm:w-auto px-4 py-2 bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            {t('finance.reports.generate')}
          </button>
        </div>
      </div>

      {exportData && (
        <div id="report-content" className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {exportData.type === 'monthly' ? t('finance.reports.monthlyReport') : t('finance.reports.annualReport')}
            </h3>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0B65F6] text-white rounded-xl hover:bg-blue-700">
              <Download size={16} />
              {t('finance.reports.downloadPDF')}
            </button>
          </div>
          <div className="p-6">
            {exportData.type === 'monthly' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('finance.reports.openingBalance')}</p>
                    <p className="text-xl font-bold text-blue-600">₹{exportData.opening_balance.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.openingBalanceFormula')}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.income')}</p>
                    <p className="text-xl font-bold text-green-600">₹{exportData.income.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.incomeFormula')}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.expense')}</p>
                    <p className="text-xl font-bold text-red-600">₹{exportData.expense.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.expenseFormula')}</p>
                  </div>
                </div>
                <div className={`bg-white dark:bg-[#1e1f25] rounded-xl p-4 border ${exportData.closing_balance >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className=" text-gray-600 dark:text-gray-400">{t('finance.reports.closingBalance')}</p>
                      <p className={`text-2xl font-bold ${exportData.closing_balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{exportData.closing_balance.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-gray-400">{t('finance.reports.openingIncomeExpenseFormula')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('finance.reports.totalIncome')}</p>
                    <p className="text-xl font-bold text-green-600">₹{exportData.total_income.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.incomeFormula')}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('finance.reports.totalExpense')}</p>
                    <p className="text-xl font-bold text-red-600">₹{exportData.total_expense.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.expenseFormula')}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.balance')}</p>
                    <p className={`text-xl font-bold ${exportData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{exportData.balance.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('finance.reports.totalIncome')} − {t('finance.reports.totalExpense')}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1e1f25] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('finance.reports.monthlyBreakdown')}</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4  font-semibold text-gray-900 dark:text-white">{t('finance.reports.month')}</th>
                          <th className="text-right py-3 px-4  font-semibold text-gray-900 dark:text-white">{t('common.income')}</th>
                          <th className="text-right py-3 px-4  font-semibold text-gray-900 dark:text-white">{t('common.expense')}</th>
                          <th className="text-right py-3 px-4  font-semibold text-gray-900 dark:text-white">{t('common.balance')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exportData.monthly_breakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4  text-gray-700 dark:text-gray-300">{item.month_name}</td>
                            <td className="py-3 px-4 text-right  text-green-600">₹{item.income.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right  text-red-600">₹{item.expense.toLocaleString()}</td>
                            <td className={`py-3 px-4 text-right  font-medium ${item.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{item.balance.toLocaleString()}</td>
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
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6">
        {[
          { id: 'income', label: t('common.income'), icon: IndianRupee },
          { id: 'expense', label: t('common.expense'), icon: Wallet },
          { id: 'statement', label: t('finance.reports.financialStatement'), icon: FileText },
          { id: 'trends', label: t('finance.reports.trends'), icon: TrendingUp },
          { id: 'export', label: t('finance.reports.exportAudit'), icon: Download }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0B65F6] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={16} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'income' && (
          <motion.div
            key="income"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <IncomeTab />
          </motion.div>
        )}

        {activeTab === 'expense' && (
          <motion.div
            key="expense"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ExpenseTab />
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
