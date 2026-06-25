import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Users, Phone, MapPin, IndianRupee, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { getFamilyWelfareHistory } from '../../../api/welfareService';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const formatAmount = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const BeneficiaryProfileModal = ({ isOpen, houseId, onClose, onNewDistribution }) => {
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

  const economicColor = (status) => {
    if (status === 'Poor') return 'red';
    if (status === 'Miskeen') return 'yellow';
    return 'blue';
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
            className="w-full max-w-3xl bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Home size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {data?.house?.householder_name || t('welfare.beneficiaries.viewFamily')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {data?.house?.house_code || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onNewDistribution && (
                  <button
                    onClick={() => { onClose(); onNewDistribution(data?.house); }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {t('welfare.beneficiaries.newDistribution')}
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data ? (
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('welfare.beneficiaries.totalAssistance')}</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                      {formatAmount(data.summary?.total_amount)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('welfare.beneficiaries.distributionCount')}</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-1">
                      {data.summary?.total_distributions || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('welfare.beneficiaries.lastAssistance')}</p>
                    <p className="text-base font-bold text-purple-700 dark:text-purple-300 mt-1">
                      {data.summary?.last_assistance ? formatDate(data.summary.last_assistance) : t('welfare.beneficiaries.neverAssisted')}
                    </p>
                  </div>
                </div>

                {/* House Info */}
                <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Home size={16} className="text-gray-500" /> House Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 min-w-24">{t('welfare.beneficiaries.houseCode')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{data.house?.house_code}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 min-w-24">Family:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {data.house?.family_id?.family_name || '—'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white">{data.house?.primary_contact || '—'}</span>
                    </div>
                    {data.house?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">{data.house.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">{t('welfare.beneficiaries.economicStatus')}:</span>
                      <Badge color={economicColor(data.house?.economic_status)}>
                        {data.house?.economic_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">{t('welfare.beneficiaries.zakatEligible')}:</span>
                      {data.house?.zakat_eligible
                        ? <Badge color="green"><ShieldCheck size={12} className="mr-1" />{t('welfare.beneficiaries.yes')}</Badge>
                        : <Badge color="gray">{t('welfare.beneficiaries.no')}</Badge>
                      }
                    </div>
                  </div>
                </div>

                {/* Members */}
                {data.members?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Users size={16} className="text-gray-500" /> Members ({data.members.length})
                    </h3>
                    <div className="space-y-2">
                      {data.members.map(member => (
                        <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                            {member.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {member.full_name}
                              {member.is_family_head && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Head</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.relation_to_head} • {member.gender}
                              {member.yateem_status && ' • Yateem'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistance History */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Heart size={16} className="text-gray-500" /> {t('welfare.beneficiaries.assistanceHistory')}
                  </h3>
                  {data.distributions?.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                      No assistance records yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.distributions.map(dist => (
                        <div key={dist._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {dist.distribution_no} — {dist.program_id?.program_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {dist.distribution_type} • {dist.funding_source} • {formatDate(dist.distribution_date)}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                                {formatAmount(dist.amount)}
                              </span>
                            </div>
                            {dist.notes && (
                              <p className="text-xs text-gray-400 mt-1 italic">{dist.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600">
                No data available
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BeneficiaryProfileModal;
