import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublishedAnnouncements, getCommSettings } from '../../../api/communicationService';
import AnnouncementPreview from './AnnouncementPreview';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
};

const buildMessage = (rec, settings, t) => {
    const sig = settings?.signature || '';
    const org = settings?.organization_name || '';
    const dateStr = rec.announcement_date ? new Date(rec.announcement_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    let msg = `${t('comm.preview.salutation')}\n\n`;
    if (rec.body) msg += `${rec.body}\n\n`;
    if (dateStr) msg += `📅 ${dateStr}\n\n`;
    msg += `— ${sig}\n${org}\n\nwww.mahalluconnect.com`;
    return msg.trim();
};

const Published = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState({});
    const [viewRecord, setViewRecord] = useState(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        getCommSettings().then(d => setSettings(d.settings || {})).catch(() => {});
    }, []);

    const fetchRecords = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            const data = await getPublishedAnnouncements(params);
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

    const handleCopy = async (rec) => {
        try {
            await navigator.clipboard.writeText(buildMessage(rec, settings, t));
            toast.success(t('comm.actions.copied'));
        } catch { toast.error(t('comm.actions.copyFailed')); }
    };

    const handleShare = (rec) => {
        const text = buildMessage(rec, settings, t);
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
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
                                {['comm.table.type', 'comm.table.title', 'comm.table.publishedDate', 'common.createdBy', 'comm.table.whatsapp', 'common.actions'].map(k => (
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
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">{t('comm.published.noRecords')}</td>
                                </tr>
                            ) : records.map((rec) => (
                                <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-[#252731] transition-colors">
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{rec.type}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-48">{rec.title}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(rec.published_at)}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{rec.created_by?.name || '—'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleShare(rec)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors text-xs font-medium whitespace-nowrap">
                                            <WhatsAppIcon size={13} />
                                            {t('comm.actions.shareToWhatsapp')}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setViewRecord(rec)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title={t('common.view')}><Eye size={14} /></button>
                                            <button onClick={() => handleCopy(rec)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={t('comm.actions.copy')}><Copy size={14} /></button>
                                        </div>
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
                    <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center text-gray-400 text-sm">{t('comm.published.noRecords')}</div>
                ) : records.map((rec) => (
                    <div key={rec._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{rec.type}</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5 line-clamp-2">{rec.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(rec.published_at)} · {rec.created_by?.name || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => setViewRecord(rec)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Eye size={12} /> {t('common.view')}</button>
                            <button onClick={() => handleCopy(rec)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Copy size={12} /> {t('comm.actions.copy')}</button>
                            <button onClick={() => handleShare(rec)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors"><WhatsAppIcon size={12} /> {t('comm.actions.share')}</button>
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

            {/* View Modal */}
            <AnimatePresence>
                {viewRecord && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewRecord(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="bg-white dark:bg-[#1e1f25] rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{viewRecord.type}</p>
                                <h3 className="font-bold text-gray-900 dark:text-white mt-0.5">{viewRecord.title}</h3>
                            </div>
                            <div className="bg-[#e5ddd5] dark:bg-[#0d1418] rounded-2xl p-4">
                                <AnnouncementPreview type={viewRecord.type} title={viewRecord.title} body={viewRecord.body} announcementDate={viewRecord.announcement_date} organizationName={settings.organization_name} signature={settings.signature} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleCopy(viewRecord)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"><Copy size={14} /> {t('comm.actions.copy')}</button>
                                <button onClick={() => handleShare(viewRecord)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl text-sm font-medium transition-colors"><WhatsAppIcon size={14} /> {t('comm.actions.share')}</button>
                            </div>
                            <button onClick={() => setViewRecord(null)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">{t('common.close')}</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Published;
