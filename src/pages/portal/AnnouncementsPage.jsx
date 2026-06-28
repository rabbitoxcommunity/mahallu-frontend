import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Megaphone, ChevronLeft, ChevronRight, X, Calendar, Tag, Paperclip } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import EmptyState from '../../components/portal/EmptyState';
import LoadingSkeleton from '../../components/portal/LoadingSkeleton';
import { fetchAnnouncements, fetchAnnouncementCategories } from '../../api/portalService';
import { usePortal } from '../../context/PortalContext';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const AnnouncementModal = ({ announcement, onClose }) => {
  if (!announcement) return null;
  const { title, category, body, published_at, attachment_url } = announcement;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#1e1f25] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            {category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
                <Tag size={9} />{category}
              </span>
            )}
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{title}</h2>
            {published_at && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Calendar size={11} />{fmtDate(published_at)}
              </div>
            )}
          </div>
          <button onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {body ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{body}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No content available.</p>
          )}
        </div>

        {/* Attachment */}
        {attachment_url && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800">
            <a href={attachment_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <Paperclip size={14} />View Attachment
            </a>
          </div>
        )}
      </div>
    </div>
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
      <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('portal.nav.announcements')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('portal.announcements.subtitle')}</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('portal.searchPlaceholder')}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e1f25] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleCategory('')}
              className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${!category ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1e1f25]'}`}>
              {t('portal.all')}
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => handleCategory(c)}
                className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1e1f25]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton count={6} type="announcement" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Megaphone} message={t('portal.announcements.empty')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => <AnnouncementCard key={a._id} announcement={a} onClick={() => setSelected(a)} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !search && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-500">{t('portal.page')} {page} / {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AnnouncementsPage;
