import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { usePortal } from '../../context/PortalContext';

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const { t }               = useTranslation();
  const { tenant, loading } = usePortal();

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('portal.nav.about')}</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Building2 size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tenant?.name}</h2>
                <p className="text-xs text-gray-400">{t('portal.mahallu')}</p>
              </div>
            </div>

            {/* Description */}
            {tenant?.about_description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                {tenant.about_description}
              </p>
            )}

            {/* Contact info */}
            <div className="space-y-4">
              <InfoRow icon={Phone}  label={t('portal.contact.phone')}   value={tenant?.contact?.phone} />
              <InfoRow icon={Mail}   label={t('portal.contact.email')}   value={tenant?.contact?.email} />
              <InfoRow icon={MapPin} label={t('portal.contact.address')} value={tenant?.contact?.address} />
              <InfoRow icon={Clock}  label={t('portal.workingHours')}    value={tenant?.contact?.working_hours} />
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AboutPage;
