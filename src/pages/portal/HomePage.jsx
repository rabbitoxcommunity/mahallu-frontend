import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, GraduationCap, Droplets, Megaphone, ArrowRight, ChevronRight, X, Calendar, Tag, Paperclip, Sparkles } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import ServiceCard from '../../components/portal/ServiceCard';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import { usePortal } from '../../context/PortalContext';
import { fetchAnnouncements } from '../../api/portalService';
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
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
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
    { key: 'marriage_certificate', icon: FileText,       title: t('portal.services.marriageCert', {defaultValue: 'Marriage Certificate'}),  desc: t('portal.services.marriageCertDesc', {defaultValue: 'Apply for marriage certificate online'}),  to: `/portal/services/marriage-certificate${q}`, color: 'blue' },
    { key: 'results',              icon: GraduationCap,  title: t('portal.services.results', {defaultValue: 'Madrasa Results'}),        desc: t('portal.services.resultsDesc', {defaultValue: 'Check student exam results'}),         to: `/portal/services/results${q}`,              color: 'purple' },
    { key: 'blood_donor',          icon: Droplets,       title: t('portal.services.bloodDonor', {defaultValue: 'Blood Donor'}),     desc: t('portal.services.bloodDonorDesc', {defaultValue: 'Find or register as a blood donor'}),      to: `/portal/services/blood-donor${q}`,          color: 'red' },
    { key: 'announcements',        icon: Megaphone,      title: t('portal.services.announcements', {defaultValue: 'Announcements'}),  desc: t('portal.services.announcementsDesc', {defaultValue: 'Latest news and updates'}),   to: `/portal/announcements${q}`,                 color: 'green' },
  ];

  return (
    <PortalLayout>
      {selected && <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />}
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl text-sm font-extrabold text-gray-800 dark:text-gray-200 mb-8 tracking-tight"
          >
            <Sparkles size={16} className="text-blue-500" />
            Welcome to the new Portal
          </motion.div>

          {loading ? (
            <div className="h-10 w-3/4 max-w-lg bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mx-auto mb-4" />
          ) : (
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tighter leading-[1.1]"
            >
              {t('portal.hero.welcome', {defaultValue: 'Welcome to'})} <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 drop-shadow-sm">
                {tenant?.name}
              </span>
            </motion.h1>
          )}

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t('portal.hero.subtitle', {defaultValue: 'Access community services, apply for certificates, and stay updated with the latest announcements.'})}
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        
        {/* SERVICES GRID */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{t('portal.nav.services', {defaultValue: 'Services'})}</h2>
              <p className="text-base font-medium text-gray-500 dark:text-gray-400">Quick access to essential portal features.</p>
            </div>
            <Link to={`/portal/services${q}`} className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
              {t('portal.viewAll', {defaultValue: 'View all'})} 
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div 
                key={s.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <ServiceCard {...s} disabled={svc[s.key] === false} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* LATEST ANNOUNCEMENTS */}
        {announcements.length > 0 && (
          <section className="mb-24">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{t('portal.latestAnnouncements', {defaultValue: 'Latest Announcements'})}</h2>
                <p className="text-base font-medium text-gray-500 dark:text-gray-400">Stay informed with updates from the committee.</p>
              </div>
              <Link to={`/portal/announcements${q}`} className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
                {t('portal.viewAll', {defaultValue: 'View all'})} 
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={14} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((a, i) => (
                <motion.div 
                  key={a._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <AnnouncementCard announcement={a} onClick={() => setSelected(a)} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ABOUT SECTION */}
        {tenant?.about_description && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">{t('portal.nav.about', {defaultValue: 'About Us'})}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                {tenant.about_description}
              </p>
              <Link to={`/portal/about${q}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                {t('portal.readMore', {defaultValue: 'Read our story'})} <ArrowRight size={14} />
              </Link>
            </div>
          </motion.section>
        )}
      </div>
    </PortalLayout>
  );
};

export default HomePage;
