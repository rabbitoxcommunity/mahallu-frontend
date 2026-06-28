import React, { useState, useRef } from 'react';
import { Scroll, Search, Download, AlertCircle, User, Calendar } from 'lucide-react';
import PortalLayout from '../../../components/portal/PortalLayout';
import { searchDeathCertificates, fetchDeathCertificate } from '../../../api/portalService';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const DeathCertificatePage = () => {
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
      <div className="max-w-2xl mx-auto px-4 py-14">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
            <Scroll size={26} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Death Certificate
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter a certificate number, name, or registration number to find and download.
          </p>
        </div>

        {/* Search box */}
        <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Search
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => doSearch(e.target.value)}
              placeholder="e.g. 003, Ahmed, DCERT-000001, DTH-000001"
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252731] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={14} />{error}
          </div>
        )}

        {/* Results */}
        {results !== null && (
          results.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              No certificates found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 px-1">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
              {results.map(r => (
                <div key={r._id}
                  className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between gap-4">

                  <div className="min-w-0">
                    {/* Cert / death ID badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {r.certificate_no && (
                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                          {r.certificate_no}
                        </span>
                      )}
                      {r.death_id && (
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          {r.death_id}
                        </span>
                      )}
                      {r.date_of_death && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Calendar size={10} />{fmtDate(r.date_of_death)}
                        </span>
                      )}
                    </div>

                    {/* Name + age */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white font-medium">
                      <User size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{r.name || '—'}</span>
                      {r.age != null && (
                        <span className="text-gray-400 font-normal text-xs">· {r.age} yrs</span>
                      )}
                    </div>
                    {r.father_name && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-[18px]">S/D of {r.father_name}</p>
                    )}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={() => handleDownload(r.certificate_no, r.death_id)}
                    disabled={downloading === (r.certificate_no || r.death_id)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    {downloading === (r.certificate_no || r.death_id)
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Download size={13} />}
                    Download
                  </button>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </PortalLayout>
  );
};

export default DeathCertificatePage;
