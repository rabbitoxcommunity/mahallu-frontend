import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';
import { usePortal } from '../../context/PortalContext';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const { t }               = useTranslation();
  const { tenant, loading } = usePortal();
  const c = tenant?.contact || {};

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center sm:text-left"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{t('portal.nav.contact', {defaultValue: 'Contact Us'})}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium">{t('portal.contact.subtitle', {defaultValue: 'We are here to help. Reach out to us via any of the channels below.'})}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {[
            { icon: Phone,  label: t('portal.contact.phone',   {defaultValue: 'Phone'}),   value: c.phone },
            { icon: Mail,   label: t('portal.contact.email',   {defaultValue: 'Email'}),   value: c.email },
            { icon: MapPin, label: t('portal.contact.address', {defaultValue: 'Address'}), value: c.address },
          ].map(({ icon: Icon, label, value }, i) => value ? (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.1) }}
              className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-4xl border border-white/40 dark:border-white/10 p-6 flex items-start gap-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/60 dark:hover:bg-[#111]/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-[1.25rem] bg-linear-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner">
                <Icon size={22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-extrabold mb-1.5">{label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 whitespace-pre-line leading-relaxed">{value}</p>
              </div>
            </motion.div>
          ) : null)}
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default ContactPage;
