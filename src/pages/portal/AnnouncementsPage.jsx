import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import EmptyState from '../../components/portal/EmptyState';
import LoadingSkeleton from '../../components/portal/LoadingSkeleton';
import { fetchAnnouncements, fetchAnnouncementCategories } from '../../api/portalService';
import { usePortal } from '../../context/PortalContext';

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
    ? data.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <PortalLayout>
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
            {filtered.map(a => <AnnouncementCard key={a._id} announcement={a} />)}
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
