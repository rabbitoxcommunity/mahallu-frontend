import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');
const formatTime = (t) => t || '—';

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[140px] shrink-0">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</span>
    </div>
);

const Section = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {title}
        </h4>
        {children}
    </div>
);

const DeathViewModal = ({ record, onClose, onGenerateCert }) => {
    const { t } = useTranslation();

    if (!record) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {record.death_id}
                                </span>
                                {record.certificate_no && (
                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {record.certificate_no}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                                {record.name}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onGenerateCert}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-colors"
                            >
                                <Award size={13} />
                                {t('death.certificate.generate')}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 p-5 space-y-4">
                        {/* Section 1: Deceased Information */}
                        <Section title={t('death.form.section1')}>
                            <InfoRow label={t('death.form.name')} value={record.name} />
                            <InfoRow label={t('death.form.gender')} value={record.gender} />
                            <InfoRow label={t('death.form.age')} value={record.age != null ? `${record.age} years` : null} />
                            <InfoRow label={t('death.form.dob')} value={formatDate(record.dob)} />
                            <InfoRow label={t('death.form.fatherName')} value={record.father_name} />
                            <InfoRow label={t('death.form.motherName')} value={record.mother_name} />
                            <InfoRow label={t('death.form.spouseName')} value={record.spouse_name} />
                            <InfoRow label={t('death.form.contact')} value={record.primary_contact} />
                        </Section>

                        {/* Section 2: Death Details */}
                        <Section title={t('death.form.section2')}>
                            <InfoRow label={t('death.form.dateOfDeath')} value={formatDate(record.date_of_death)} />
                            <InfoRow label={t('death.form.timeOfDeath')} value={formatTime(record.time_of_death)} />
                            <InfoRow label={t('death.form.placeOfDeath')} value={record.place_of_death} />
                            <InfoRow label={t('death.form.causeOfDeath')} value={record.cause_of_death} />
                            <InfoRow label={t('death.form.hospital')} value={record.hospital} />
                        </Section>

                        {/* Section 3: Janaza Details */}
                        <Section title={t('death.form.section3')}>
                            <InfoRow label={t('death.form.janazaDate')} value={formatDate(record.janaza_date)} />
                            <InfoRow label={t('death.form.janazaTime')} value={formatTime(record.janaza_time)} />
                            <InfoRow label={t('death.form.janazaPlace')} value={record.janaza_place} />
                            <InfoRow label={t('death.form.imam')} value={record.imam} />
                        </Section>

                        {/* Section 4: Charges */}
                        {record.charge_applicable && (
                            <Section title={t('death.form.section4')}>
                                <InfoRow
                                    label={t('death.form.chargeAmount')}
                                    value={`₹${(record.charge_amount || 0).toLocaleString('en-IN')}`}
                                />
                                <InfoRow
                                    label={t('death.form.paymentStatus')}
                                    value={record.payment_status ? t(`death.paymentStatus.${record.payment_status}`) : null}
                                />
                                <InfoRow label={t('death.form.paymentMethod')} value={record.payment_method} />
                            </Section>
                        )}

                        {/* Section 5: House info */}
                        {record.house_id && (
                            <Section title={t('death.table.house')}>
                                <InfoRow label="House Code" value={record.house_id.house_code} />
                                <InfoRow label="Householder" value={record.house_id.householder_name} />
                                <InfoRow label="Contact" value={record.house_id.primary_contact} />
                            </Section>
                        )}

                        {/* Notes */}
                        {record.notes && (
                            <Section title={t('death.form.notes')}>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
                            </Section>
                        )}

                        {/* Certificate status */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#252731] rounded-xl">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{t('death.table.certificate')}</span>
                            <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${record.certificate_generated
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {record.certificate_generated ? t('death.table.generated') : t('death.table.pending')}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-5 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeathViewModal;
