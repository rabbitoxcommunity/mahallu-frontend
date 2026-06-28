import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const PortalFooter = () => {
  const { t }      = useTranslation();
  const { tenant } = usePortal();

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1b20] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {tenant?.name || t('portal.mahallu')}
              </span>
            </div>
            {tenant?.about_description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {tenant.about_description}
              </p>
            )}
          </div>

          {/* Contact */}
          {tenant?.contact && (
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                {t('portal.contact.title')}
              </h4>
              <div className="space-y-2">
                {tenant.contact.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={12} className="flex-shrink-0" />
                    <span>{tenant.contact.phone}</span>
                  </div>
                )}
                {tenant.contact.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Mail size={12} className="flex-shrink-0" />
                    <span>{tenant.contact.email}</span>
                  </div>
                )}
                {tenant.contact.address && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">{tenant.contact.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working hours */}
          {tenant?.contact?.working_hours && (
            <div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                {t('portal.workingHours')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line">
                {tenant.contact.working_hours}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-6 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {tenant?.name}. {t('portal.poweredBy')} Mahallu ERP.
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
