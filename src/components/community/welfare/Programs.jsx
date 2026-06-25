import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, RefreshCw, Pencil, Trash2, ChevronLeft, ChevronRight, FolderHeart } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  getWelfarePrograms,
  createWelfareProgram,
  updateWelfareProgram,
  deleteWelfareProgram
} from '../../../api/welfareService';
import ProgramFormModal from './ProgramFormModal';

const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const LIMIT = 20;

const statusBadge = (status, t) => {
  const map = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || map.inactive}`}>
      {t(`welfare.programs.statusOptions.${status}`)}
    </span>
  );
};

const Programs = () => {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });

  const fetchData = useCallback(async (p = page, s = search) => {
    try {
      setLoading(true);
      const data = await getWelfarePrograms({ page: p, limit: LIMIT, search: s || undefined });
      setPrograms(data.programs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(page, search); }, [page, search]);

  const handleSubmit = async (data) => {
    try {
      if (modal.data) {
        await updateWelfareProgram(modal.data._id, data);
        toast.success(t('welfare.programs.updated'));
      } else {
        await createWelfareProgram(data);
        toast.success(t('welfare.programs.created'));
      }
      setModal({ open: false, data: null });
      fetchData(1, search);
      setPage(1);
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('welfare.programs.deleteConfirm'),
      text: t('welfare.programs.deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('welfare.programs.yesDelete'),
      cancelButtonText: t('common.cancel'),
      customClass: { popup: 'rounded-3xl' }
    });
    if (result.isConfirmed) {
      try {
        await deleteWelfareProgram(id);
        toast.success(t('welfare.programs.deleted'));
        fetchData(page, search);
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} programs</p>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          {t('welfare.programs.addProgram')}
        </button>
      </div>

      {/* Search + Refresh */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search programs..."
              className="w-full pl-9 py-2.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <button onClick={() => fetchData(page, search)} disabled={loading}
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.programName')}</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.budget')}</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.distributed')}</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.balance')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.fundingSource')}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('welfare.programs.status')}</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400 dark:text-gray-600">
                  <FolderHeart size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('welfare.programs.noRecords')}</p>
                </td>
              </tr>
            ) : (
              programs.map(prog => {
                const balance = prog.balance || 0;
                return (
                  <tr key={prog._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{prog.program_name}</p>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{prog.program_code}</p>
                        {prog.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{prog.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-700 dark:text-gray-300">{formatAmount(prog.budget)}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-orange-600 dark:text-orange-400">{formatAmount(prog.total_distributed)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-semibold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {formatAmount(balance)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{prog.funding_source}</td>
                    <td className="px-5 py-3.5">{statusBadge(prog.status, t)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setModal({ open: true, data: prog })}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(prog._id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
        ) : programs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p className="text-sm">{t('welfare.programs.noRecords')}</p>
          </div>
        ) : (
          programs.map(prog => (
            <div key={prog._id} className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{prog.program_name}</p>
                  <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{prog.program_code}</p>
                </div>
                {statusBadge(prog.status, t)}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-[#252731] rounded-xl">
                  <p className="text-xs text-gray-400">Budget</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatAmount(prog.budget)}</p>
                </div>
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <p className="text-xs text-orange-500">Distributed</p>
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatAmount(prog.total_distributed)}</p>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-green-500">Balance</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatAmount(prog.balance)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">{prog.funding_source}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setModal({ open: true, data: prog })}
                  className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Pencil size={12} className="inline mr-1" />Edit
                </button>
                <button onClick={() => handleDelete(prog._id)}
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

      <ProgramFormModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        initialData={modal.data}
      />
    </div>
  );
};

export default Programs;
