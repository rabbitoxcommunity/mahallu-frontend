import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const PortalFooter = () => {
  const { t }      = useTranslation();
  const { tenant } = usePortal();

  return (
    <footer className="relative z-10 border-t border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          
          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Building2 size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                {tenant?.name || t('portal.mahallu')}
              </span>
            </div>
            {tenant?.about_description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {tenant.about_description}
              </p>
            )}
          </div>

          {/* Contact */}
          {tenant?.contact && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                {t('portal.contact.title')}
              </h4>
              <div className="space-y-3">
                {tenant.contact.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0">
                      <Phone size={14} />
                    </div>
                    <span>{tenant.contact.phone}</span>
                  </div>
                )}
                {tenant.contact.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0">
                      <Mail size={14} />
                    </div>
                    <span>{tenant.contact.email}</span>
                  </div>
                )}
                {tenant.contact.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={14} />
                    </div>
                    <span className="whitespace-pre-line leading-relaxed">{tenant.contact.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working hours */}
          {tenant?.contact?.working_hours && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                {t('portal.workingHours')}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {tenant.contact.working_hours}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800/50 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} {tenant?.name}. All rights reserved.
          </p>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Powered by <span className="font-bold text-gray-900 dark:text-white">Mahallu ERP</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
