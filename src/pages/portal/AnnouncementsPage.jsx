import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, Megaphone, ChevronLeft, ChevronRight, X, Calendar, Tag, Paperclip } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import EmptyState from '../../components/portal/EmptyState';
import LoadingSkeleton from '../../components/portal/LoadingSkeleton';
import { fetchAnnouncements, fetchAnnouncementCategories } from '../../api/portalService';
import { usePortal } from '../../context/PortalContext';
import { motion, AnimatePresence } from 'framer-motion';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const AnnouncementModal = ({ announcement, onClose }) => {
  if (!announcement) return null;
  const { title, category, body, published_at, attachment_url } = announcement;
  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative bg-white/40 dark:bg-black/40 backdrop-blur-3xl w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] max-h-[90vh] flex flex-col overflow-hidden border border-white/40 dark:border-white/10"
          onClick={e => e.stopPropagation()}
        >

          <div className="relative flex items-start justify-between gap-4 p-8 pb-4">
            <div className="flex-1 min-w-0">
              {category && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 mb-4">
                  <Tag size={10} />{category}
                </span>
              )}
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">{title}</h2>
              {published_at && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-3">
                  <Calendar size={12} />{fmtDate(published_at)}
                </div>
              )}
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="overflow-y-auto p-8 pt-4 flex-1 relative">
            {body ? (
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">{body}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No content available.</p>
            )}
          </div>
          {attachment_url && (
            <div className="p-8 pt-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
              <a href={attachment_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors">
                <Paperclip size={16} />View Attachment
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const AnnouncementsPage = () => {
  const { t }    = useTranslation();
  const { slug } = usePortal();
  const [data,       setData]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected,   setSelected]   = useState(null);

  const LIMIT = 9;

  const load = (pg = 1, cat = category) => {
    setLoading(true);
    fetchAnnouncements({ page: pg, limit: LIMIT, ...(cat ? { category: cat } : {}) })
      .then(r => {
        setData(r.data.data || []);
        setTotalPages(r.data.totalPages || 1);
        setPage(pg);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!slug) return;
    load(1);
    fetchAnnouncementCategories().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, [slug]);

  const handleCategory = (cat) => {
    setCategory(cat);
    load(1, cat);
  };

  const filtered = search
    ? data.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.body?.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <PortalLayout>
      {selected && <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center sm:text-left"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{t('portal.nav.announcements', {defaultValue: 'Announcements'})}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium">{t('portal.announcements.subtitle', {defaultValue: 'Stay up to date with the latest news and notices from the committee.'})}</p>
        </motion.div>

        {/* Search + Filter - Modern SaaS Style */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-center gap-4 mb-10"
        >
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('portal.searchPlaceholder', {defaultValue: 'Search announcements...'})}
              className="w-full pl-12 pr-4 py-3 text-sm font-medium border border-white/40 dark:border-white/10 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-xl text-gray-900 dark:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap w-full md:w-auto">
            <button onClick={() => handleCategory('')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all border ${
                !category 
                  ? 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20 shadow-sm' 
                  : 'bg-white/40 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xl'
              }`}>
              {t('portal.all', {defaultValue: 'All'})}
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => handleCategory(c)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all border ${
                  category === c 
                  ? 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20 shadow-sm' 
                  : 'bg-white/40 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xl'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton count={6} type="announcement" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Megaphone} message={t('portal.announcements.empty', {defaultValue: 'No announcements found.'})} />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((a, i) => (
              <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <AnnouncementCard announcement={a} onClick={() => setSelected(a)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !search && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              className="p-3 rounded-2xl bg-white dark:bg-[#1a1b20] text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {t('portal.page', {defaultValue: 'Page'})} {page} / {totalPages}
            </span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              className="p-3 rounded-2xl bg-white dark:bg-[#1a1b20] text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AnnouncementsPage;
