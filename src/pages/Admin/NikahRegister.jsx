import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, Download, User, Calendar, MapPin, Home, Building2, BookUser, Hash, Phone, FileText } from 'lucide-react';
import { generateRegister } from '../../api/nikahRegisterService';

const ic = 'w-full px-3 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white';
const lc = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide';

const SectionHeader = ({ title, color = 'blue' }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
    <div className={`w-1 h-4 rounded-full ${color === 'pink' ? 'bg-pink-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />
    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const F = ({ label, icon: Icon, children }) => (
  <div>
    <label className={lc}>{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />}
      {React.cloneElement(children, { className: `${ic}${Icon ? ' pl-8' : ''}${children.type === 'textarea' ? ' resize-none' : ''}` })}
    </div>
  </div>
);

const NikahRegister = () => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm({ defaultValues: { our_party: 'groom' } });
  const [busy, setBusy] = useState(false);

  const run = async (data, mode) => {
    try {
      setBusy(true);
      const blob = await generateRegister(data);
      const url = URL.createObjectURL(blob);
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nikah_Register_${data.register_no || 'form'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(t('nikahRegister.downloaded'));
      } else {
        window.open(url, '_blank');
        toast.success(t('nikahRegister.opening'));
      }
      // Give the browser a moment to consume the blob before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Nikah register generation error:', error);
      toast.error(t('nikahRegister.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nikahRegister.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('nikahRegister.description')}</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit((d) => run(d, 'preview'))}
        className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-5"
      >
        {/* Register meta */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
          <SectionHeader title={t('nikahRegister.sectionRegister')} color="blue" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label={t('nikahRegister.registerNo')} icon={Hash}>
              <input type="text" {...register('register_no')} placeholder={t('nikahRegister.registerNoPlaceholder')} />
            </F>
            <F label={t('nikahRegister.ourParty')} icon={User}>
              <select {...register('our_party')}>
                <option value="groom">{t('nikahRegister.groom')}</option>
                <option value="bride">{t('nikahRegister.bride')}</option>
              </select>
            </F>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">{t('nikahRegister.dateNote')}</p>
        </div>

        {/* Groom | Bride */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50/80 dark:bg-[#252731]/60 rounded-xl p-4">
            <SectionHeader title={t('nikahRegister.sectionGroom')} color="blue" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.name')} icon={User}><input type="text" {...register('groom_name')} /></F>
                <F label={t('nikahRegister.father')} icon={User}><input type="text" {...register('groom_father')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mother')} icon={User}><input type="text" {...register('groom_mother')} /></F>
                <F label={t('nikahRegister.house')} icon={Home}><input type="text" {...register('groom_house')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mahallu')} icon={Building2}><input type="text" {...register('groom_mahallu')} /></F>
                <F label={t('nikahRegister.nikkahCount')} icon={Hash}><input type="text" {...register('groom_nikkah_count')} /></F>
              </div>
              <F label={t('nikahRegister.prevNikkah')} icon={FileText}><input type="text" {...register('groom_prev_nikkah')} /></F>
              <F label={t('nikahRegister.address')}><textarea rows={2} {...register('groom_address')} /></F>
            </div>
          </div>

          <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4">
            <SectionHeader title={t('nikahRegister.sectionBride')} color="pink" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.name')} icon={User}><input type="text" {...register('bride_name')} /></F>
                <F label={t('nikahRegister.father')} icon={User}><input type="text" {...register('bride_father')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mother')} icon={User}><input type="text" {...register('bride_mother')} /></F>
                <F label={t('nikahRegister.house')} icon={Home}><input type="text" {...register('bride_house')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mahallu')} icon={Building2}><input type="text" {...register('bride_mahallu')} /></F>
                <F label={t('nikahRegister.nikkahCount')} icon={Hash}><input type="text" {...register('bride_nikkah_count')} /></F>
              </div>
              <F label={t('nikahRegister.prevNikkah')} icon={FileText}><input type="text" {...register('bride_prev_nikkah')} /></F>
              <F label={t('nikahRegister.address')}><textarea rows={2} {...register('bride_address')} /></F>
            </div>
          </div>
        </div>

        {/* Nikah details */}
        <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
          <SectionHeader title={t('nikahRegister.sectionNikkah')} color="green" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <F label={t('nikahRegister.nikkahDate')} icon={Calendar}><input type="date" {...register('nikah_date')} /></F>
            <F label={t('nikahRegister.nikkahPlace')} icon={MapPin}><input type="text" {...register('nikah_place')} /></F>
            <F label={t('nikahRegister.nikkahPerformer')} icon={BookUser}><input type="text" {...register('nikah_performer')} /></F>
            <F label={t('nikahRegister.mobile')} icon={Phone}><input type="text" {...register('mobile')} /></F>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">{t('nikahRegister.blankNote')}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button type="submit" disabled={busy}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Eye size={16} />}
            {t('nikahRegister.preview')}
          </button>
          <button type="button" disabled={busy} onClick={handleSubmit((d) => run(d, 'download'))}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
            <Download size={16} />{t('nikahRegister.download')}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default NikahRegister;
