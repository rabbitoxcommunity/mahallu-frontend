import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
    getMadrasas, getMadrasasForSelect, createMadrasa, updateMadrasa, deleteMadrasa,
    getClasses, createClass, updateClass, deleteClass,
    getSubjects, createSubject, updateSubject, deleteSubject,
    getResultTypes, createResultType, updateResultType, deleteResultType,
    getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
} from '../../api/resultService';

const LIMIT = 20;

const ss = () => ({
    control: (b, s) => ({ ...b, backgroundColor: 'transparent', borderColor: s.isFocused ? '#0B65F6' : 'transparent', borderRadius: '0.75rem', boxShadow: s.isFocused ? '0 0 0 1px #0B65F6' : 'none', '&:hover': { borderColor: '#0B65F6' } }),
    menu: (b) => ({ ...b, borderRadius: '0.75rem', border: '1px solid #e5e7eb', zIndex: 100 }),
    option: (b, s) => ({ ...b, fontSize: '0.875rem', backgroundColor: s.isSelected ? '#0B65F6' : s.isFocused ? '#f3f4f6' : 'transparent', color: s.isSelected ? '#fff' : '#374151' }),
    placeholder: (b) => ({ ...b, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (b) => ({ ...b, color: 'inherit', fontSize: '0.875rem' }),
    input: (b) => ({ ...b, color: 'inherit' }),
});

const ic = (err) => `w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252731] border ${err ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`;
const lc = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const statusBadge = (s) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{s}</span>
);

const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
const MADRASA_TYPE_OPTIONS = [
    { value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' },
    { value: 'weekend', label: 'Weekend' }, { value: 'full_time', label: 'Full Time' }, { value: 'other', label: 'Other' },
];

/* ─── Settings Tab ─── */
const SettingsTab = ({ config }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, data: null });
    const debounce = useRef(null);

    const [madrasaOptions, setMadrasaOptions] = useState([]);
    const [madrasaFilter, setMadrasaFilter] = useState('');
    const [classOptions, setClassOptions] = useState([]);
    const [classFilter, setClassFilter] = useState('');

    useEffect(() => {
        if (config.hasMadrasaFilter) {
            getMadrasasForSelect().then(d => setMadrasaOptions((d.madrasas || []).map(m => ({ value: m._id, label: m.name })))).catch(() => {});
        }
    }, [config.hasMadrasaFilter]);

    // Load class options when madrasa filter changes (for subjects tab)
    useEffect(() => {
        if (config.hasClassFilter && madrasaFilter) {
            getClasses({ madrasa_id: madrasaFilter, limit: 100 })
                .then(d => setClassOptions((d.classes || []).map(c => ({ value: c._id, label: c.name }))))
                .catch(() => {});
            setClassFilter('');
        } else {
            setClassOptions([]);
            setClassFilter('');
        }
    }, [madrasaFilter, config.hasClassFilter]);

    const fetch = useCallback(async (p = page, s = search, mf = madrasaFilter, cf = classFilter) => {
        try {
            setLoading(true);
            const params = { page: p, limit: LIMIT };
            if (s) params.search = s;
            if (mf) params.madrasa_id = mf;
            if (cf) params.class_id = cf;
            const data = await config.fetchFn(params);
            setItems(data[config.listKey] || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch { } finally { setLoading(false); }
    }, [page, search, madrasaFilter, classFilter, config]);

    useEffect(() => { fetch(page, search, madrasaFilter, classFilter); }, [page, search, madrasaFilter, classFilter]);

    const handleSearch = (v) => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
    };

    const handleSubmit = async (data) => {
        try {
            if (modal.data) { await config.updateFn(modal.data._id, data); toast.success(t('results.settings.updated')); }
            else { await config.createFn(data); toast.success(t('results.settings.created')); }
            setModal({ open: false, data: null }); fetch(1, search, madrasaFilter, classFilter); setPage(1);
        } catch { }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: t('common.deleteConfirm'), text: t('common.deleteText'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: t('common.delete'), cancelButtonText: t('common.cancel'), customClass: { popup: 'rounded-3xl' } });
        if (result.isConfirmed) {
            try { await config.deleteFn(id); toast.success(t('results.settings.deleted')); fetch(page, search, madrasaFilter, classFilter); } catch { }
        }
    };

    const getPageNumbers = () => {
        if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
        if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [1, '...', page - 1, page, page + 1, '...', pages];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{total} {t(config.labelKey)}</p>
                <button onClick={() => setModal({ open: true, data: null })} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Plus size={15} />{t(config.addLabelKey)}
                </button>
            </div>

            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input onChange={e => handleSearch(e.target.value)} placeholder={t('common.search')}
                        className="w-full pl-8 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                {config.hasMadrasaFilter && (
                    <div className="w-44 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Select
                            options={[{ value: '', label: t('results.settings.allMadrasas') }, ...madrasaOptions]}
                            value={madrasaOptions.find(o => o.value === madrasaFilter) || { value: '', label: t('results.settings.allMadrasas') }}
                            onChange={o => { setMadrasaFilter(o?.value || ''); setPage(1); }}
                            styles={ss()} />
                    </div>
                )}
                {config.hasClassFilter && madrasaFilter && (
                    <div className="w-40 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Select
                            options={[{ value: '', label: t('results.settings.allClasses') }, ...classOptions]}
                            value={classOptions.find(o => o.value === classFilter) || { value: '', label: t('results.settings.allClasses') }}
                            onChange={o => { setClassFilter(o?.value || ''); setPage(1); }}
                            styles={ss()} />
                    </div>
                )}
                <button onClick={() => fetch(page, search, madrasaFilter, classFilter)} disabled={loading} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm disabled:opacity-50">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.settings.code')}</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('results.settings.name')}</th>
                        {config.extraCols && config.extraCols.map(col => (
                            <th key={col.label} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(col.label)}</th>
                        ))}
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i}>{Array.from({ length: 4 + (config.extraCols?.length || 0) }).map((_, j) => (
                                <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                            ))}</tr>
                        )) : items.length === 0 ? (
                            <tr><td colSpan={5 + (config.extraCols?.length || 0)} className="text-center py-12 text-sm text-gray-400 dark:text-gray-600">{t('common.noData')}</td></tr>
                        ) : items.map(item => (
                            <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-5 py-3 text-xs font-mono text-blue-600 dark:text-blue-400">{item.code}</td>
                                <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                {config.extraCols && config.extraCols.map(col => (
                                    <td key={col.label} className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{col.render(item)}</td>
                                ))}
                                <td className="px-5 py-3">{statusBadge(item.status)}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => setModal({ open: true, data: item })} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"><Pencil size={13} /></button>
                                        <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {loading ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                )) : items.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400 dark:text-gray-600">{t('common.noData')}</div>
                ) : items.map(item => (
                    <div key={item._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <p className="font-mono text-xs text-blue-600 dark:text-blue-400">{item.code}</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{item.name}</p>
                            </div>
                            {statusBadge(item.status)}
                        </div>
                        {config.extraCols && config.extraCols.length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                {config.extraCols.map(col => (
                                    <p key={col.label} className="text-xs text-gray-500 dark:text-gray-400">
                                        {t(col.label)}: <span className="font-medium text-gray-700 dark:text-gray-300">{col.render(item)}</span>
                                    </p>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => setModal({ open: true, data: item })}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors">
                                <Pencil size={12} /> {t('common.edit')}
                            </button>
                            <button onClick={() => handleDelete(item._id)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors">
                                <Trash2 size={12} /> {t('common.delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} / {total}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"><ChevronLeft size={14} /></button>
                        {getPageNumbers().map((n, i) => n === '...' ? <span key={i} className="px-1 text-gray-400">…</span>
                            : <button key={n} onClick={() => setPage(n)} className={`min-w-7 h-7 rounded-lg text-xs font-medium ${page === n ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{n}</button>)}
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"><ChevronRight size={14} /></button>
                    </div>
                </div>
            )}

            <SettingsModal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} onSubmit={handleSubmit} initialData={modal.data} config={config} madrasaOptions={madrasaOptions} />
        </div>
    );
};

/* ─── Settings Modal ─── */
const SettingsModal = ({ isOpen, onClose, onSubmit, initialData, config, madrasaOptions }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm();
    const [classOptions, setClassOptions] = useState([]);
    const watchedMadrasa = watch('madrasa_id');

    useEffect(() => {
        if (config.hasClassFilter && watchedMadrasa) {
            getClasses({ madrasa_id: watchedMadrasa, limit: 100 })
                .then(d => setClassOptions((d.classes || []).map(c => ({ value: c._id, label: c.name }))))
                .catch(() => {});
        } else {
            setClassOptions([]);
        }
    }, [watchedMadrasa, config.hasClassFilter]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const mid = initialData.madrasa_id?._id || initialData.madrasa_id || '';
                const cid = initialData.class_id?._id || initialData.class_id || '';
                reset({
                    name: initialData.name || '',
                    short_name: initialData.short_name || '',
                    type: initialData.type || 'morning',
                    status: initialData.status || 'active',
                    madrasa_id: mid,
                    class_id: cid,
                    start_date: initialData.start_date ? initialData.start_date.slice(0, 10) : '',
                    end_date: initialData.end_date ? initialData.end_date.slice(0, 10) : '',
                });
                if (mid && config.hasClassFilter) {
                    getClasses({ madrasa_id: mid, limit: 100 })
                        .then(d => setClassOptions((d.classes || []).map(c => ({ value: c._id, label: c.name }))))
                        .catch(() => {});
                }
            } else {
                reset({ name: '', short_name: '', type: 'morning', status: 'active', madrasa_id: '', class_id: '', start_date: '', end_date: '' });
                setClassOptions([]);
            }
        }
    }, [isOpen, initialData, reset, config.hasClassFilter]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}>
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        className="w-full max-w-md bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">{initialData ? t(config.editLabelKey) : t(config.addLabelKey)}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X size={18} className="text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                            {/* Madrasa select */}
                            {config.hasMadrasaFilter && (
                                <div>
                                    <label className={lc}>{t('results.settings.madrasa')} <span className="text-red-500">*</span></label>
                                    <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <Controller name="madrasa_id" control={control} rules={{ required: t('results.settings.madrasaRequired') }}
                                            render={({ field }) => (
                                                <Select options={madrasaOptions} value={madrasaOptions.find(o => o.value === field.value) || null}
                                                    onChange={o => { field.onChange(o?.value || ''); }} styles={ss()} placeholder={t('results.settings.selectMadrasa')} />
                                            )} />
                                    </div>
                                    {errors.madrasa_id && <p className="mt-1 text-xs text-red-500">{errors.madrasa_id.message}</p>}
                                </div>
                            )}

                            {/* Class select (only for subjects) */}
                            {config.hasClassFilter && (
                                <div>
                                    <label className={lc}>{t('results.settings.class')} <span className="text-red-500">*</span></label>
                                    <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <Controller name="class_id" control={control} rules={{ required: t('results.settings.classRequired') }}
                                            render={({ field }) => (
                                                <Select options={classOptions} value={classOptions.find(o => o.value === field.value) || null}
                                                    onChange={o => field.onChange(o?.value || '')}
                                                    styles={ss()} placeholder={t('results.settings.selectClass')}
                                                    isDisabled={!watchedMadrasa || classOptions.length === 0}
                                                    noOptionsMessage={() => watchedMadrasa ? t('common.noData') : t('results.settings.selectMadrasaFirst')} />
                                            )} />
                                    </div>
                                    {errors.class_id && <p className="mt-1 text-xs text-red-500">{errors.class_id.message}</p>}
                                </div>
                            )}

                            <div>
                                <label className={lc}>{t('results.settings.name')} <span className="text-red-500">*</span></label>
                                <input
                                    {...register('name', { required: t('results.settings.nameRequired') })}
                                    placeholder={config.namePlaceholder || ''}
                                    className={ic(errors.name)} />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                            </div>

                            {config.hasDateRange && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className={lc}>{t('results.settings.startDate')}</label>
                                        <input type="date" {...register('start_date')} className={ic(false)} />
                                    </div>
                                    <div>
                                        <label className={lc}>{t('results.settings.endDate')}</label>
                                        <input type="date" {...register('end_date')} className={ic(false)} />
                                    </div>
                                </div>
                            )}

                            {config.hasShortName && (
                                <div>
                                    <label className={lc}>{t('results.settings.shortName')}</label>
                                    <input {...register('short_name')} className={ic(false)} />
                                </div>
                            )}

                            {config.hasType && (
                                <div>
                                    <label className={lc}>{t('results.settings.type')}</label>
                                    <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <Controller name="type" control={control}
                                            render={({ field }) => (
                                                <Select options={MADRASA_TYPE_OPTIONS} value={MADRASA_TYPE_OPTIONS.find(o => o.value === field.value) || null}
                                                    onChange={o => field.onChange(o?.value || '')} styles={ss()} />
                                            )} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={lc}>{t('common.status')}</label>
                                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <Controller name="status" control={control}
                                        render={({ field }) => (
                                            <Select options={STATUS_OPTIONS} value={STATUS_OPTIONS.find(o => o.value === field.value) || null}
                                                onChange={o => field.onChange(o?.value || 'active')} styles={ss()} />
                                        )} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2">
                                    {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</> : initialData ? t('common.update') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* ─── Tab definitions ─── */
const TABS = ['madrasas', 'classes', 'subjects', 'resultTypes', 'academicYears'];

const ResultSettings = () => {
    const { t } = useTranslation();
    const [active, setActive] = useState('madrasas');

    const CONFIGS = {
        madrasas: {
            labelKey: 'results.settings.tabs.madrasas', addLabelKey: 'results.settings.addMadrasa', editLabelKey: 'results.settings.editMadrasa',
            listKey: 'madrasas', fetchFn: getMadrasas, createFn: createMadrasa, updateFn: updateMadrasa, deleteFn: deleteMadrasa,
            hasMadrasaFilter: false, hasClassFilter: false, hasType: true, hasShortName: false,
        },
        classes: {
            labelKey: 'results.settings.tabs.classes', addLabelKey: 'results.settings.addClass', editLabelKey: 'results.settings.editClass',
            listKey: 'classes', fetchFn: getClasses, createFn: createClass, updateFn: updateClass, deleteFn: deleteClass,
            hasMadrasaFilter: true, hasClassFilter: false, hasType: false, hasShortName: false,
            extraCols: [{ label: 'results.settings.madrasa', render: (item) => item.madrasa_id?.name || '—' }],
        },
        subjects: {
            labelKey: 'results.settings.tabs.subjects', addLabelKey: 'results.settings.addSubject', editLabelKey: 'results.settings.editSubject',
            listKey: 'subjects', fetchFn: getSubjects, createFn: createSubject, updateFn: updateSubject, deleteFn: deleteSubject,
            hasMadrasaFilter: true, hasClassFilter: true, hasType: false, hasShortName: true,
            extraCols: [
                { label: 'results.settings.madrasa', render: (item) => item.madrasa_id?.name || '—' },
                { label: 'results.settings.class', render: (item) => item.class_id?.name || '—' },
            ],
        },
        resultTypes: {
            labelKey: 'results.settings.tabs.resultTypes', addLabelKey: 'results.settings.addResultType', editLabelKey: 'results.settings.editResultType',
            listKey: 'resultTypes', fetchFn: getResultTypes, createFn: createResultType, updateFn: updateResultType, deleteFn: deleteResultType,
            hasMadrasaFilter: false, hasClassFilter: false, hasType: false, hasShortName: false,
        },
        academicYears: {
            labelKey: 'results.settings.tabs.academicYears', addLabelKey: 'results.settings.addAcademicYear', editLabelKey: 'results.settings.editAcademicYear',
            listKey: 'academicYears', fetchFn: getAcademicYears, createFn: createAcademicYear, updateFn: updateAcademicYear, deleteFn: deleteAcademicYear,
            hasMadrasaFilter: false, hasClassFilter: false, hasType: false, hasShortName: false, hasDateRange: false,
            namePlaceholder: 'e.g. 2025-2026',
        },
    };

    return (
        <div className="space-y-5">
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 grid grid-cols-2 sm:grid-cols-5 gap-1">
                {TABS.map((tab, index) => (
                    <button key={tab} onClick={() => setActive(tab)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-center
                        ${index === TABS.length - 1 ? 'col-span-2 sm:col-span-1' : ''}
                        ${active === tab ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {t(CONFIGS[tab].labelKey)}
                    </button>
                ))}
            </div>
            <SettingsTab key={active} config={CONFIGS[active]} />
        </div>
    );
};

export default ResultSettings;
