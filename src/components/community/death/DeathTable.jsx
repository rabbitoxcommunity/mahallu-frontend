import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    RefreshCw,
    Eye,
    Pencil,
    Award,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getDeathRecords, deleteDeathRecord } from '../../../api/deathService';
import DeathFormModal from './DeathFormModal';
import DeathViewModal from './DeathViewModal';
import CertificateModal from './CertificateModal';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? '#0B65F6' : '#e5e7eb',
        borderRadius: '0.75rem',
        minHeight: '40px',
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

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
];

const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
};

const DeathTable = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState(null);

    // Modal states
    const [formModal, setFormModal] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [viewRecord, setViewRecord] = useState(null);
    const [certModal, setCertModal] = useState(false);
    const [certRecord, setCertRecord] = useState(null);

    const debounceRef = useRef(null);

    const fetchRecords = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            if (genderFilter) params.gender = genderFilter.value;
            const data = await getDeathRecords(params);
            setRecords(data.records || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch (e) {
            // handled by interceptor
        } finally {
            setLoading(false);
        }
    }, [searchTerm, genderFilter]);

    useEffect(() => {
        fetchRecords(1);
    }, [fetchRecords]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchTerm(val);
        }, 400);
    };

    const handleDelete = async (record) => {
        const result = await Swal.fire({
            title: t('death.form.deleteConfirm'),
            text: t('death.form.deleteConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('death.form.yesDelete'),
            cancelButtonText: t('common.cancel'),
            customClass: { popup: 'rounded-3xl' },
        });

        if (result.isConfirmed) {
            try {
                await deleteDeathRecord(record._id);
                toast.success(t('death.form.deleted'));
                fetchRecords(page);
            } catch (e) {
                // handled
            }
        }
    };

    const handleFormSuccess = () => {
        setFormModal(false);
        setEditRecord(null);
        fetchRecords(1);
    };

    const pageNums = getPageNumbers(page, pages);

    return (
        <div className="space-y-4">
            {/* Filters Row */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder={t('death.table.searchPlaceholder')}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="w-full sm:w-48">
                        <Select
                            options={GENDER_OPTIONS}
                            value={genderFilter}
                            onChange={setGenderFilter}
                            isClearable
                            placeholder={t('death.table.allGenders')}
                            styles={getSelectStyles()}
                        />
                    </div>
                    <button
                        onClick={() => fetchRecords(1)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {total} {t('common.showing')}
                </p>
                <button
                    onClick={() => { setEditRecord(null); setFormModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    {t('death.table.registerDeath')}
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#252731] border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.deathId')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.name')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.house')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.dateOfDeath')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.age')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.certificate')}
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('death.table.chargeStatus')}
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                                        {t('death.table.noRecords')}
                                    </td>
                                </tr>
                            ) : (
                                records.map((rec) => (
                                    <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-[#252731] transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                                                {rec.death_id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">{rec.name}</p>
                                            {rec.gender && (
                                                <p className="text-xs text-gray-400">{rec.gender}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                            {rec.house_id ? `${rec.house_id.house_code}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                            {formatDate(rec.date_of_death)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                            {rec.age != null ? `${rec.age} yrs` : '—'}
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
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.payment_status === 'paid'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : rec.payment_status === 'partial'
                                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                        }`}
                                                >
                                                    {t(`death.paymentStatus.${rec.payment_status}`)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setViewRecord(rec); setViewModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => { setEditRecord(rec); setFormModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => { setCertRecord(rec); setCertModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Certificate"
                                                >
                                                    <Award size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rec)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>
                    ))
                ) : records.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-gray-400 dark:text-gray-600 text-sm">
                        {t('death.table.noRecords')}
                    </div>
                ) : (
                    records.map((rec) => (
                        <div key={rec._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {rec.death_id}
                                    </span>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                                        {rec.name}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.certificate_generated
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {rec.certificate_generated ? t('death.table.generated') : t('death.table.pending')}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span>{formatDate(rec.date_of_death)}</span>
                                {rec.age != null && <span>{rec.age} yrs</span>}
                                {rec.gender && <span>{rec.gender}</span>}
                                {rec.house_id && <span>{rec.house_id.house_code}</span>}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => { setViewRecord(rec); setViewModal(true); }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Eye size={13} /> View
                                </button>
                                <button
                                    onClick={() => { setEditRecord(rec); setFormModal(true); }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                >
                                    <Pencil size={13} /> Edit
                                </button>
                                <button
                                    onClick={() => { setCertRecord(rec); setCertModal(true); }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                >
                                    <Award size={13} /> Cert
                                </button>
                                <button
                                    onClick={() => handleDelete(rec)}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {total > 0 && pages > 1 && (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => fetchRecords(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {pageNums.map((p, i) =>
                        p === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                                ...
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => fetchRecords(p)}
                                className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${p === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => fetchRecords(page + 1)}
                        disabled={page === pages}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Modals */}
            {formModal && (
                <DeathFormModal
                    editRecord={editRecord}
                    onClose={() => { setFormModal(false); setEditRecord(null); }}
                    onSuccess={handleFormSuccess}
                />
            )}

            {viewModal && viewRecord && (
                <DeathViewModal
                    record={viewRecord}
                    onClose={() => { setViewModal(false); setViewRecord(null); }}
                    onGenerateCert={() => {
                        setCertRecord(viewRecord);
                        setViewModal(false);
                        setCertModal(true);
                    }}
                />
            )}

            {certModal && certRecord && (
                <CertificateModal
                    record={certRecord}
                    onClose={() => { setCertModal(false); setCertRecord(null); fetchRecords(page); }}
                />
            )}
        </div>
    );
};

export default DeathTable;
