import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, X, Clock, Home, Building2, BookUser } from 'lucide-react';

const ic = (err) =>
  `w-full px-3 py-2 bg-gray-50 dark:bg-[#252731] border ${err ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`;

const lc = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide';

const SectionHeader = ({ title, color = 'blue' }) => (
  <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800`}>
    <div className={`w-1 h-4 rounded-full ${color === 'pink' ? 'bg-pink-500' : color === 'green' ? 'bg-green-500' : color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'}`} />
    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const F = ({ label, err, icon: Icon, children }) => (
  <div>
    <label className={lc}>{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />}
      {React.cloneElement(children, {
        className: `${ic(err)}${Icon ? ' pl-8' : ''}${children.type === 'textarea' ? ' resize-none' : ''}`
      })}
    </div>
    {err && <p className="mt-0.5 text-xs text-red-500">{err}</p>}
  </div>
);

const MarriageForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: initialValues });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">

      {/* Modal title */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{t('certificate.addMarriage')}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Row 1: Nikkah Details ── */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
          <SectionHeader title={t('certificate.sectionNikkah')} color="blue" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <F label={`${t('certificate.marriageDate')} *`} err={errors.date?.message} icon={Calendar}>
              <input type="date" {...register('date', { required: t('certificate.dateRequired') })} />
            </F>
            <F label={t('certificate.nikkahTime')} icon={Clock}>
              <input type="time" {...register('nikkah_time')} />
            </F>
            <F label={`${t('certificate.place')} *`} err={errors.place?.message} icon={MapPin}>
              <input type="text" {...register('place', { required: t('certificate.placeRequired') })} placeholder={t('certificate.place')} />
            </F>
          </div>
        </div>

        {/* ── Row 2: Groom | Bride side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Groom */}
          <div className="bg-gray-50/80 dark:bg-[#252731]/60 rounded-xl p-4">
            <SectionHeader title={t('certificate.sectionGroom')} color="blue" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t('certificate.groomName')} *`} err={errors.groom_name?.message} icon={User}>
                  <input type="text" {...register('groom_name', { required: t('certificate.groomNameRequired') })} placeholder={t('certificate.groomName')} />
                </F>
                <F label={`${t('certificate.groomFather')} *`} err={errors.groom_father?.message} icon={User}>
                  <input type="text" {...register('groom_father', { required: t('certificate.groomFatherRequired') })} placeholder={t('certificate.groomFather')} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('certificate.groomDob')} icon={Calendar}>
                  <input type="date" {...register('groom_dob')} />
                </F>
                <F label={t('certificate.groomHouseName')} icon={Home}>
                  <input type="text" {...register('groom_house_name')} placeholder={t('certificate.groomHouseName')} />
                </F>
              </div>
              <F label={t('certificate.groomMahallu')} icon={Building2}>
                <input type="text" {...register('groom_mahallu')} placeholder={t('certificate.groomMahallu')} />
              </F>
              <F label={t('certificate.groomAddress')}>
                <textarea {...register('groom_address')} rows={2} placeholder={t('certificate.groomAddress')} />
              </F>
            </div>
          </div>

          {/* Bride */}
          <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4">
            <SectionHeader title={t('certificate.sectionBride')} color="pink" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t('certificate.brideName')} *`} err={errors.bride_name?.message} icon={User}>
                  <input type="text" {...register('bride_name', { required: t('certificate.brideNameRequired') })} placeholder={t('certificate.brideName')} />
                </F>
                <F label={`${t('certificate.brideFather')} *`} err={errors.bride_father?.message} icon={User}>
                  <input type="text" {...register('bride_father', { required: t('certificate.brideFatherRequired') })} placeholder={t('certificate.brideFather')} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('certificate.brideDob')} err={errors.bride_dob?.message} icon={Calendar}>
                  <input type="date" {...register('bride_dob', {
                    validate: (val) => {
                      if (!val) return true;
                      const age = Math.floor((new Date() - new Date(val)) / (365.25 * 24 * 60 * 60 * 1000));
                      return age >= 18 || t('certificate.brideAgeError');
                    }
                  })} />
                </F>
                <F label={t('certificate.brideHouseName')} icon={Home}>
                  <input type="text" {...register('bride_house_name')} placeholder={t('certificate.brideHouseName')} />
                </F>
              </div>
              <F label={t('certificate.brideMahallu')} icon={Building2}>
                <input type="text" {...register('bride_mahallu')} placeholder={t('certificate.brideMahallu')} />
              </F>
              <F label={t('certificate.brideAddress')}>
                <textarea {...register('bride_address')} rows={2} placeholder={t('certificate.brideAddress')} />
              </F>
            </div>
          </div>
        </div>

        {/* ── Row 3: Nikkah Place & Performer ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
            <SectionHeader title={t('certificate.sectionPlace')} color="green" />
            <F label={t('certificate.nikkahMahallu')} icon={Building2}>
              <input type="text" {...register('nikkah_mahallu')} placeholder={t('certificate.nikkahMahallu')} />
            </F>
          </div>
          <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4">
            <SectionHeader title={t('certificate.sectionPerformer')} color="purple" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <F label={t('certificate.performerName')} icon={BookUser}>
                <input type="text" {...register('performer_name')} placeholder={t('certificate.performerName')} />
              </F>
              <F label={t('certificate.performerDesignation')} icon={BookUser}>
                <input type="text" {...register('performer_designation')} placeholder={t('certificate.performerDesignation')} />
              </F>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={isSubmitting}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
            {isSubmitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</>
              : t('common.save')}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2 font-medium text-sm">
              <X size={15} />{t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MarriageForm;
