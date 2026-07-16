import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, X, Home, Building2, BookUser, Languages, Loader2, Hash } from 'lucide-react';
import { translateWithSuggestions, isMalayalam } from '../../utils/translateUtil';

const ic = (err) =>
  `w-full px-3 py-2 bg-gray-50 dark:bg-[#252731] border ${err ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`;

const lc = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide';

const SectionHeader = ({ title, color = 'blue' }) => (
  <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800`}>
    <div className={`w-1 h-4 rounded-full ${color === 'pink' ? 'bg-pink-500' : color === 'green' ? 'bg-green-500' : color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'}`} />
    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const F = ({ label, err, icon: Icon, loading, suggestions, onSelectSuggestion, children }) => (
  <div>
    <label className={lc}>{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />}
      {loading && (
        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin pointer-events-none" />
      )}
      {React.cloneElement(children, {
        className: `${ic(err)}${Icon ? ' pl-8' : ''}${loading ? ' pr-8 animate-pulse' : ''}${children.type === 'textarea' ? ' resize-none' : ''}`
      })}
    </div>
    {err && <p className="mt-0.5 text-xs text-red-500">{err}</p>}
    {loading && (
      <p className="mt-1 text-[11px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
        Translating…
      </p>
    )}
    {!loading && suggestions?.length > 1 && (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <button
            key={`${s}-${i}`}
            type="button"
            onClick={() => onSelectSuggestion(s)}
            className="px-2 py-0.5 text-[11px] rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    )}
  </div>
);

const MarriageNocForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: initialValues });
  const [lang, setLang] = useState(initialValues?.certificate_language === 'ml' ? 'ml' : 'en');
  const [translating, setTranslating] = useState(() => new Set());
  const [suggestions, setSuggestions] = useState({});

  const submitWithLanguage = (data) => onSubmit({ ...data, certificate_language: lang });

  const clearSuggestions = (name) => {
    setSuggestions((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const selectSuggestion = (name, text) => {
    setValue(name, text, { shouldDirty: true });
    clearSuggestions(name);
  };

  const handleAutoTranslate = async (name, value) => {
    if (lang !== 'ml') return;
    const val = (value || '').trim();
    if (!val || isMalayalam(val)) return;

    setTranslating((prev) => new Set(prev).add(name));
    try {
      const { translated, suggestions: alts } = await translateWithSuggestions(val, 'ml');
      setValue(name, translated, { shouldDirty: true });
      setSuggestions((prev) => ({ ...prev, [name]: alts }));
    } catch {
      // keep the original text if translation fails
    } finally {
      setTranslating((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const registerT = (name, options) => {
    const field = register(name, options);
    return {
      ...field,
      onChange: (e) => {
        field.onChange(e);
        clearSuggestions(name);
      },
      onBlur: (e) => {
        field.onBlur(e);
        handleAutoTranslate(name, e.target.value);
      },
    };
  };

  const tProps = (name) => ({
    loading: translating.has(name),
    suggestions: suggestions[name],
    onSelectSuggestion: (s) => selectSuggestion(name, s),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">

      {/* Modal title + language toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('noc.addNoc')}</h2>
        <div className="flex items-center gap-2" title="Controls both field auto-translation and the generated certificate PDF's language">
          <Languages size={14} className="text-gray-400" />
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-[#252731]">
            <button type="button" onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              EN
            </button>
            <button type="button" onClick={() => setLang('ml')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${lang === 'ml' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              മലയാളം
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(submitWithLanguage)} className="space-y-5">

        {/* ── Row 1: NOC Info. The certificate date is auto-set to today and the NOC body
             text is generated (with the groom/bride names) only when the PDF is produced. ── */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
          <SectionHeader title={t('noc.sectionNoc')} color="blue" />
          <F label={t('noc.toAddress')} icon={MapPin} {...tProps('to_address')}>
            <textarea {...registerT('to_address')} rows={2} placeholder={t('noc.toAddress')} />
          </F>
        </div>

        {/* ── Row 2: Groom | Bride side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Groom */}
          <div className="bg-gray-50/80 dark:bg-[#252731]/60 rounded-xl p-4">
            <SectionHeader title={t('noc.sectionGroom')} color="blue" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t('noc.name')} *`} err={errors.groom_name?.message} icon={User} {...tProps('groom_name')}>
                  <input type="text" {...registerT('groom_name', { required: t('noc.groomNameRequired') })} placeholder={t('noc.name')} />
                </F>
                <F label={t('noc.fatherName')} icon={User} {...tProps('groom_father')}>
                  <input type="text" {...registerT('groom_father')} placeholder={t('noc.fatherName')} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('noc.houseName')} icon={Home} {...tProps('groom_house_name')}>
                  <input type="text" {...registerT('groom_house_name')} placeholder={t('noc.houseName')} />
                </F>
                <F label={t('noc.nikkahCount')} icon={Hash}>
                  <input type="text" {...register('groom_nikkah_count')} placeholder={t('noc.nikkahCount')} />
                </F>
              </div>
              <F label={t('noc.mahallu')} icon={Building2} {...tProps('groom_mahallu')}>
                <input type="text" {...registerT('groom_mahallu')} placeholder={t('noc.mahallu')} />
              </F>
              <F label={t('noc.address')} {...tProps('groom_address')}>
                <textarea {...registerT('groom_address')} rows={2} placeholder={t('noc.address')} />
              </F>
            </div>
          </div>

          {/* Bride */}
          <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4">
            <SectionHeader title={t('noc.sectionBride')} color="pink" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t('noc.name')} *`} err={errors.bride_name?.message} icon={User} {...tProps('bride_name')}>
                  <input type="text" {...registerT('bride_name', { required: t('noc.brideNameRequired') })} placeholder={t('noc.name')} />
                </F>
                <F label={t('noc.fatherName')} icon={User} {...tProps('bride_father')}>
                  <input type="text" {...registerT('bride_father')} placeholder={t('noc.fatherName')} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('noc.houseName')} icon={Home} {...tProps('bride_house_name')}>
                  <input type="text" {...registerT('bride_house_name')} placeholder={t('noc.houseName')} />
                </F>
                <F label={t('noc.nikkahCount')} icon={Hash}>
                  <input type="text" {...register('bride_nikkah_count')} placeholder={t('noc.nikkahCount')} />
                </F>
              </div>
              <F label={t('noc.mahallu')} icon={Building2} {...tProps('bride_mahallu')}>
                <input type="text" {...registerT('bride_mahallu')} placeholder={t('noc.mahallu')} />
              </F>
              <F label={t('noc.address')} {...tProps('bride_address')}>
                <textarea {...registerT('bride_address')} rows={2} placeholder={t('noc.address')} />
              </F>
            </div>
          </div>
        </div>

        {/* ── Row 3: Nikkah Details ── */}
        <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
          <SectionHeader title={t('noc.sectionNikkah')} color="green" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <F label={t('noc.nikkahDate')} icon={Calendar}>
              <input type="date" {...register('nikkah_date')} />
            </F>
            <F label={t('noc.nikkahPlace')} icon={MapPin} {...tProps('nikkah_place')}>
              <input type="text" {...registerT('nikkah_place')} placeholder={t('noc.nikkahPlace')} />
            </F>
            <F label={t('noc.nikkahPerformer')} icon={BookUser} {...tProps('nikkah_performer')}>
              <input type="text" {...registerT('nikkah_performer')} placeholder={t('noc.nikkahPerformer')} />
            </F>
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

export default MarriageNocForm;
