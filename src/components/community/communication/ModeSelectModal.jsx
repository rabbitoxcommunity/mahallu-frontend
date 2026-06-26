import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenLine, Puzzle } from 'lucide-react';

const ModeSelectModal = ({ onSelect, onClose }) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#1e1f25] rounded-3xl shadow-2xl w-full max-w-lg"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('comm.mode.title')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('comm.mode.subtitle')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Standalone */}
                        <button
                            onClick={() => onSelect('standalone')}
                            className="group flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <PenLine size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {t('comm.mode.standaloneTitle')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    {t('comm.mode.standaloneDesc')}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {['General', 'Ramadan', 'Eid', 'Emergency'].map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-[10px]">{tag}</span>
                                ))}
                            </div>
                        </button>

                        {/* Module-Based */}
                        <button
                            onClick={() => onSelect('module')}
                            className="group flex flex-col items-start gap-3 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                <Puzzle size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {t('comm.mode.moduleTitle')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    {t('comm.mode.moduleDesc')}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {['Death Registry', 'Marriage', 'Welfare', 'Meeting'].map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-[10px]">{tag}</span>
                                ))}
                            </div>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ModeSelectModal;
