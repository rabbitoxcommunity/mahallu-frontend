import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileText, GraduationCap, Droplets, Megaphone, ArrowRight, ChevronRight } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import ServiceCard from '../../components/portal/ServiceCard';
import AnnouncementCard from '../../components/portal/AnnouncementCard';
import { usePortal } from '../../context/PortalContext';
import { fetchAnnouncements } from '../../api/portalService';

const qs = () => {
  const slug = localStorage.getItem('portal_tenant') || new URLSearchParams(window.location.search).get('t') || '';
  return slug ? `?t=${slug}` : '';
};

const HomePage = () => {
  const { t }      = useTranslation();
  const { tenant, slug, loading } = usePortal();
  const [announcements, setAnnouncements] = useState([]);

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
              {announcements.map(a => <AnnouncementCard key={a._id} announcement={a} />)}
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
