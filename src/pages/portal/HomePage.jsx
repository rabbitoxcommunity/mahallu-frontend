import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, GraduationCap, Droplets, Megaphone, ArrowRight, ChevronRight, X, Calendar, Tag, Paperclip } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import ServiceCard from '../../components/portal/ServiceCard';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import { usePortal } from '../../context/PortalContext';
import { fetchAnnouncements } from '../../api/portalService';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const AnnouncementModal = ({ announcement, onClose }) => {
  if (!announcement) return null;
  const { title, category, body, published_at, attachment_url } = announcement;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1e1f25] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
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
          <button onClick={onClose} className="flex-shrink-0 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">
          {body ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{body}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No content available.</p>
          )}
        </div>
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

const qs = () => {
  const slug = localStorage.getItem('portal_tenant') || new URLSearchParams(window.location.search).get('t') || '';
  return slug ? `?t=${slug}` : '';
};

const HomePage = () => {
  const { t }      = useTranslation();
  const { tenant, slug, loading } = usePortal();
  const [announcements, setAnnouncements] = useState([]);
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetchAnnouncements({ limit: 3 })
      .then(r => setAnnouncements(r.data.data || []))
      .catch(() => {});
  }, [slug]);

  const svc = tenant?.services || {};
  const q   = qs();

  const services = [
    { key: 'marriage_certificate', icon: FileText,       title: t('portal.services.marriageCert'),  desc: t('portal.services.marriageCertDesc'),  to: `/portal/services/marriage-certificate${q}`, color: 'blue' },
    { key: 'results',              icon: GraduationCap,  title: t('portal.services.results'),        desc: t('portal.services.resultsDesc'),         to: `/portal/services/results${q}`,              color: 'purple' },
    { key: 'blood_donor',          icon: Droplets,       title: t('portal.services.bloodDonor'),     desc: t('portal.services.bloodDonorDesc'),      to: `/portal/services/blood-donor${q}`,          color: 'red' },
    { key: 'announcements',        icon: Megaphone,      title: t('portal.services.announcements'),  desc: t('portal.services.announcementsDesc'),   to: `/portal/announcements${q}`,                 color: 'green' },
  ];

  return (
    <PortalLayout>
      <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-12">
          {loading ? (
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-3" />
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t('portal.hero.welcome')} <span className="text-blue-600 dark:text-blue-400">{tenant?.name}</span>
            </h1>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
            {t('portal.hero.subtitle')}
          </p>
        </div>

        {/* Services */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('portal.nav.services')}</h2>
            <Link to={`/portal/services${q}`} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {t('portal.viewAll')} <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map(s => (
              <ServiceCard key={s.key} {...s} disabled={svc[s.key] === false} />
            ))}
          </div>
        </section>

        {/* Latest Announcements */}
        {announcements.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('portal.latestAnnouncements')}</h2>
              <Link to={`/portal/announcements${q}`} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                {t('portal.viewAll')} <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.map(a => <AnnouncementCard key={a._id} announcement={a} onClick={() => setSelected(a)} />)}
            </div>
          </section>
        )}

        {/* About snippet */}
        {tenant?.about_description && (
          <section className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t('portal.nav.about')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{tenant.about_description}</p>
            <Link to={`/portal/about${q}`}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {t('portal.readMore')} <ArrowRight size={12} />
            </Link>
          </section>
        )}
      </div>
    </PortalLayout>
  );
};

export default HomePage;
