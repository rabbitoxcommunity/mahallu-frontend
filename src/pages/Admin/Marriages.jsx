import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  RefreshCw
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

  const [showForm, setShowForm] = useState(false);
  const [editingMarriage, setEditingMarriage] = useState(null);
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    marriage: null
  });

  useEffect(() => {
    fetchMarriages();
  }, [page, searchTerm]);

  const fetchMarriages = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;

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
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('certificate.marriageId')} / ${t('certificate.groomName')} / ${t('certificate.brideName')} / ${t('certificate.mobile')}`}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          <button
            onClick={fetchMarriages}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </button>
        </div>
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
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
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
      {pages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            {t('common.showing')} {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
            >
              {t('common.next')}
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
