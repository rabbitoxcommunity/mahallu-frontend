import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getArchivedAnnouncements, restoreAnnouncement } from '../../../api/communicationService';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
};

const Archive = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debounceRef = useRef(null);

    const fetchRecords = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            const data = await getArchivedAnnouncements(params);
            setRecords(data.records || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch { /* handled */ } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => { fetchRecords(1); }, [fetchRecords]);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearchTerm(e.target.value), 400);
    };

    const handleRestore = async (rec) => {
        try {
            await restoreAnnouncement(rec._id);
            toast.success(t('comm.messages.restored'));
            fetchRecords(page);
        } catch { /* handled */ }
    };

    const pageNums = getPageNumbers(page, pages);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder={t('comm.filter.search')}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => fetchRecords(1)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">{total} {t('common.showing')}</p>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#252731] border-b border-gray-100 dark:border-gray-800">
                                {['comm.table.no', 'comm.table.type', 'comm.table.title', 'comm.table.date', 'common.createdBy', 'common.actions'].map(k => (
                                    <th key={k} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t(k)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                                    ))}</tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">{t('comm.archive.noRecords')}</td>
                                </tr>
                            ) : records.map((rec) => (
                                <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-[#252731] transition-colors">
                                    <td className="px-4 py-3"><span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{rec.announcement_no}</span></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{rec.type}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-48">{rec.title}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(rec.updated_at)}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{rec.created_by?.name || '—'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleRestore(rec)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium">
                                            <RotateCcw size={12} />
                                            {t('comm.actions.restore')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))
                ) : records.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-gray-400 text-sm">{t('comm.archive.noRecords')}</div>
                ) : records.map((rec) => (
                    <div key={rec._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{rec.announcement_no}</span>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5 line-clamp-2">{rec.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{rec.type} · {formatDate(rec.updated_at)}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => handleRestore(rec)} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg transition-colors font-medium">
                                <RotateCcw size={12} /> {t('comm.actions.restore')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {total > 0 && pages > 1 && (
                <div className="flex items-center justify-center gap-1">
                    <button onClick={() => fetchRecords(page - 1)} disabled={page === 1} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                    {pageNums.map((p, i) =>
                        p === '...' ? <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                            : <button key={p} onClick={() => fetchRecords(p)} className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{p}</button>
                    )}
                    <button onClick={() => fetchRecords(page + 1)} disabled={page === pages} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
};

export default Archive;
