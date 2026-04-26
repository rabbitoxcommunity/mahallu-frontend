import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, MapPin, FileText, Download, Printer } from 'lucide-react';

const MarriageViewModal = ({ marriage, onClose, onDownload, onPrint }) => {
  const { t } = useTranslation();

  if (!marriage) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white dark:bg-[#1e1f25] border-b border-gray-100 dark:border-gray-800 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FileText size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('certificate.marriageId')}: {marriage.marriage_id}
                </h2>
                <p className="text-base text-gray-500">{t('certificate.certificateNo')}: {marriage.certificate_no}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Groom Details */}
            <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t('certificate.groomName')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.groomName')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.groom_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.groomFather')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.groom_father}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bride Details */}
            <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t('certificate.brideName')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.brideName')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.bride_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.brideFather')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.bride_father}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Marriage Details */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('certificate.marriageDate')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.marriageDate')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{formatDate(marriage.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.place')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.place}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">{t('certificate.mobile')}</p>
                    <p className="text-base text-gray-900 dark:text-white">{marriage.mobile}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {marriage.notes && (
              <div className="flex items-start gap-3">
                <FileText className="text-gray-400 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t('certificate.notes')}</p>
                  <p className="text-base text-gray-900 dark:text-white">{marriage.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-base text-gray-500">
              <p>{t('common.createdAt')}: {formatDate(marriage.created_at)}</p>
              {marriage.created_by && (
                <p>{t('common.createdBy')}: {marriage.created_by.name}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 bg-white dark:bg-[#1e1f25] border-t border-gray-100 dark:border-gray-800 px-6 py-5 flex gap-3">
            <button
              onClick={() => onDownload(marriage._id)}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 text-base font-medium"
            >
              <Download size={20} />
              {t('certificate.download')}
            </button>
            <button
              onClick={() => onPrint(marriage._id)}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-base font-medium"
            >
              <Printer size={20} />
              {t('certificate.print')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarriageViewModal;
