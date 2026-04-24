import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SlideOver = ({
    isOpen,
    onClose,
    title,
    children,
    subtitle,
    width = "max-w-2xl", // default width
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] overflow-hidden ">
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm transition-opacity"
                        />

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`pointer-events-auto w-screen ${width}`}
                            >
                                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-[#1e1f25] shadow-2xl">
                                    <div className="px-6 py-6 sm:px-8 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {title}
                                                </h2>
                                                {subtitle && (
                                                    <p className="mt-1  text-gray-500 dark:text-gray-400">
                                                        {subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all outline-none"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative flex-1 px-6 py-6 sm:px-8">
                                        {children}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SlideOver;