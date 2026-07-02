import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Save, FileText, GraduationCap, Droplets, Megaphone, FileX, Info, Phone, Mail, MapPin, Clock, Copy, Check, ExternalLink } from 'lucide-react';
import { fetchPortalSettings, updatePortalSettings } from '../../api/portalService';
import { toast } from 'react-toastify';
import Toggle from '../../components/ui/Toggle';

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
    <div>
      <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
      {desc && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <Toggle checked={!!value} onChange={onChange} />
  </div>
);

const Field = ({ label, value, onChange, type = 'text', placeholder = '', textarea = false }) => (
  <div>
    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Globe size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.portalSettings')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('settings.portalSettingsDesc')}</p>
          </div>
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
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings.portalServices')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <ToggleRow label={t('portal.services.marriageCert')}  desc={t('settings.allowPublicDownload')} value={form.marriage_certificate}  onChange={set('marriage_certificate')} />
            <ToggleRow label={t('portal.services.deathCert')}     desc={t('settings.allowPublicDownload')} value={form.death_certificate}     onChange={set('death_certificate')} />
            <ToggleRow label={t('portal.services.results')}       desc={t('settings.publishPublic')}       value={form.results}               onChange={set('results')} />
            <ToggleRow label={t('portal.services.bloodDonor')}    desc={t('settings.publicSearchEnabled')} value={form.blood_donor}           onChange={set('blood_donor')} />
            <ToggleRow label={t('portal.services.announcements')} desc={t('settings.showOnPortal')}        value={form.announcements}         onChange={set('announcements')} />
            <ToggleRow label={t('portal.nav.about')}              desc=""                                  value={form.about_page}            onChange={set('about_page')} />
            <ToggleRow label={t('portal.nav.contact')}            desc=""                                  value={form.contact_page}          onChange={set('contact_page')} />
            <ToggleRow label={t('settings.bloodDonorShowContact')} desc={t('settings.bloodDonorShowContactDesc')} value={form.blood_donor_show_contact} onChange={set('blood_donor_show_contact')} />
            <ToggleRow label={t('portal.services.islamicServices', {defaultValue: 'Islamic Services'})} desc={t('settings.showOnPortal')} value={form.islamic_services} onChange={set('islamic_services')} />
          </div>
        </div>

        {/* Islamic Services — Prayer Location */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('settings.prayerLocation', {defaultValue: 'Prayer Times Location'})}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.prayerLocationDesc', {defaultValue: 'Used to calculate accurate prayer times on the portal.'})}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('settings.prayerCity', {defaultValue: 'City Name'})} value={form.prayer_city || ''} onChange={set('prayer_city')} placeholder="e.g. Calicut" />
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.prayerMethod', {defaultValue: 'Calculation Method'})}</label>
              <select value={form.prayer_method || 'MWL'} onChange={e => set('prayer_method')(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="MWL">MWL – Muslim World League</option>
                <option value="ISNA">ISNA – North America</option>
                <option value="Egypt">Egyptian General Authority</option>
                <option value="MF">Moonsighting.com (MF)</option>
              </select>
            </div>
            <Field label={t('settings.prayerLatitude', {defaultValue: 'Latitude'})} value={form.prayer_latitude ?? ''} onChange={set('prayer_latitude')} placeholder="e.g. 11.2588" />
            <Field label={t('settings.prayerLongitude', {defaultValue: 'Longitude'})} value={form.prayer_longitude ?? ''} onChange={set('prayer_longitude')} placeholder="e.g. 75.7804" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Tip: Find coordinates at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">latlong.net</a></p>
        </div>

        {/* About / Contact Info */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings.portalContactInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('portal.contact.phone')}   value={form.contact_phone}    onChange={set('contact_phone')}    placeholder="+91 9876543210" />
            <Field label={t('portal.contact.email')}   value={form.contact_email}    onChange={set('contact_email')}    placeholder="mahallu@example.com" />
            <div className="md:col-span-2">
              <Field label={t('portal.contact.address')} value={form.contact_address} onChange={set('contact_address')} textarea placeholder="Full address..." />
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.themeColor')}</label>
              <label className="flex items-center gap-3 cursor-pointer w-fit px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <span className="w-7 h-7 rounded-lg border border-white/30 shadow-sm shrink-0" style={{ backgroundColor: form.theme_color || '#2563eb' }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">{form.theme_color || '#2563eb'}</span>
                <input type="color" value={form.theme_color || '#2563eb'} onChange={e => set('theme_color')(e.target.value)} className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicPortalSettings;
