import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, GraduationCap, Droplets, Megaphone, FileX } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import ServiceCard from '../../components/portal/ServiceCard';
import { usePortal } from '../../context/PortalContext';
import LoadingSkeleton from '../../components/portal/LoadingSkeleton';

const qs = () => {
  const slug = localStorage.getItem('portal_tenant') || new URLSearchParams(window.location.search).get('t') || '';
  return slug ? `?t=${slug}` : '';
};

const ServicesPage = () => {
  const { t }               = useTranslation();
  const { tenant, loading } = usePortal();
  const svc = tenant?.services || {};
  const q   = qs();

  const services = [
    { key: 'marriage_certificate', icon: FileText,      title: t('portal.services.marriageCert'),  desc: t('portal.services.marriageCertDesc'),  to: `/portal/services/marriage-certificate${q}`, color: 'blue' },
    { key: 'death_certificate',    icon: FileX,         title: t('portal.services.deathCert'),     desc: t('portal.services.deathCertDesc'),      to: `/portal/services/death-certificate${q}`,    color: 'purple' },
    { key: 'results',              icon: GraduationCap, title: t('portal.services.results'),       desc: t('portal.services.resultsDesc'),         to: `/portal/services/results${q}`,              color: 'purple' },
    { key: 'blood_donor',          icon: Droplets,      title: t('portal.services.bloodDonor'),    desc: t('portal.services.bloodDonorDesc'),      to: `/portal/services/blood-donor${q}`,          color: 'red' },
    { key: 'announcements',        icon: Megaphone,     title: t('portal.services.announcements'), desc: t('portal.services.announcementsDesc'),   to: `/portal/announcements${q}`,                 color: 'green' },
  ];

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('portal.nav.services')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('portal.services.subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <LoadingSkeleton count={6} type="card" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map(s => (
              <ServiceCard key={s.key} {...s} disabled={s.disabled || svc[s.key] === false} />
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default ServicesPage;
