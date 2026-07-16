import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, Download, Hash, Award, Languages, Loader2 } from 'lucide-react';
import { generateCertificate } from '../../api/generalCertificateService';
import { translateWithSuggestions, isMalayalam } from '../../utils/translateUtil';

const ic = (err) =>
  `w-full px-3 py-2 bg-gray-50 dark:bg-[#252731] border ${err ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`;
const lc = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide';

const F = ({ label, err, icon: Icon, loading, suggestions, onSelectSuggestion, children }) => (
  <div>
    <label className={lc}>{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />}
      {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin pointer-events-none" />}
      {React.cloneElement(children, {
        className: `${ic(err)}${Icon ? ' pl-8' : ''}${loading ? ' pr-8 animate-pulse' : ''}${children.type === 'textarea' ? ' resize-none' : ''}`
      })}
    </div>
    {err && <p className="mt-0.5 text-xs text-red-500">{err}</p>}
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

const GeneralCertificate = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
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
      const blob = await generateCertificate({ ...data, certificate_language: lang });
      const url = URL.createObjectURL(blob);
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `General_Certificate_${data.certificate_no || 'form'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(t('generalCert.downloaded'));
      } else {
        window.open(url, '_blank');
        toast.success(t('generalCert.opening'));
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('General certificate generation error:', error);
      toast.error(t('generalCert.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('generalCert.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('generalCert.description')}</p>
        </div>
        <div className="flex items-center gap-2" title="Sets the certificate language and field auto-translation">
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
        className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <F label={t('generalCert.certificateNo')} icon={Hash}>
            <input type="text" {...register('certificate_no')} placeholder={t('generalCert.certificateNoPlaceholder')} />
          </F>
          <div className="sm:col-span-2">
            <F label={`${t('generalCert.certTitle')} *`} err={errors.title?.message} icon={Award} {...tProps('title')}>
              <input type="text" {...registerT('title', { required: t('generalCert.titleRequired') })} placeholder={t('generalCert.certTitlePlaceholder')} />
            </F>
          </div>
        </div>

        <F label={`${t('generalCert.body')} *`} err={errors.body?.message} {...tProps('body')}>
          <textarea {...registerT('body', { required: t('generalCert.bodyRequired') })} rows={8} placeholder={t('generalCert.bodyPlaceholder')} />
        </F>

        <p className="text-[11px] text-gray-400">{t('generalCert.note')}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button type="submit" disabled={busy}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Eye size={16} />}
            {t('generalCert.preview')}
          </button>
          <button type="button" disabled={busy} onClick={handleSubmit((d) => run(d, 'download'))}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm">
            <Download size={16} />{t('generalCert.download')}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default GeneralCertificate;
