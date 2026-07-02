import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Phone, FileText, Download, Printer, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchMarriage, generatePDF } from '../../api/marriageService';
import { resolveCertUrl } from '../../utils/certUtil';

const MarriageCertificate = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('mobile');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMarriage, setSelectedMarriage] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search');
      return;
    }

    try {
      setLoading(true);
      const params = {};
      if (searchType === 'mobile') {
        params.mobile = searchValue;
      } else {
        params.certificate_no = searchValue;
      }

      const data = await searchMarriage(params);
      setResults(data);
      
      if (data.length === 0) {
        toast.info(t('certificate.noMarriages'));
      }
    } catch (error) {
      toast.error('Failed to search marriage');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (marriage) => {
    if (marriage.pdf_url) {
      window.open(resolveCertUrl(marriage.pdf_url), '_blank');
    } else {
      toast.info('PDF not available for this certificate');
    }
  };

  const handlePrint = (marriage) => {
    if (marriage.pdf_url) {
      const pdfUrl = resolveCertUrl(marriage.pdf_url);
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('Opening print dialog...');
      } else {
        toast.error('Failed to open print window. Please check popup blocker.');
      }
    } else {
      toast.info('PDF not available for this certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
            <FileText size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('certificate.certificateTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('certificate.search')}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSearchType('mobile')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  searchType === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Phone size={18} className="inline mr-2" />
                {t('certificate.searchByMobile')}
              </button>
              <button
                type="button"
                onClick={() => setSearchType('certificate')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  searchType === 'certificate'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FileText size={18} className="inline mr-2" />
                {t('certificate.searchByCertificate')}
              </button>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === 'mobile'
                      ? t('certificate.enterMobile')
                      : t('certificate.enterCertificate')
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    {t('common.search')}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {results.map((marriage) => (
              <div
                key={marriage._id}
                className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {t('certificate.marriageId')}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {marriage.marriage_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {t('certificate.certificateNo')}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {marriage.certificate_no}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-500">{t('certificate.groomName')}: </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {marriage.groom_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{t('certificate.brideName')}: </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {marriage.bride_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-500">{t('certificate.marriageDate')}: </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(marriage.date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{t('certificate.place')}: </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {marriage.place}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(marriage)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                    >
                      <Download size={18} />
                      {t('certificate.download')}
                    </button>
                    <button
                      onClick={() => handlePrint(marriage)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Printer size={18} />
                      {t('certificate.print')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarriageCertificate;
