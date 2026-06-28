import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Save, FileText, GraduationCap, Droplets, Megaphone, FileX, Info, Phone, Mail, MapPin, Clock, Copy, Check, ExternalLink } from 'lucide-react';
import { fetchPortalSettings, updatePortalSettings } from '../../api/portalService';
import { toast } from 'react-toastify';

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', placeholder = '', textarea = false }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252731] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252731] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
    )}
  </div>
);

const PublicPortalSettings = () => {
  const { t } = useTranslation();
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetchPortalSettings()
      .then(r => setForm(r.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePortalSettings(form);
      toast.success('Portal settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const portalUrl = form?.slug ? `${window.location.origin}/portal?t=${form.slug}` : '';

  const handleCopy = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (!form) return null;

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Globe size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings.portalSettings')}</h1>
          <p className="text-xs text-gray-500">{t('settings.portalSettingsDesc')}</p>
        </div>
      </div>

      {/* Portal URL Info */}
      {portalUrl && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">{t('settings.portalUrlLabel')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-xl break-all">{portalUrl}</code>
            <button onClick={handleCopy} title="Copy URL"
              className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors flex-shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer" title="Open portal"
              className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-colors flex-shrink-0">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Services */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{t('settings.portalServices')}</h2>
          <Toggle label={t('portal.services.marriageCert')}  desc={t('settings.allowPublicDownload')} value={form.marriage_certificate}  onChange={set('marriage_certificate')} />
          <Toggle label={t('portal.services.deathCert')}     desc={t('settings.allowPublicDownload')} value={form.death_certificate}     onChange={set('death_certificate')} />
          <Toggle label={t('portal.services.results')}       desc={t('settings.publishPublic')}       value={form.results}               onChange={set('results')} />
          <Toggle label={t('portal.services.bloodDonor')}    desc={t('settings.publicSearchEnabled')} value={form.blood_donor}           onChange={set('blood_donor')} />
          <Toggle label={t('portal.services.announcements')} desc={t('settings.showOnPortal')}        value={form.announcements}         onChange={set('announcements')} />
          <Toggle label={t('portal.nav.about')}              desc=""                                  value={form.about_page}            onChange={set('about_page')} />
          <Toggle label={t('portal.nav.contact')}            desc=""                                  value={form.contact_page}          onChange={set('contact_page')} />
          <Toggle label={t('settings.bloodDonorShowContact')} desc={t('settings.bloodDonorShowContactDesc')} value={form.blood_donor_show_contact} onChange={set('blood_donor_show_contact')} />
        </div>

        {/* About / Contact Info */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{t('settings.portalContactInfo')}</h2>
          <div className="space-y-4">
            <Field label={t('portal.contact.phone')}   value={form.contact_phone}    onChange={set('contact_phone')}    placeholder="+91 9876543210" />
            <Field label={t('portal.contact.email')}   value={form.contact_email}    onChange={set('contact_email')}    placeholder="mahallu@example.com" />
            <Field label={t('portal.contact.address')} value={form.contact_address}  onChange={set('contact_address')}  textarea placeholder="Full address..." />
            <Field label={t('portal.workingHours')}    value={form.working_hours}    onChange={set('working_hours')}    textarea placeholder="Saturday - Thursday: 9am - 5pm" />
            <Field label={t('settings.aboutDescription')} value={form.about_description} onChange={set('about_description')} textarea placeholder="Brief description about the Mahallu..." />
            <Field label={t('settings.themeColor')}   value={form.theme_color}      onChange={set('theme_color')}      type="color" />
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default PublicPortalSettings;
