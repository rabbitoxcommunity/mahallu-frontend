import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, ClipboardList, CheckCircle, School, CalendarDays } from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
    getResults, createResult, updateResult, deleteResult, publishResult, getResult,
    getMadrasasForSelect, getClasses, getResultTypes, getAcademicYearsForSelect,
} from '../../api/resultService';
import ResultFormModal from './ResultFormModal';
import ResultView from './ResultView';

const LIMIT = 20;

const ss = () => ({
    control: (b, s) => ({ ...b, backgroundColor: 'transparent', borderColor: s.isFocused ? '#0B65F6' : 'transparent', borderRadius: '0.75rem', fontSize: '0.8rem', minHeight: '36px', boxShadow: 'none' }),
    menu: (b) => ({ ...b, borderRadius: '0.75rem', border: '1px solid #e5e7eb', zIndex: 100 }),
    option: (b, s) => ({ ...b, fontSize: '0.8rem', backgroundColor: s.isSelected ? '#0B65F6' : s.isFocused ? '#f3f4f6' : 'transparent', color: s.isSelected ? '#fff' : '#374151' }),
    placeholder: (b) => ({ ...b, color: '#9ca3af', fontSize: '0.8rem' }),
    singleValue: (b) => ({ ...b, color: 'inherit', fontSize: '0.8rem' }),
    input: (b) => ({ ...b, color: 'inherit' }),
});

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
];

const statusBadge = (s) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{s}</span>
);

