import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, IndianRupee, Calendar, Tag } from 'lucide-react';
import { getFamilyWelfareHistory } from '../../../api/welfareService';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const DistributionHistoryModal = ({ isOpen, houseId, houseName, onClose }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && houseId) {
      setLoading(true);
      getFamilyWelfareHistory(houseId)
        .then(d => setData(d))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, houseId]);

  const typeColors = {
    'Cash': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Food Kit': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Medicine': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Education': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Marriage': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'House Repair': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Emergency Relief': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <History size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('welfare.beneficiaries.assistanceHistory')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{houseName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : data ? (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t('welfare.beneficiaries.totalAssistance')}</p>
                      <p className="text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                        {formatAmount(data.summary?.total_amount)}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-600 dark:text-green-400">Total Count</p>
                      <p className="text-base font-bold text-green-700 dark:text-green-300 mt-0.5">
                        {data.summary?.total_distributions || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-purple-600 dark:text-purple-400">{t('welfare.beneficiaries.lastAssistance')}</p>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                        {data.summary?.last_assistance ? formatDate(data.summary.last_assistance) : t('welfare.beneficiaries.neverAssisted')}
                      </p>
                    </div>
                  </div>

                  {/* Distribution List */}
                  {data.distributions?.length === 0 ? (
                    <div className="text-center py-12">
                      <History size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No assistance records found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.distributions.map(dist => (
                        <div
                          key={dist._id}
                          className="p-4 bg-gray-50 dark:bg-[#252731] rounded-xl border border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  {dist.distribution_no}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[dist.distribution_type] || typeColors['Other']}`}>
                                  {dist.distribution_type}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {dist.program_id?.program_name || 'Unknown Program'}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} /> {formatDate(dist.distribution_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Tag size={11} /> {dist.funding_source}
                                </span>
                                {dist.created_by?.name && (
                                  <span>by {dist.created_by.name}</span>
                                )}
                              </div>
                              {dist.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">{dist.notes}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-bold text-green-600 dark:text-green-400">
                                {formatAmount(dist.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">No data available</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DistributionHistoryModal;
