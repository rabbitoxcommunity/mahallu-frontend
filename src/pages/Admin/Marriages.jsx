import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAllMarriages,
  getMarriageById,
  createMarriage,
  updateMarriage,
  generatePDF
} from '../../api/marriageService';
import MarriageForm from '../../components/certificate/MarriageForm';
import MarriageTable from '../../components/certificate/MarriageTable';
import MarriageViewModal from '../../components/certificate/MarriageViewModal';

const Marriages = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [marriages, setMarriages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [editingMarriage, setEditingMarriage] = useState(null);
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    marriage: null
  });

  useEffect(() => {
    fetchMarriages(page, searchTerm);
  }, [page, searchTerm]);

  const fetchMarriages = async (currentPage, currentSearch) => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (currentSearch) params.search = currentSearch;
      const data = await getAllMarriages(params);
      setMarriages(data.marriages);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch marriages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearchTerm(value);
    }, 400);
  };

  const clearSearch = () => {
    setInputValue('');
    setSearchTerm('');
    setPage(1);
    clearTimeout(debounceRef.current);
  };

  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  const handleCreate = async (data) => {
    try {
      await createMarriage(data);
      toast.success(t('certificate.marriageCreated'));
      setShowForm(false);
      fetchMarriages();
    } catch (error) {
      toast.error('Failed to create marriage');
      console.error(error);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateMarriage(id, data);
      toast.success(t('certificate.marriageUpdated'));
      setEditingMarriage(null);
      fetchMarriages();
    } catch (error) {
      toast.error('Failed to update marriage');
      console.error(error);
    }
  };

  const handleView = async (id) => {
    try {
      const marriage = await getMarriageById(id);
      setViewModal({ isOpen: true, marriage });
    } catch (error) {
      toast.error('Failed to fetch marriage details');
      console.error(error);
    }
  };

  const handleEdit = async (id) => {
    try {
      const marriage = await getMarriageById(id);
      setEditingMarriage(marriage);
      setShowForm(true);
    } catch (error) {
      toast.error('Failed to fetch marriage details');
      console.error(error);
    }
  };

  const handleDownload = async (id) => {
    try {
      console.log('Download clicked for ID:', id);
      const marriage = await getMarriageById(id);
      console.log('Marriage fetched:', marriage);
      
      if (!marriage.pdf_url) {
        console.log('No PDF URL, generating...');
        toast.info('Generating PDF...');
        const response = await generatePDF(id);
        console.log('PDF generation response:', response);
        if (response.pdf_url) {
          marriage.pdf_url = response.pdf_url;
        } else {
          toast.error('PDF generation failed');
          return;
        }
      }
      
      // Open the PDF
      const pdfUrl = `http://localhost:5005${marriage.pdf_url}`;
      console.log('Opening PDF URL:', pdfUrl);
      window.open(pdfUrl, '_blank');
      toast.success('Opening PDF...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const handlePrint = async (id) => {
    try {
      const marriage = await getMarriageById(id);
      
      if (!marriage.pdf_url) {
        toast.info('Generating PDF for printing...');
        const response = await generatePDF(id);
        if (response.pdf_url) {
          marriage.pdf_url = response.pdf_url;
        } else {
          toast.error('PDF generation failed');
          return;
        }
      }
      
      // Open PDF in new window and trigger print
      const pdfUrl = `http://localhost:5005${marriage.pdf_url}`;
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('Opening print dialog...');
      } else {
        toast.error('Failed to open print window. Please check popup blocker.');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print. Please try again.');
    }
  };

  const handleFormSubmit = (data) => {
    if (editingMarriage) {
      handleUpdate(editingMarriage._id, data);
    } else {
      handleCreate(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMarriage(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('certificate.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('certificate.description')}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingMarriage(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} />
            {t('certificate.addMarriage')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={inputValue}
              onChange={handleSearchInput}
              placeholder="Search by Marriage ID, Groom Name, Bride Name or Mobile..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {inputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => fetchMarriages(page, searchTerm)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
        </div>
        {searchTerm && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for "${searchTerm}"`}
          </p>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleFormCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <MarriageForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialValues={editingMarriage}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <MarriageTable
        marriages={marriages}
        onView={handleView}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-4 py-3 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((num, idx) =>
              num === '...'
                ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                )
                : (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`min-w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                )
            )}

            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewModal.isOpen && (
          <MarriageViewModal
            marriage={viewModal.marriage}
            onClose={() => setViewModal({ isOpen: false, marriage: null })}
            onDownload={handleDownload}
            onPrint={handlePrint}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marriages;
