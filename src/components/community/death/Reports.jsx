import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { FileText, Users, UserCheck, UserMinus, Printer } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { getDeathReports } from '../../../api/deathService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const COLORS = ['#0B65F6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
];

const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? '#0B65F6' : 'transparent',
        borderRadius: '0.75rem',
        minHeight: '42px',
        boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
        '&:hover': { borderColor: '#0B65F6' },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        zIndex: 100,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '0.875rem',
        backgroundColor: state.isSelected ? '#0B65F6' : state.isFocused ? '#f3f4f6' : 'transparent',
        color: state.isSelected ? '#fff' : '#374151',
        cursor: 'pointer',
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
    input: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
    clearIndicator: (base) => ({ ...base, padding: '4px', cursor: 'pointer' }),
    dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
});

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

const DeathReports = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from_date: '',
        to_date: '',
        gender: null,
    });

    const fetchReports = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const params = {};
            if (f.from_date) params.from_date = f.from_date;
            if (f.to_date) params.to_date = f.to_date;
            if (f.gender) params.gender = f.gender.value;
            const result = await getDeathReports(params);
            setData(result);
        } catch (e) {
            // handled
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const handleClear = () => {
        const cleared = { from_date: '', to_date: '', gender: null };
        setFilters(cleared);
        fetchReports(cleared);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        if (!data) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(t('death.reports.title'), 14, 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 23);

        const summary = data.summary || {};
        doc.setFontSize(11);
        doc.text(
            `Total: ${summary.total || 0}  |  Male: ${summary.male || 0}  |  Female: ${summary.female || 0}  |  Certificates: ${summary.certificates_generated || 0}`,
            14,
            31
        );

        const rows = (data.records || []).map((r, i) => [
            i + 1,
            r.death_id,
            r.name,
            r.age != null ? `${r.age} yrs` : '—',
            r.gender || '—',
            formatDate(r.date_of_death),
            r.certificate_generated ? 'Yes' : 'No',
            r.charge_applicable
                ? `₹${(r.charge_amount || 0).toLocaleString('en-IN')} (${r.payment_status || ''})`
                : '—',
        ]);

        autoTable(doc, {
            startY: 38,
            head: [['#', 'Death ID', 'Name', 'Age', 'Gender', 'Date of Death', 'Certificate', 'Charges']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [239, 246, 255] },
        });

        doc.save('Death_Registry_Report.pdf');
        toast.success('PDF exported successfully');
    };

    const summary = data?.summary || {};
    const monthly = data?.monthly || [];
    const by_age_group = data?.by_age_group || [];
    const records = data?.records || [];

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('death.reports.fromDate')}
                        </label>
                        <input
                            type="date"
                            value={filters.from_date}
                            onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('death.reports.toDate')}
                        </label>
                        <input
                            type="date"
                            value={filters.to_date}
                            onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {t('death.reports.filterGender')}
                        </label>
                        <Select
                            options={GENDER_OPTIONS}
                            value={filters.gender}
                            onChange={opt => setFilters(f => ({ ...f, gender: opt }))}
                            isClearable
                            placeholder={t('death.reports.allGenders')}
                            styles={getSelectStyles()}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => fetchReports(filters)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        {loading ? t('common.loading') : t('death.reports.applyFilters')}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                    >
                        {t('death.reports.clearFilters')}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                    >
                        <Printer size={14} /> {t('death.reports.print')}
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={!data}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 disabled:opacity-40 rounded-xl text-sm font-medium transition-colors"
                    >
                        <FileText size={14} /> {t('death.reports.exportPDF')}
                    </button>
                </div>
            </div>

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SummaryCard
                            icon={Users}
                            label={t('death.reports.totalDeaths')}
                            value={summary.total || 0}
                            color="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <SummaryCard
                            icon={UserCheck}
                            label={t('death.reports.maleDeaths')}
                            value={summary.male || 0}
                            color="bg-gradient-to-br from-green-500 to-green-600"
                        />
                        <SummaryCard
                            icon={UserMinus}
                            label={t('death.reports.femaleDeaths')}
                            value={summary.female || 0}
                            color="bg-gradient-to-br from-pink-500 to-pink-600"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Statistics */}
                        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                {t('death.reports.monthly')}
                            </h3>
                            {monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthly} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            formatter={(v) => [v, 'Deaths']}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="count" fill="#0B65F6" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                                    {t('death.reports.noRecords')}
                                </div>
                            )}
                        </div>

                        {/* By Age Group */}
                        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                {t('death.reports.byAgeGroup')}
                            </h3>
                            {by_age_group.some(a => a.count > 0) ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={by_age_group} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={65} />
                                        <Tooltip
                                            formatter={(v) => [v, 'Deaths']}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                            {by_age_group.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                                    {t('death.reports.noRecords')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Records Table */}
                    {records.length > 0 && (
                        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t('death.reports.detailedList')} ({records.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-[#252731]">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.deathId')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.name')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.age')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.form.gender')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.dateOfDeath')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.certificate')}
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {t('death.table.chargeStatus')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {records.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-[#252731] transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        {rec.death_id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {rec.name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                                    {rec.age != null ? `${rec.age} yrs` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                                    {rec.gender || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                                    {formatDate(rec.date_of_death)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.certificate_generated
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {rec.certificate_generated ? t('death.table.generated') : t('death.table.pending')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {rec.charge_applicable ? (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                                                                ₹{(rec.charge_amount || 0).toLocaleString('en-IN')}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {t(`death.paymentStatus.${rec.payment_status}`)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {records.length === 0 && (
                        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                            <p className="text-gray-400 dark:text-gray-600 text-sm">
                                {t('death.reports.noRecords')}
                            </p>
                        </div>
                    )}
                </>
            )}

            {!data && !loading && (
                <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                    <p className="text-gray-400 dark:text-gray-600 text-sm">
                        Apply filters to generate report
                    </p>
                </div>
            )}
        </div>
    );
};

export default DeathReports;
