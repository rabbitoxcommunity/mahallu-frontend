import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, RefreshCw, Printer, IndianRupee, Users, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getWelfareReports, getWelfarePrograms } from '../../../api/welfareService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const COLORS = ['#0B65F6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const DIST_TYPES = ['Cash', 'Food Kit', 'Medicine', 'Education', 'Marriage', 'House Repair', 'Emergency Relief', 'Other'];
const FUNDING_SOURCES = ['Zakat', 'Sadaqah', 'Donation', 'General Fund', 'Other'];

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const Reports = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);

  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    program_id: '',
    funding_source: '',
    distribution_type: ''
  });

  useEffect(() => {
    getWelfarePrograms({ limit: 100 }).then(d => setPrograms(d.programs || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.program_id) params.program_id = filters.program_id;
      if (filters.funding_source) params.funding_source = filters.funding_source;
      if (filters.distribution_type) params.distribution_type = filters.distribution_type;
      const result = await getWelfareReports(params);
      setData(result);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, []);

  const handleApply = () => fetchData();
  const handleClear = () => {
    setFilters({ from_date: '', to_date: '', program_id: '', funding_source: '', distribution_type: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Welfare Distribution Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

    // Summary
    doc.setFontSize(12);
    doc.text('Summary', 14, 40);
    autoTable(doc, {
      startY: 44,
      head: [['Total Amount', 'Total Distributions', 'Unique Families']],
      body: [[
        formatAmount(data.summary?.total_amount),
        data.summary?.total_distributions || 0,
        data.summary?.unique_families || 0
      ]],
      theme: 'grid',
      headStyles: { fillColor: [11, 101, 246] }
    });

    // Detailed list
    if (data.distributions?.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Distribution Details', 14, 20);
      autoTable(doc, {
        startY: 24,
        head: [['No', 'Date', 'Family', 'Program', 'Type', 'Source', 'Amount']],
        body: data.distributions.map(d => [
          d.distribution_no,
          formatDate(d.distribution_date),
          d.is_external ? `${d.beneficiary_name} (External)` : (d.family_id?.householder_name || '—'),
          d.program_id?.program_name || '—',
          d.distribution_type,
          d.funding_source,
          formatAmount(d.amount)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [11, 101, 246] },
        styles: { fontSize: 8 }
      });
    }

    doc.save('welfare-report.pdf');
  };

  const inputClass = 'py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-5">
      {/* Filters Panel */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Filters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('welfare.reports.fromDate')}</label>
            <input type="date" value={filters.from_date}
              onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))}
              className={inputClass} />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('welfare.reports.toDate')}</label>
            <input type="date" value={filters.to_date}
              onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('welfare.reports.filterProgram')}</label>
            <select value={filters.program_id} onChange={e => setFilters(f => ({ ...f, program_id: e.target.value }))} className={inputClass + ' w-full'}>
              <option value="">{t('welfare.reports.allPrograms')}</option>
              {programs.map(p => <option key={p._id} value={p._id}>{p.program_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('welfare.reports.filterSource')}</label>
            <select value={filters.funding_source} onChange={e => setFilters(f => ({ ...f, funding_source: e.target.value }))} className={inputClass + ' w-full'}>
              <option value="">{t('welfare.reports.allSources')}</option>
              {FUNDING_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('welfare.reports.filterType')}</label>
            <select value={filters.distribution_type} onChange={e => setFilters(f => ({ ...f, distribution_type: e.target.value }))} className={inputClass + ' w-full'}>
              <option value="">{t('welfare.reports.allTypes')}</option>
              {DIST_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleApply} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('welfare.reports.applyFilters')}
          </button>
          <button onClick={handleClear}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
            {t('welfare.reports.clearFilters')}
          </button>
          <div className="flex-1" />
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
            <Printer size={14} /> {t('welfare.reports.print')}
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700">
            <FileText size={14} /> {t('welfare.reports.exportPDF')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={IndianRupee} label={t('welfare.reports.totalAmount')}
          value={formatAmount(data?.summary?.total_amount)} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <SummaryCard icon={BarChart3} label={t('welfare.reports.totalDistributions')}
          value={data?.summary?.total_distributions || 0} color="bg-gradient-to-br from-green-500 to-green-600" />
        <SummaryCard icon={Users} label={t('welfare.reports.uniqueFamilies')}
          value={data?.summary?.unique_families || 0} color="bg-gradient-to-br from-purple-500 to-purple-600" />
      </div>

      {!data || (data.distributions?.length === 0) ? (
        <div className="text-center py-16 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <BarChart3 size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('welfare.reports.noRecords')}</p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Bar */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('welfare.reports.monthly')}</h3>
              {data.monthly?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={v => [formatAmount(v), 'Amount']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#0B65F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No monthly data</div>
              )}
            </div>

            {/* By Source Pie */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('welfare.reports.bySource')}</h3>
              {data.by_source?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.by_source} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                      dataKey="total" nameKey="_id" paddingAngle={2}>
                      {data.by_source.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [formatAmount(v), n]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Legend formatter={v => <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* By Program Table */}
          {data.by_program?.length > 0 && (
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('welfare.reports.byProgram')}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('welfare.reports.program')}</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('welfare.reports.count')}</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('welfare.reports.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.by_program.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-3 text-sm text-gray-800 dark:text-gray-200">{p.program_name}</td>
                      <td className="px-5 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{p.count}</td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">{formatAmount(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detailed Distribution Table */}
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('welfare.reports.detailedList')} ({data.distributions?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Family</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Program</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Source</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.distributions.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-3 text-xs font-mono text-blue-600 dark:text-blue-400">{d.distribution_no}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(d.distribution_date)}</td>
                      <td className="px-5 py-3">
                        {d.is_external ? (
                          <>
                            <p className="text-sm text-gray-900 dark:text-white">{d.beneficiary_name}</p>
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full">External</span>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900 dark:text-white">{d.family_id?.householder_name || '—'}</p>
                            <p className="text-xs text-gray-400">{d.family_id?.house_code}</p>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{d.program_id?.program_name || '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{d.distribution_type}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{d.funding_source}</td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">{formatAmount(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
