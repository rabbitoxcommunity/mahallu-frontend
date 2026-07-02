import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { markCertificateGenerated, viewPDF } from '../../../api/deathService';

const CertificateModal = ({ record, onClose }) => {
    const { t } = useTranslation();
    const markedRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [blobUrl, setBlobUrl] = useState(null);

    useEffect(() => {
        if (record && !markedRef.current) {
            markedRef.current = true;
            markCertificateGenerated(record._id).catch(() => {});
        }
    }, [record]);

    useEffect(() => {
        if (!record) return;
        let cancelled = false;
        (async () => {
            try {
                // Fetch as a blob (no Content-Disposition: attachment) so it
                // renders inline for preview/print. The R2 download URL always
                // force-downloads, which broke both the iframe preview and print.
                const blob = await viewPDF(record._id);
                if (!cancelled) setBlobUrl(URL.createObjectURL(blob));
            } catch {
                if (!cancelled) toast.error(t('death.certificate.generateFailed', 'Failed to generate certificate'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [record, t]);

    useEffect(() => {
        // Release the blob URL when replaced or the modal unmounts.
        return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }, [blobUrl]);

    if (!record) return null;

    const handleDownloadPDF = () => {
        if (!blobUrl) return;
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${record.certificate_no || record.death_id}.pdf`;
        a.click();
    };

    const handlePrint = () => {
        if (!blobUrl) return;
        const w = window.open(blobUrl, '_blank');
        if (w) {
            w.addEventListener('load', () => w.print());
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-3xl h-[90vh] bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('death.certificate.title')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={!blobUrl}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors"
                            >
                                <Download size={13} />
                                {t('death.certificate.download')}
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={!blobUrl}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium transition-colors"
                            >
                                <Printer size={13} />
                                {t('death.certificate.print')}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="flex-1 bg-gray-100 dark:bg-[#0f1013]">
                        {loading && (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                                <Loader2 size={28} className="animate-spin" />
                                <p className="text-sm">{t('death.certificate.generating', 'Generating certificate…')}</p>
                            </div>
                        )}
                        {!loading && blobUrl && (
                            <iframe
                                src={blobUrl}
                                title="Death Certificate"
                                className="w-full h-full border-0"
                            />
                        )}
                        {!loading && !blobUrl && (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                                {t('death.certificate.generateFailed', 'Failed to generate certificate')}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CertificateModal;
