/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Moon, Plus, X, Edit2, Trash2, Upload,
  Search, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, XCircle, FileText, Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  listDuas, createDua, updateDua, deleteDua, getPdfUrl
} from '../../api/islamicLibraryService';

const CATEGORIES = ['General', 'Morning', 'Evening', 'Protection', 'Travel', 'Food', 'Sleep', 'Prayer', 'Gratitude', 'Other'];

const PdfViewerModal = ({ pdf, onClose }) => {
  useEffect(() => {
    if (!pdf) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [pdf]);

  return createPortal(
    <AnimatePresence>
      {pdf && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex flex-col"
          style={{ zIndex: 9999 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white transition-colors"
          >
            <X size={16} />
          </button>
          <iframe src={pdf.url} title={pdf.title} className="flex-1 w-full border-0 min-h-0" />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const StatusBadge = ({ published }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
    published
      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }`}>
    {published ? <CheckCircle size={11} /> : <XCircle size={11} />}
    {published ? 'Published' : 'Draft'}
  </span>
);

export default function DuaLibrary() {
  const { t } = useTranslation();
  const [data,       setData]       = useState({ duas: [], total: 0, page: 1, pages: 1 });
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [modal,      setModal]      = useState({ open: false, item: null });
  const [activePdf,  setActivePdf]  = useState(null);
  const fileRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', category: 'General', description: '', display_order: 0 }
  });

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await listDuas({ page, limit: 20, search, category: catFilter });
      setData(res);
    } catch { toast.error('Failed to load duas'); }
    finally { setLoading(false); }
  }, [search, catFilter]);

  useEffect(() => { fetch(1); }, [search, catFilter]);

  const openAdd = () => {
    setModal({ open: true, item: null });
    reset({ title: '', category: 'General', description: '', display_order: 0 });
    if (fileRef.current) fileRef.current.value = '';
  };

  const openEdit = (item) => {
    setModal({ open: true, item });
    reset({
      title:         item.title,
      category:      item.category || 'General',
      description:   item.description || '',
      display_order: item.display_order || 0,
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const closeModal = () => setModal({ open: false, item: null });

  const onSubmit = async (values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current?.files[0]) fd.append('pdf_file', fileRef.current.files[0]);

    try {
      if (modal.item) {
        await updateDua(modal.item._id, fd);
        toast.success('Dua updated');
      } else {
        await createDua(fd);
        toast.success('Dua created');
      }
      closeModal();
      fetch(data.page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  const togglePublish = async (item) => {
    const fd = new FormData();
    fd.append('is_published', String(!item.is_published));
    try {
      await updateDua(item._id, fd);
      toast.success(item.is_published ? 'Unpublished' : 'Published');
      fetch(data.page);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Dua?', text: `"${item.title}" will be removed.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    });
    if (!result.isConfirmed) return;
    try {
      await deleteDua(item._id);
      toast.success('Deleted');
      fetch(data.page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="w-full">
      <PdfViewerModal pdf={activePdf} onClose={() => setActivePdf(null)} />
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Moon size={24} className="text-emerald-600" />
            {t('islamicLibrary.dua.title', { defaultValue: 'Dua Library' })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {t('islamicLibrary.dua.desc', { defaultValue: 'Manage Islamic Duas for the public portal' })}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Add Dua
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || catFilter) && (
            <button onClick={() => { setSearch(''); setCatFilter(''); }}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 flex items-center gap-1">
              <X size={16} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="p-4 pt-0">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw size={28} className="text-emerald-500 animate-spin" /></div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">PDF</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.duas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                            <Moon size={28} className="opacity-30" />
                            <span className="text-sm">No duas found</span>
                          </div>
                        </td>
                      </tr>
                    ) : data.duas.map((item) => (
                      <tr key={item._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.title}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium">
                            <Tag size={10} /> {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">{item.display_order}</td>
                        <td className="py-3 px-4 text-center">
                          {item.pdf_file ? (
                            <button
                              onClick={() => setActivePdf({ url: getPdfUrl(item.pdf_file), title: item.title })}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 transition-colors">
                              <FileText size={12} /> View PDF
                            </button>
                          ) : <span className="text-gray-300 text-xs">No PDF</span>}
                        </td>
                        <td className="py-3 px-4 text-center"><StatusBadge published={item.is_published} /></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => togglePublish(item)}
                              className={`p-1.5 rounded-lg transition-colors ${item.is_published ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                              title={item.is_published ? 'Unpublish' : 'Publish'}>
                              {item.is_published ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button onClick={() => openEdit(item)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {data.duas.map((item) => (
                  <div key={item._id} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-medium">
                          <Tag size={10} /> {item.category}
                        </span>
                      </div>
                      <StatusBadge published={item.is_published} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {item.pdf_file && (
                        <button
                          onClick={() => setActivePdf({ url: getPdfUrl(item.pdf_file), title: item.title })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium">
                          <FileText size={12} /> View PDF
                        </button>
                      )}
                      <button onClick={() => togglePublish(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${item.is_published ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {item.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => openEdit(item)}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(item)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">Showing {((data.page - 1) * 20) + 1}–{Math.min(data.page * 20, data.total)} of {data.total}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => fetch(data.page - 1)} disabled={data.page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronLeft size={16} /></button>
                    <span className="text-sm">{data.page} / {data.pages}</span>
                    <button onClick={() => fetch(data.page + 1)} disabled={data.page === data.pages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {modal.item ? 'Edit Dua' : 'Add Dua'}
                </h2>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
                  <input {...register('title', { required: 'Title is required' })}
                    placeholder="e.g. Dua before eating"
                    className={`w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select {...register('category')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea {...register('description')} rows={3} placeholder="Optional description..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Order</label>
                  <input type="number" {...register('display_order')} onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    PDF File {modal.item?.pdf_file ? '(leave empty to keep current)' : ''}
                  </label>
                  {modal.item?.pdf_file && (
                    <a href={getPdfUrl(modal.item.pdf_file)} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2">
                      <FileText size={12} /> View current PDF
                    </a>
                  )}
                  <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-400 transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <input type="file" accept="application/pdf" ref={fileRef}
                      className="flex-1 text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">PDF only · Max 20MB</p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={closeModal}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700">
                    {modal.item ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
