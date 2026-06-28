import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { usePortal } from '../../context/PortalContext';

const ContactPage = () => {
  const { t }               = useTranslation();
  const { tenant, loading } = usePortal();
  const c = tenant?.contact || {};

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('portal.nav.contact')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('portal.contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Cards */}
          <div className="space-y-4">
            {[
              { icon: Phone, label: t('portal.contact.phone'),   value: c.phone },
              { icon: Mail,  label: t('portal.contact.email'),   value: c.email },
              { icon: MapPin,label: t('portal.contact.address'), value: c.address },
              { icon: Clock, label: t('portal.workingHours'),    value: c.working_hours },
            ].map(({ icon: Icon, label, value }) => value ? (
              <div key={label} className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{value}</p>
                </div>
              </div>
            ) : null)}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center min-h-[240px] text-center">
            <MapPin size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-xs text-gray-400">{t('portal.contact.mapPlaceholder')}</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ContactPage;
