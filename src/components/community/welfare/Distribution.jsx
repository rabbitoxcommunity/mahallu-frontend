import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, RefreshCw, X, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getWelfareDistributions,
  createWelfareDistribution,
  updateWelfareDistribution,
  deleteWelfareDistribution,
  getWelfarePrograms
} from '../../../api/welfareService';
import DistributionFormModal from './DistributionFormModal';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const LIMIT = 20;

const TYPE_COLORS = {
  'Cash': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Food Kit': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Medicine': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Education': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Marriage': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'House Repair': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Emergency Relief': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
};

const Distribution = ({ preselectedFamily, onClearPreselected }) => {
  const { t } = useTranslation();
  const [distributions, setDistributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [programs, setPrograms] = useState([]);

  const [modal, setModal] = useState({ open: false, data: null });
  const debounceRef = useRef(null);

  const DIST_TYPES = ['Cash', 'Food Kit', 'Medicine', 'Education', 'Marriage', 'House Repair', 'Emergency Relief', 'Other'];
  const FUNDING_SOURCES = ['Zakat', 'Sadaqah', 'Donation', 'General Fund', 'Other'];

  useEffect(() => {
    getWelfarePrograms({ limit: 100 }).then(d => setPrograms(d.programs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedFamily) {
      setModal({ open: true, data: null });
    }
  }, [preselectedFamily]);

  const fetchData = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params = { page: p, limit: LIMIT };
      if (searchTerm) params.search = searchTerm;
      if (programFilter) params.program_id = programFilter;
      if (typeFilter) params.distribution_type = typeFilter;
      if (sourceFilter) params.funding_source = sourceFilter;
      const data = await getWelfareDistributions(params);
      setDistributions(data.distributions || []);
      setTotal(data.total || 0);
      setTotalAmount(data.total_amount || 0);
      setPages(data.pages || 1);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, programFilter, typeFilter, sourceFilter]);

  useEffect(() => { fetchData(page); }, [page, searchTerm, programFilter, typeFilter, sourceFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setSearchTerm(val); }, 400);
  };

  const handleSubmit = async (data) => {
    try {
      if (modal.data) {
        await updateWelfareDistribution(modal.data._id, data);
        toast.success(t('welfare.distribution.updated'));
      } else {
        await createWelfareDistribution(data);
        toast.success(t('welfare.distribution.created'));
      }
      setModal({ open: false, data: null });
      onClearPreselected && onClearPreselected();
      fetchData(1);
      setPage(1);
    } catch (e) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('welfare.distribution.deleteConfirm'),
      text: t('welfare.distribution.deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('welfare.distribution.yesDelete'),
      cancelButtonText: t('common.cancel'),
      customClass: { popup: 'rounded-3xl' }
    });
    if (result.isConfirmed) {
      try {
        await deleteWelfareDistribution(id);
        toast.success(t('welfare.distribution.deleted'));
        fetchData(page);
      } catch (e) {}
    }
  };

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} {t('common.total')} •{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">{formatAmount(totalAmount)}</span>
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          {t('welfare.distribution.newDistribution')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t('welfare.distribution.searchPlaceholder')}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('welfare.distribution.allPrograms')}</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.program_name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('welfare.distribution.allTypes')}</option>
            {DIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{t('welfare.distribution.allSources')}</option>
            {FUNDING_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => fetchData(page)} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm disabled:opacity-50">
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
              {['welfare.distribution.distributionNo', 'common.date', 'welfare.distribution.family', 'welfare.distribution.program', 'welfare.distribution.distributionType', 'welfare.distribution.fundingSource', 'common.amount', 'welfare.distribution.addedBy', 'common.actions'].map(key => (
                <th key={key} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider last:text-center">
                  {t(key)}
                </th>
              ))}
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
            ) : distributions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400 dark:text-gray-600">
                  <Plus size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('welfare.distribution.noRecords')}</p>
                </td>
              </tr>
            ) : (
              distributions.map(d => (
                <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{d.distribution_no}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{formatDate(d.distribution_date)}</td>
                  <td className="px-5 py-3.5">
                    {d.is_external ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{d.beneficiary_name}</p>
                        <span className="inline-block text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">External</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{d.family_id?.householder_name}</p>
                        <p className="text-xs text-gray-400">{d.family_id?.house_code}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                    {d.program_id?.program_name}
                    <span className="ml-1 text-xs text-gray-400">({d.program_id?.program_code})</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[d.distribution_type] || TYPE_COLORS['Other']}`}>
                      {d.distribution_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{d.funding_source}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-green-600 dark:text-green-400">{formatAmount(d.amount)}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{d.created_by?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setModal({ open: true, data: d })}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(d._id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg transition-colors">
                        <Trash2 size={14} />
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
        ) : distributions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p className="text-sm">{t('welfare.distribution.noRecords')}</p>
          </div>
        ) : (
          distributions.map(d => (
            <div key={d._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-mono text-xs text-blue-600 dark:text-blue-400">{d.distribution_no}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                    {d.is_external ? d.beneficiary_name : d.family_id?.householder_name}
                    {d.is_external && <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full">External</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.program_id?.program_name}</p>
                </div>
                <p className="text-base font-bold text-green-600 dark:text-green-400 flex-shrink-0">{formatAmount(d.amount)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[d.distribution_type] || TYPE_COLORS['Other']}`}>{d.distribution_type}</span>
                <span className="text-gray-500 dark:text-gray-400">{d.funding_source}</span>
                <span className="text-gray-400">{formatDate(d.distribution_date)}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setModal({ open: true, data: d })}
                  className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Pencil size={12} className="inline mr-1" />Edit
                </button>
                <button onClick={() => handleDelete(d._id)}
                  className="flex-1 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <Trash2 size={12} className="inline mr-1" />Delete
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
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((num, idx) =>
              num === '...'
                ? <span key={idx} className="px-2 text-gray-400 text-sm">…</span>
                : <button key={num} onClick={() => setPage(num)}
                    className={`min-w-8 h-8 rounded-lg text-sm font-medium ${page === num ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {num}
                  </button>
            )}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <DistributionFormModal
        isOpen={modal.open}
        onClose={() => { setModal({ open: false, data: null }); onClearPreselected && onClearPreselected(); }}
        onSubmit={handleSubmit}
        initialData={modal.data}
        preselectedFamily={!modal.data ? preselectedFamily : null}
      />
    </div>
  );
};

export default Distribution;
