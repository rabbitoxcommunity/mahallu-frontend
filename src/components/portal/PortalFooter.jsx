import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

const ContactItem = ({ icon: Icon, children, themeColor, align = 'center' }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex items-${align} gap-3 text-sm text-gray-500 dark:text-gray-400 transition-colors cursor-pointer`}
      style={{ color: hovered ? themeColor : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center shrink-0 transition-all duration-300"
        style={{
          backgroundColor: hovered ? `${themeColor}18` : undefined,
          color: hovered ? themeColor : undefined,
          transform: hovered ? 'scale(1.1)' : undefined,
        }}
      >
        <Icon size={14} />
      </div>
      {children}
    </div>
  );
};

const PortalFooter = () => {
  const { t }      = useTranslation();
  const { tenant } = usePortal();
  const themeColor = tenant?.theme_color || '#2563eb';

  return (
    <footer className="relative z-10 border-t border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: themeColor, boxShadow: `0 4px 12px ${themeColor}40` }}>
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
                  <ContactItem icon={Phone} themeColor={themeColor}>
                    <span>{tenant.contact.phone}</span>
                  </ContactItem>
                )}
                {tenant.contact.email && (
                  <ContactItem icon={Mail} themeColor={themeColor}>
                    <span>{tenant.contact.email}</span>
                  </ContactItem>
                )}
                {tenant.contact.address && (
                  <ContactItem icon={MapPin} themeColor={themeColor} align="start">
                    <span className="whitespace-pre-line leading-relaxed">{tenant.contact.address}</span>
                  </ContactItem>
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
            Powered by{' '}
            <span className="font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}99)` }}>
              Mahallu Connect ERP
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
