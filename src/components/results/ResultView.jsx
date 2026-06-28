import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Send, CheckCircle } from 'lucide-react';

const getGradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'text-green-600';
    if (g === 'B+' || g === 'B') return 'text-blue-600';
    if (g === 'C') return 'text-yellow-600';
    return 'text-red-600';
};

const ResultView = ({ isOpen, onClose, result, onPublish, onCreateAnnouncement }) => {
    const { t } = useTranslation();
    if (!result) return null;

    const member = result.member_id || {};
    const house = member.house_id || {};

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 py-8 overflow-y-auto print:hidden-overlay"
                    onClick={onClose}>
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
                        id="result-print-area"
                        onClick={e => e.stopPropagation()}>

                        {/* Action Bar — hidden on print */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 print:hidden">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${result.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {result.status}
                                </span>
                                <span className="text-sm font-mono text-gray-500">{result.result_no}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {result.status !== 'published' && (
                                    <button onClick={() => onPublish(result._id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-xl hover:bg-green-200 transition-colors">
                                        <CheckCircle size={14} />{t('results.list.publish')}
                                    </button>
                                )}
                                {result.status === 'published' && onCreateAnnouncement && (
                                    <button onClick={() => onCreateAnnouncement(result)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 rounded-xl hover:bg-blue-200 transition-colors">
                                        <Send size={14} />{t('results.list.announce')}
                                    </button>
                                )}
                                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">
                                    <Printer size={14} />{t('results.view.print')}
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X size={16} className="text-gray-500" /></button>
                            </div>
                        </div>

                        {/* Printable Content */}
                        <div className="p-6 space-y-5 print-content">
                            {/* Title */}
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('results.view.title')}</h2>
                                {result.madrasa_id && <p className="text-sm text-gray-500 mt-0.5">{result.madrasa_id.name}</p>}
                                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{result.result_type_id?.name}</span>
                                    <span>·</span>
                                    <span>{result.academic_year_id?.name}</span>
                                    <span>·</span>
                                    <span>{result.class_id?.name}</span>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-4">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('results.view.studentInfo')}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-0.5">{t('results.view.name')}</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{result.student_name || member.full_name || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-0.5">{t('results.view.gender')}</p>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{member.gender || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-0.5">{t('results.view.phone')}</p>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{member.whatsapp || member.contact_number || '—'}</p>
                                    </div>
                                    {house.householder_name && (
                                        <div>
                                            <p className="text-gray-500 text-xs mb-0.5">{t('results.view.house')}</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{house.householder_name} ({house.house_code})</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subject Marks */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('results.view.subjectMarks')}</h3>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-[#252731]">
                                            <tr>
                                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('results.view.subject')}</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('results.view.maxMarks')}</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('results.view.obtained')}</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('results.view.grade')}</th>
                                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">{t('results.view.remarks')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {(result.subjects || []).map((sub, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{sub.subject_name}</td>
                                                    <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-400">{sub.max_marks}</td>
                                                    <td className="px-4 py-2.5 text-center font-semibold text-gray-900 dark:text-white">{sub.obtained_marks}</td>
                                                    <td className={`px-4 py-2.5 text-center font-bold ${getGradeColor(sub.grade)}`}>{sub.grade || '—'}</td>
                                                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{sub.remarks || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: t('results.view.totalMax'), value: result.total_max_marks },
                                    { label: t('results.view.totalObtained'), value: result.total_obtained_marks },
                                    { label: t('results.view.percentage'), value: `${result.percentage}%` },
                                    { label: t('results.view.grade'), value: result.overall_grade },
                                ].map(s => (
                                    <div key={s.label} className="bg-gray-50 dark:bg-[#252731] rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={`text-center py-2.5 rounded-xl font-bold text-sm ${result.is_pass ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {result.is_pass ? t('results.form.pass') : t('results.form.fail')}
                            </div>

                            {/* Remarks */}
                            {(result.teacher_remarks || result.principal_remarks) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {result.teacher_remarks && (
                                        <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('results.view.teacherRemarks')}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{result.teacher_remarks}</p>
                                        </div>
                                    )}
                                    {result.principal_remarks && (
                                        <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('results.view.principalRemarks')}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{result.principal_remarks}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResultView;
