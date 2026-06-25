import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, X, Eye, History, Plus, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { getWelfareBeneficiaries, getWelfarePrograms } from '../../../api/welfareService';
import BeneficiaryProfileModal from './BeneficiaryProfileModal';
import DistributionHistoryModal from './DistributionHistoryModal';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : null;
const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const ECONOMIC_OPTIONS = ['Normal', 'Poor', 'Miskeen'];
const LIMIT = 20;

const Beneficiaries = ({ onNewDistribution }) => {
  const { t } = useTranslation();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [economicStatus, setEconomicStatus] = useState('');
  const [zakatFilter, setZakatFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [programs, setPrograms] = useState([]);

  const [profileModal, setProfileModal] = useState({ open: false, houseId: null });
  const [historyModal, setHistoryModal] = useState({ open: false, houseId: null, houseName: '' });

  const debounceRef = useRef(null);

  useEffect(() => {
    getWelfarePrograms({ limit: 100 })
      .then(d => setPrograms(d.programs || []))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params = { page: p, limit: LIMIT };
      if (searchTerm) params.search = searchTerm;
      if (economicStatus) params.economic_status = economicStatus;
      if (zakatFilter !== '') params.zakat_eligible = zakatFilter;
      if (programFilter) params.program_id = programFilter;
      const data = await getWelfareBeneficiaries(params);
      setBeneficiaries(data.beneficiaries || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, economicStatus, zakatFilter, programFilter]);

  useEffect(() => { fetchData(page); }, [page, searchTerm, economicStatus, zakatFilter, programFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setSearchTerm(val); }, 400);
  };

  const clearSearch = () => { setSearchInput(''); setSearchTerm(''); setPage(1); };

  const economicBadge = (status) => {
    const map = {
      Poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Miskeen: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.Normal}`}>{status}</span>;
  };

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t('welfare.beneficiaries.searchPlaceholder')}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Economic Status */}
          <select
            value={economicStatus}
            onChange={e => { setEconomicStatus(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('welfare.beneficiaries.allStatus')}</option>
            {ECONOMIC_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Zakat Filter */}
          <select
            value={zakatFilter}
            onChange={e => { setZakatFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Families</option>
            <option value="true">Zakat Eligible</option>
            <option value="false">Not Eligible</option>
          </select>

          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={e => { setProgramFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('welfare.beneficiaries.allPrograms')}</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.program_name}</option>)}
          </select>

          <button
            onClick={() => fetchData(page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.houseCode')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.houseName')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.primaryContact')}</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Members</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.economicStatus')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.zakatEligible')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.lastAssistance')}</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.beneficiaries.totalAssistance')}</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : beneficiaries.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400 dark:text-gray-600">
                  <Search size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('welfare.beneficiaries.noRecords')}</p>
                </td>
              </tr>
            ) : (
              beneficiaries.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{b.house_code}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{b.householder_name}</p>
                      {b.family_id?.family_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{b.family_id.family_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{b.primary_contact}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {b.member_count || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{economicBadge(b.economic_status)}</td>
                  <td className="px-5 py-3.5">
                    {b.zakat_eligible
                      ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><ShieldCheck size={13} />{t('common.yes')}</span>
                      : <span className="text-xs text-gray-400">{t('common.no')}</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                    {b.last_assistance ? formatDate(b.last_assistance) : <span className="text-gray-300 dark:text-gray-600 text-xs">{t('welfare.beneficiaries.neverAssisted')}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-semibold ${b.total_assistance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      {formatAmount(b.total_assistance)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setProfileModal({ open: true, houseId: b._id })}
                        title={t('welfare.beneficiaries.viewFamily')}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setHistoryModal({ open: true, houseId: b._id, houseName: b.householder_name })}
                        title={t('welfare.beneficiaries.assistanceHistory')}
                        className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-500 dark:text-orange-400 rounded-lg transition-colors"
                      >
                        <History size={15} />
                      </button>
                      <button
                        onClick={() => onNewDistribution && onNewDistribution(b)}
                        title={t('welfare.beneficiaries.newDistribution')}
                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))
        ) : beneficiaries.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p className="text-sm">{t('welfare.beneficiaries.noRecords')}</p>
          </div>
        ) : (
          beneficiaries.map(b => (
            <div key={b._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{b.householder_name}</p>
                  <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{b.house_code}</p>
                  {b.family_id?.family_name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{b.family_id.family_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatAmount(b.total_assistance)}</p>
                  {b.zakat_eligible && <span className="text-xs text-green-500 flex items-center gap-0.5 justify-end"><ShieldCheck size={11} />Zakat</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {economicBadge(b.economic_status)}
                <span className="text-xs text-gray-500 dark:text-gray-400">{b.primary_contact}</span>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                  {b.member_count || 0} members
                </span>
              </div>
              {b.last_assistance && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Last: {formatDate(b.last_assistance)}
                </p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setProfileModal({ open: true, houseId: b._id })}
                  className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                >
                  <Eye size={12} className="inline mr-1" />{t('welfare.beneficiaries.viewFamily')}
                </button>
                <button
                  onClick={() => setHistoryModal({ open: true, houseId: b._id, houseName: b.householder_name })}
                  className="flex-1 py-1.5 text-xs font-medium text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
                >
                  <History size={12} className="inline mr-1" />History
                </button>
                <button
                  onClick={() => onNewDistribution && onNewDistribution(b)}
                  className="flex-1 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl"
                >
                  <Plus size={12} className="inline mr-1" />Distribute
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.showing')} {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} / {total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((num, idx) =>
              num === '...'
                ? <span key={idx} className="px-2 text-gray-400 text-sm">…</span>
                : <button key={num} onClick={() => setPage(num)}
                    className={`min-w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === num ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {num}
                  </button>
            )}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BeneficiaryProfileModal
        isOpen={profileModal.open}
        houseId={profileModal.houseId}
        onClose={() => setProfileModal({ open: false, houseId: null })}
        onNewDistribution={(house) => { onNewDistribution && onNewDistribution(house); }}
      />
      <DistributionHistoryModal
        isOpen={historyModal.open}
        houseId={historyModal.houseId}
        houseName={historyModal.houseName}
        onClose={() => setHistoryModal({ open: false, houseId: null, houseName: '' })}
      />
    </div>
  );
};

export default Beneficiaries;
