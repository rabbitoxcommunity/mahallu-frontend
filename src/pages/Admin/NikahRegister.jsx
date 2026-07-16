import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, Download, User, Calendar, MapPin, Home, Building2, BookUser, Hash, Phone, FileText, Languages, Loader2 } from 'lucide-react';
import { generateRegister } from '../../api/nikahRegisterService';
import { translateWithSuggestions, isMalayalam } from '../../utils/translateUtil';

const ic = 'w-full px-3 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white';
const lc = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide';

const SectionHeader = ({ title, color = 'blue' }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
    <div className={`w-1 h-4 rounded-full ${color === 'pink' ? 'bg-pink-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />
    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const F = ({ label, icon: Icon, loading, suggestions, onSelectSuggestion, children }) => (
  <div>
    <label className={lc}>{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />}
      {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin pointer-events-none" />}
      {React.cloneElement(children, { className: `${ic}${Icon ? ' pl-8' : ''}${loading ? ' pr-8 animate-pulse' : ''}${children.type === 'textarea' ? ' resize-none' : ''}` })}
    </div>
    {!loading && suggestions?.length > 1 && (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <button key={`${s}-${i}`} type="button" onClick={() => onSelectSuggestion(s)}
            className="px-2 py-0.5 text-[11px] rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            {s}
          </button>
        ))}
      </div>
    )}
  </div>
);

const NikahRegister = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue } = useForm({ defaultValues: { our_party: 'groom' } });
  const [lang, setLang] = useState('en');
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(() => new Set());
  const [suggestions, setSuggestions] = useState({});

  const clearSuggestions = (name) => setSuggestions((prev) => {
    if (!prev[name]) return prev;
    const next = { ...prev }; delete next[name]; return next;
  });

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
      // keep original text on failure
    } finally {
      setTranslating((prev) => { const next = new Set(prev); next.delete(name); return next; });
    }
  };

  // Registers a text field, auto-translating its value to Malayalam on blur when ML is selected.
  const registerT = (name, options) => {
    const field = register(name, options);
    return {
      ...field,
      onChange: (e) => { field.onChange(e); clearSuggestions(name); },
      onBlur: (e) => { field.onBlur(e); handleAutoTranslate(name, e.target.value); },
    };
  };

  const tProps = (name) => ({
    loading: translating.has(name),
    suggestions: suggestions[name],
    onSelectSuggestion: (s) => selectSuggestion(name, s),
  });

  const run = async (data, mode) => {
    try {
      setBusy(true);
      const blob = await generateRegister({ ...data, certificate_language: lang });
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nikahRegister.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('nikahRegister.description')}</p>
        </div>
        <div className="flex items-center gap-2" title="Sets the header language and field auto-translation">
          <Languages size={14} className="text-gray-400" />
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-[#252731]">
            <button type="button" onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
            <button type="button" onClick={() => setLang('ml')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${lang === 'ml' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}>മലയാളം</button>
          </div>
        </div>
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
                <F label={t('nikahRegister.name')} icon={User} {...tProps('groom_name')}><input type="text" {...registerT('groom_name')} /></F>
                <F label={t('nikahRegister.father')} icon={User} {...tProps('groom_father')}><input type="text" {...registerT('groom_father')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mother')} icon={User} {...tProps('groom_mother')}><input type="text" {...registerT('groom_mother')} /></F>
                <F label={t('nikahRegister.house')} icon={Home} {...tProps('groom_house')}><input type="text" {...registerT('groom_house')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mahallu')} icon={Building2} {...tProps('groom_mahallu')}><input type="text" {...registerT('groom_mahallu')} /></F>
                <F label={t('nikahRegister.nikkahCount')} icon={Hash}><input type="text" {...register('groom_nikkah_count')} /></F>
              </div>
              <F label={t('nikahRegister.prevNikkah')} icon={FileText} {...tProps('groom_prev_nikkah')}><input type="text" {...registerT('groom_prev_nikkah')} /></F>
              <F label={t('nikahRegister.address')} {...tProps('groom_address')}><textarea rows={2} {...registerT('groom_address')} /></F>
            </div>
          </div>

          <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4">
            <SectionHeader title={t('nikahRegister.sectionBride')} color="pink" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.name')} icon={User} {...tProps('bride_name')}><input type="text" {...registerT('bride_name')} /></F>
                <F label={t('nikahRegister.father')} icon={User} {...tProps('bride_father')}><input type="text" {...registerT('bride_father')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mother')} icon={User} {...tProps('bride_mother')}><input type="text" {...registerT('bride_mother')} /></F>
                <F label={t('nikahRegister.house')} icon={Home} {...tProps('bride_house')}><input type="text" {...registerT('bride_house')} /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label={t('nikahRegister.mahallu')} icon={Building2} {...tProps('bride_mahallu')}><input type="text" {...registerT('bride_mahallu')} /></F>
                <F label={t('nikahRegister.nikkahCount')} icon={Hash}><input type="text" {...register('bride_nikkah_count')} /></F>
              </div>
              <F label={t('nikahRegister.prevNikkah')} icon={FileText} {...tProps('bride_prev_nikkah')}><input type="text" {...registerT('bride_prev_nikkah')} /></F>
              <F label={t('nikahRegister.address')} {...tProps('bride_address')}><textarea rows={2} {...registerT('bride_address')} /></F>
            </div>
          </div>
        </div>

        {/* Nikah details */}
        <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
          <SectionHeader title={t('nikahRegister.sectionNikkah')} color="green" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <F label={t('nikahRegister.nikkahDate')} icon={Calendar}><input type="date" {...register('nikah_date')} /></F>
            <F label={t('nikahRegister.nikkahPlace')} icon={MapPin} {...tProps('nikah_place')}><input type="text" {...registerT('nikah_place')} /></F>
            <F label={t('nikahRegister.nikkahPerformer')} icon={BookUser} {...tProps('nikah_performer')}><input type="text" {...registerT('nikah_performer')} /></F>
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
