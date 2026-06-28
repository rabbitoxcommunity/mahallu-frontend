import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, MapPin, FileText, Download, Printer, Clock, Home, Building2, BookUser } from 'lucide-react';

const Row = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

const SectionHeader = ({ title, color = 'blue' }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-1 h-4 rounded-full ${color === 'pink' ? 'bg-pink-500' : color === 'green' ? 'bg-green-500' : color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'}`} />
    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
  </div>
);

const MarriageViewModal = ({ marriage, onClose, onDownload, onPrint }) => {
  const { t } = useTranslation();

  if (!marriage) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

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
          className="bg-white dark:bg-[#1e1f25] rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {t('certificate.marriageId')}: {marriage.marriage_id}
                </h2>
                <p className="text-xs text-gray-500">{t('certificate.certificateNo')}: {marriage.certificate_no}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Nikkah Details */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4">
              <SectionHeader title={t('certificate.sectionNikkah')} color="blue" />
              <div className="grid grid-cols-3 gap-4">
                <Row label={t('certificate.marriageDate')} value={formatDate(marriage.date)} />
                <Row label={t('certificate.nikkahTime')} value={marriage.nikkah_time} />
                <Row label={t('certificate.place')} value={marriage.place} />
              </div>
            </div>

            {/* Groom | Bride */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-[#252731]/60 rounded-xl p-4">
                <SectionHeader title={t('certificate.sectionGroom')} color="blue" />
                <div className="grid grid-cols-2 gap-3">
                  <Row label={t('certificate.groomName')} value={marriage.groom_name} />
                  <Row label={t('certificate.groomFather')} value={marriage.groom_father} />
                  <Row label={t('certificate.groomDob')} value={formatDate(marriage.groom_dob)} />
                  <Row label={t('certificate.groomHouseName')} value={marriage.groom_house_name} />
                  <Row label={t('certificate.groomMahallu')} value={marriage.groom_mahallu} />
                  {marriage.groom_address && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{t('certificate.groomAddress')}</p>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{marriage.groom_address}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4">
                <SectionHeader title={t('certificate.sectionBride')} color="pink" />
                <div className="grid grid-cols-2 gap-3">
                  <Row label={t('certificate.brideName')} value={marriage.bride_name} />
                  <Row label={t('certificate.brideFather')} value={marriage.bride_father} />
                  <Row label={t('certificate.brideDob')} value={formatDate(marriage.bride_dob)} />
                  <Row label={t('certificate.brideHouseName')} value={marriage.bride_house_name} />
                  <Row label={t('certificate.brideMahallu')} value={marriage.bride_mahallu} />
                  {marriage.bride_address && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{t('certificate.brideAddress')}</p>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{marriage.bride_address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Place & Performer */}
            <div className="grid grid-cols-2 gap-4">
              {marriage.nikkah_mahallu && (
                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4">
                  <SectionHeader title={t('certificate.sectionPlace')} color="green" />
                  <Row label={t('certificate.nikkahMahallu')} value={marriage.nikkah_mahallu} />
                </div>
              )}
              {(marriage.performer_name || marriage.performer_designation) && (
                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4">
                  <SectionHeader title={t('certificate.sectionPerformer')} color="purple" />
                  <div className="grid grid-cols-2 gap-3">
                    <Row label={t('certificate.performerName')} value={marriage.performer_name} />
                    <Row label={t('certificate.performerDesignation')} value={marriage.performer_designation} />
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-400">
              {t('common.createdAt')}: {formatDate(marriage.created_at)}
              {marriage.created_by && ` · ${t('common.createdBy')}: ${marriage.created_by.name}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-3">
            <button onClick={() => onDownload(marriage._id)}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 text-sm font-medium">
              <Download size={16} />{t('certificate.download')}
            </button>
            <button onClick={() => onPrint(marriage._id)}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm font-medium">
              <Printer size={16} />{t('certificate.print')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarriageViewModal;