const ResultList = () => {
    const { t } = useTranslation();

    // Navigation
    const [academicYears, setAcademicYears]     = useState([]);
    const [activeYear, setActiveYear]           = useState('');   // '' = All years
    const [madrasas, setMadrasas]               = useState([]);
    const [activeMadrasa, setActiveMadrasa]     = useState('');   // '' = All madrasas
    const [classes, setClasses]                 = useState([]);
    const [activeClass, setActiveClass]         = useState('');   // '' = All classes

    // Secondary filter options
    const [resultTypeOptions, setResultTypeOptions] = useState([]);
    const [resultTypeId, setResultTypeId]           = useState('');
    const [status, setStatus]                       = useState('');
    const [search, setSearch]                       = useState('');

    // Results
    const [results, setResults]   = useState([]);
    const [total, setTotal]       = useState(0);
    const [page, setPage]         = useState(1);
    const [pages, setPages]       = useState(1);
    const [loading, setLoading]   = useState(false);

    // Modals
    const [formModal, setFormModal] = useState({ open: false, data: null });
    const [viewModal, setViewModal] = useState({ open: false, data: null });

    const debounce = useRef(null);

    // Load static options once
    useEffect(() => {
        getAcademicYearsForSelect()
            .then(d => setAcademicYears(d.academicYears || []))
            .catch(() => {});
        getMadrasasForSelect()
            .then(d => setMadrasas(d.madrasas || []))
            .catch(() => {});
        getResultTypes({ limit: 100 })
            .then(d => setResultTypeOptions([{ value: '', label: t('results.list.allTypes') }, ...(d.resultTypes || []).map(rt => ({ value: rt._id, label: rt.name }))]))
            .catch(() => {});
    }, []);

    // Load classes when madrasa changes
    useEffect(() => {
        setActiveClass('');
        setClasses([]);
        if (!activeMadrasa) return;
        getClasses({ madrasa_id: activeMadrasa, limit: 100 })
            .then(d => setClasses(d.classes || []))
            .catch(() => {});
    }, [activeMadrasa]);

    const fetchResults = useCallback(async (p = page) => {
        try {
            setLoading(true);
            const params = { page: p, limit: LIMIT };
            if (search) params.search = search;
            if (activeYear) params.academic_year_id = activeYear;
            if (activeMadrasa) params.madrasa_id = activeMadrasa;
            if (activeClass) params.class_id = activeClass;
            if (resultTypeId) params.result_type_id = resultTypeId;
            if (status) params.status = status;
            const data = await getResults(params);
            setResults(data.results || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch { } finally { setLoading(false); }
    }, [page, search, activeYear, activeMadrasa, activeClass, resultTypeId, status]);

    useEffect(() => { fetchResults(page); }, [page, search, activeYear, activeMadrasa, activeClass, resultTypeId, status]);

    const resetPage = () => setPage(1);

    const handleSearch = (v) => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => { setSearch(v); resetPage(); }, 400);
    };

    const selectYear    = (id) => { setActiveYear(id); setActiveMadrasa(''); setActiveClass(''); setClasses([]); resetPage(); };
    const selectMadrasa = (id) => { setActiveMadrasa(id); resetPage(); };
    const selectClass   = (id) => { setActiveClass(id); resetPage(); };

    const handleFormSubmit = async (data) => {
        try {
            if (formModal.data) { await updateResult(formModal.data._id, data); toast.success(t('results.list.updated')); }
            else { await createResult(data); toast.success(t('results.list.created')); }
            setFormModal({ open: false, data: null });
            fetchResults(1); resetPage();
        } catch { }
    };

    const handleDelete = async (id) => {
        const res = await Swal.fire({ title: t('common.deleteConfirm'), text: t('common.deleteText'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: t('common.delete'), cancelButtonText: t('common.cancel'), customClass: { popup: 'rounded-3xl' } });
        if (res.isConfirmed) {
            try { await deleteResult(id); toast.success(t('results.list.deleted')); fetchResults(page); } catch { }
        }
    };

    const handlePublish = async (id) => {
        try {
            await publishResult(id);
            toast.success(t('results.list.published'));
            fetchResults(page);
            setViewModal(prev => ({ ...prev, data: prev.data ? { ...prev.data, status: 'published', is_published: true } : null }));
        } catch { }
    };

    const handleView = async (r) => {
        try {
            const data = await getResult(r._id);
            setViewModal({ open: true, data: data.result });
        } catch { }
    };

    const openCreate = () => {
        const prefill = {};
        if (activeYear) prefill.academic_year_id = activeYear;
        if (activeMadrasa) prefill.madrasa_id = activeMadrasa;
        if (activeClass) prefill.class_id = activeClass;
        setFormModal({ open: true, data: Object.keys(prefill).length ? prefill : null });
    };

    const getPageNumbers = () => {
        if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
        if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [1, '...', page - 1, page, page + 1, '...', pages];
    };

    const activeYearName    = academicYears.find(y => y._id === activeYear)?.name;
    const activeMadrasaName = madrasas.find(m => m._id === activeMadrasa)?.name;
    const activeClassName   = classes.find(c => c._id === activeClass)?.name;

    const breadcrumb = [activeYearName, activeMadrasaName, activeClassName].filter(Boolean).join(' › ');

    return (
        <div className="space-y-4">

            {/* ── Academic Year Tabs ───────────────────────────────── */}
            {academicYears.length > 0 && (
                <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex-shrink-0 flex items-center gap-1">
                            <CalendarDays size={12} /> Year:
                        </span>
                        <button
                            onClick={() => selectYear('')}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                activeYear === ''
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            All Years
                        </button>
                        {academicYears.map(y => (
                            <button
                                key={y._id}
                                onClick={() => selectYear(y._id)}
                                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                    activeYear === y._id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {y.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Madrasa Tabs ─────────────────────────────────────── */}
            {madrasas.length > 0 && (
                <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => selectMadrasa('')}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                activeMadrasa === ''
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            All Madrasas
                        </button>
                        {madrasas.map(m => (
                            <button
                                key={m._id}
                                onClick={() => selectMadrasa(m._id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                    activeMadrasa === m._id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <School size={13} className="flex-shrink-0" />
                                {m.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Class Sub-tabs (only when a madrasa is selected) ─── */}
            {activeMadrasa && classes.length > 0 && (
                <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 px-3 py-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex-shrink-0">Class:</span>
                        <button
                            onClick={() => selectClass('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                activeClass === ''
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            All Classes
                        </button>
                        {classes.map(c => (
                            <button
                                key={c._id}
                                onClick={() => selectClass(c._id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                    activeClass === c._id
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Top bar: count + Add ──────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{total} {t('results.list.records')}</p>
                    {breadcrumb && (
                        <span className="text-xs px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                            {breadcrumb}
                        </span>
                    )}
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Plus size={15} />{t('results.list.create')}
                </button>
            </div>

            {/* ── Search & secondary filters ────────────────────────── */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                        <input
                            onChange={e => handleSearch(e.target.value)}
                            placeholder={t('results.list.searchPlaceholder')}
                            className="w-full pl-8 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                    {resultTypeOptions.length > 1 && (
                        <div className="w-36 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                            <Select
                                options={resultTypeOptions}
                                value={resultTypeOptions.find(o => o.value === resultTypeId) || resultTypeOptions[0]}
                                onChange={o => { setResultTypeId(o?.value || ''); resetPage(); }}
                                styles={ss()}
                            />
                        </div>
                    )}
                    <div className="w-32 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Select
                            options={STATUS_OPTIONS}
                            value={STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0]}
                            onChange={o => { setStatus(o?.value || ''); resetPage(); }}
                            styles={ss()}
                        />
                    </div>
                    <button onClick={() => fetchResults(page)} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm disabled:opacity-50">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── Desktop Table ─────────────────────────────────────── */}
            <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.resultNo')}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.student')}</th>
                            {!activeMadrasa && (
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.madrasa')}</th>
                            )}
                            {!activeClass && (
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.class')}</th>
                            )}
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.resultType')}</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.academicYear')}</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.percentage')}</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.list.grade')}</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center py-16 text-gray-400 dark:text-gray-600">
                                    <ClipboardList size={36} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">{t('results.list.noRecords')}</p>
                                </td>
                            </tr>
                        ) : results.map(r => (
                            <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-5 py-3.5 text-xs font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">{r.result_no}</td>
                                <td className="px-5 py-3.5">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{r.student_name || r.member_id?.full_name || '—'}</p>
                                </td>
                                {!activeMadrasa && (
                                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.madrasa_id?.name || '—'}</td>
                                )}
                                {!activeClass && (
                                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.class_id?.name || '—'}</td>
                                )}
                                <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.result_type_id?.name || '—'}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.academic_year_id?.name || '—'}</td>
                                <td className="px-4 py-3.5 text-center text-sm font-medium text-gray-900 dark:text-white">{r.percentage}%</td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{r.overall_grade}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center">{statusBadge(r.status)}</td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => handleView(r)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View"><Eye size={13} /></button>
                                        <button onClick={() => setFormModal({ open: true, data: r })} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors" title="Edit"><Pencil size={13} /></button>
                                        {r.status !== 'published' && (
                                            <button onClick={() => handlePublish(r._id)} className="p-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors" title="Publish"><CheckCircle size={13} /></button>
                                        )}
                                        <button onClick={() => handleDelete(r._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg transition-colors" title="Delete"><Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile Cards ──────────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
                            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                    ))
                ) : results.length === 0 ? (
                    <div className="text-center py-12 text-gray-400"><ClipboardList size={28} className="mx-auto mb-2 opacity-40" /><p className="text-sm">{t('results.list.noRecords')}</p></div>
                ) : results.map(r => (
                    <div key={r._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.student_name || r.member_id?.full_name}</p>
                                <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{r.result_no}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {statusBadge(r.status)}
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{r.overall_grade} · {r.percentage}%</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-3">
                            {!activeMadrasa && r.madrasa_id?.name && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.madrasa_id.name}</p>
                            )}
                            {!activeClass && r.class_id?.name && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.class_id.name}</p>
                            )}
                            {r.result_type_id?.name && <p className="text-xs text-gray-500 dark:text-gray-400">{r.result_type_id.name}</p>}
                            {r.academic_year_id?.name && <p className="text-xs text-gray-500 dark:text-gray-400">{r.academic_year_id.name}</p>}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => handleView(r)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center gap-1">
                                <Eye size={12} />{t('common.view')}
                            </button>
                            <button onClick={() => setFormModal({ open: true, data: r })} className="flex-1 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center gap-1">
                                <Pencil size={12} />{t('common.edit')}
                            </button>
                            {r.status !== 'published' && (
                                <button onClick={() => handlePublish(r._id)} className="py-1.5 px-3 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center gap-1">
                                    <CheckCircle size={12} />
                                </button>
                            )}
                            <button onClick={() => handleDelete(r._id)} className="flex-1 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center gap-1">
                                <Trash2 size={12} />{t('common.delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.showing')} {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} / {total}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"><ChevronLeft size={15} /></button>
                        {getPageNumbers().map((n, i) =>
                            n === '...'
                                ? <span key={i} className="px-2 text-gray-400 text-sm">…</span>
                                : <button key={n} onClick={() => setPage(n)} className={`min-w-8 h-8 rounded-lg text-sm font-medium ${page === n ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>{n}</button>
                        )}
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"><ChevronRight size={15} /></button>
                    </div>
                </div>
            )}

            <ResultFormModal
                isOpen={formModal.open}
                onClose={() => setFormModal({ open: false, data: null })}
                onSubmit={handleFormSubmit}
                initialData={formModal.data}
            />
            <ResultView
                isOpen={viewModal.open}
                onClose={() => setViewModal({ open: false, data: null })}
                result={viewModal.data}
                onPublish={handlePublish}
            />
        </div>
    );
};

export default ResultList;
