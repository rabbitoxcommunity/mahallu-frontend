import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { usePortal } from '../../context/PortalContext';
import { motion } from 'framer-motion';

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{value}</p>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const { t }               = useTranslation();
  const { tenant, loading } = usePortal();

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center sm:text-left"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">{t('portal.nav.about', {defaultValue: 'About Us'})}</h1>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 pb-8 border-b border-gray-200/50 dark:border-gray-800/50 relative z-10">
              <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Building2 size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{tenant?.name}</h2>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-widest">{t('portal.mahallu', {defaultValue: 'Mahallu'})}</p>
              </div>
            </div>

            {/* Description */}
            {tenant?.about_description && (
              <div className="mb-10 pb-10 border-b border-gray-200/50 dark:border-gray-800/50 relative z-10">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Our Story</h3>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                  {tenant.about_description}
                </p>
              </div>
            )}

            {/* Contact info Grid */}
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone}  label={t('portal.contact.phone')}   value={tenant?.contact?.phone} />
                <InfoRow icon={Mail}   label={t('portal.contact.email')}   value={tenant?.contact?.email} />
                <InfoRow icon={MapPin} label={t('portal.contact.address')} value={tenant?.contact?.address} />
                <InfoRow icon={Clock}  label={t('portal.workingHours')}    value={tenant?.contact?.working_hours} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
};

export default AboutPage;
