import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Scroll, Search, Download, AlertCircle, User, Calendar } from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import { searchDeathCertificates, fetchDeathCertificate } from '../../../api/portalService';
import { motion, AnimatePresence } from 'framer-motion';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const DeathCertificatePage = () => {
  const { t }         = useTranslation();
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState(null);
  const [searching,   setSearching]   = useState(false);
  const [error,       setError]       = useState('');
  const [downloading, setDownloading] = useState('');
  const debounceRef   = useRef(null);

  const doSearch = (val) => {
    clearTimeout(debounceRef.current);
    setQuery(val);
    setError('');
    if (!val.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchDeathCertificates(val.trim());
        setResults(res.data.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleDownload = async (certNo, deathId) => {
    const id = certNo || deathId;
    setDownloading(id);
    setError('');
    try {
      const res = await fetchDeathCertificate(id);
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to download certificate ${id}.`);
    } finally {
      setDownloading('');
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-24 relative">
        {/* Background decorative blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative z-10"
        >
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <Scroll size={36} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            {t('portal.services.deathCert', {defaultValue: 'Death Certificate'})}
          </h1>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">
            {t('portal.deathCert.subtitle', {defaultValue: 'Enter a certificate number, name, or registration number to find and download.'})}
          </p>
        </motion.div>

        {/* Search box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 sm:p-10 mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative z-10"
        >
          <label className="block text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-widest mb-6 text-center">
            {t('portal.search', {defaultValue: 'Search Records'})}
          </label>
          <div className="relative">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => doSearch(e.target.value)}
              placeholder="e.g. 003, Ahmed, CERT-003, DTH-003"
              autoFocus
              className="w-full pl-14 pr-12 py-4 text-base font-bold border border-white/40 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner placeholder-gray-500"
            />
            {searching && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-2xl px-6 py-4 mb-6">
                <AlertCircle size={18} />{error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              {results.length === 0 ? (
                <div className="text-center py-12 text-base font-medium text-gray-400 bg-white/50 dark:bg-[#1a1b20]/50 rounded-[2rem] border border-gray-200/50 dark:border-gray-800/50">
                  No certificates found for &quot;<span className="text-gray-900 dark:text-white">{query}</span>&quot;.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Results Found</h3>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {results.map((m, i) => (
                    <motion.div 
                      key={m._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/40 dark:border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/60 dark:hover:bg-[#111]/60 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        {/* Cert / ID badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {m.certificate_no && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                              CERT: {m.certificate_no}
                            </span>
                          )}
                          {m.death_id && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                              ID: {m.death_id}
                            </span>
                          )}
                          {m.date_of_death && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 px-2 py-1">
                              <Calendar size={12} />{fmtDate(m.date_of_death)}
                            </span>
                          )}
                        </div>

                        {/* Names */}
                        <div className="flex items-center gap-3 text-base text-gray-900 dark:text-white font-extrabold truncate">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-500" />
                          </div>
                          <span className="truncate">{m.deceased_name || '—'}</span>
                        </div>
                      </div>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(m.certificate_no, m.death_id)}
                        disabled={downloading === (m.certificate_no || m.death_id)}
                        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 group-hover:scale-105"
                      >
                        {downloading === (m.certificate_no || m.death_id)
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Download size={16} />}
                        Download
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PortalLayout>
  );
};

export default DeathCertificatePage;
