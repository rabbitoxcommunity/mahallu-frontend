import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import { markCertificateGenerated } from '../../../api/deathService';

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const CertificateModal = ({ record, onClose }) => {
    const { t } = useTranslation();
    const markedRef = useRef(false);

    useEffect(() => {
        if (record && !markedRef.current) {
            markedRef.current = true;
            markCertificateGenerated(record._id).catch(() => {});
        }
    }, [record]);

    if (!record) return null;

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;

        // Background
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Decorative border
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(3);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        doc.setDrawColor(147, 197, 253);
        doc.setLineWidth(1);
        doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

        let y = 30;

        // Organization Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(30, 64, 175);
        doc.text('MAHALLU', pageWidth / 2, y, { align: 'center' });
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Community Management System', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Divider
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text(t('death.certificate.title').toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 8;

        // Certificate & Death ID
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
            `Certificate No: ${record.certificate_no || '—'}   |   Death ID: ${record.death_id}`,
            pageWidth / 2,
            y,
            { align: 'center' }
        );
        y += 12;

        // "This is to certify that"
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105);
        doc.text(t('death.certificate.thisIsToCertify'), pageWidth / 2, y, { align: 'center' });
        y += 12;

        // Deceased Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(15, 23, 42);
        doc.text(record.name, pageWidth / 2, y, { align: 'center' });
        y += 6;

        // Underline under name
        const nameWidth = doc.getTextWidth(record.name);
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(0.5);
        doc.line(
            pageWidth / 2 - nameWidth / 2,
            y,
            pageWidth / 2 + nameWidth / 2,
            y
        );
        y += 10;

        // Father/Spouse
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);

        if (record.father_name) {
            doc.text(`${t('death.certificate.fatherOf')}: ${record.father_name}`, pageWidth / 2, y, { align: 'center' });
            y += 7;
        }
        if (record.spouse_name) {
            doc.text(`Spouse: ${record.spouse_name}`, pageWidth / 2, y, { align: 'center' });
            y += 7;
        }

        // House info
        if (record.house_id) {
            const houseInfo =
                typeof record.house_id === 'object'
                    ? `${record.house_id.house_code} – ${record.house_id.householder_name}`
                    : String(record.house_id);
            doc.text(`${t('death.certificate.houseOf')}: ${houseInfo}`, pageWidth / 2, y, { align: 'center' });
            y += 7;
        }

        y += 5;

        // Light background box for key details
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(186, 215, 254);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'FD');

        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 64, 175);

        const col1 = margin + 8;
        const col2 = pageWidth / 2 + 5;

        doc.text('Date of Death', col1, y);
        doc.text('Age at Death', col2, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.text(formatDate(record.date_of_death), col1, y);
        doc.text(
            record.age != null
                ? `${record.age} ${t('death.certificate.years')}`
                : '—',
            col2,
            y
        );
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 64, 175);
        doc.text('Place of Death', col1, y);
        if (record.janaza_date) {
            doc.text('Janaza Date', col2, y);
        }
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.text(record.place_of_death || '—', col1, y);
        if (record.janaza_date) {
            doc.text(formatDate(record.janaza_date), col2, y);
        }
        y += 12;

        // Janaza Place & Imam
        if (record.janaza_place || record.imam) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(30, 64, 175);
            if (record.janaza_place) doc.text('Janaza Place', col1, y);
            if (record.imam) doc.text(`${t('death.form.imam')}`, col2, y);
            y += 5;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(11);
            if (record.janaza_place) doc.text(record.janaza_place, col1, y);
            if (record.imam) doc.text(record.imam, col2, y);
            y += 8;
        }

        y += 15;

        // Cause of death
        if (record.cause_of_death) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Cause of Death: ${record.cause_of_death}`, pageWidth / 2, y, { align: 'center' });
            y += 10;
        }

        y += 10;

        // Signature area
        const sigLineY = pageHeight - 40;
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);

        // Left signature
        doc.line(margin, sigLineY, margin + 50, sigLineY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(t('death.certificate.signature'), margin + 25, sigLineY + 5, { align: 'center' });
        doc.text('Secretary', margin + 25, sigLineY + 10, { align: 'center' });

        // Center seal
        doc.setDrawColor(147, 197, 253);
        doc.setFillColor(239, 246, 255);
        doc.circle(pageWidth / 2, sigLineY - 5, 15, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 64, 175);
        doc.text(t('death.certificate.seal'), pageWidth / 2, sigLineY - 5, { align: 'center' });

        // Right signature
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);
        doc.line(pageWidth - margin - 50, sigLineY, pageWidth - margin, sigLineY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
            t('death.certificate.signature'),
            pageWidth - margin - 25,
            sigLineY + 5,
            { align: 'center' }
        );
        doc.text('President', pageWidth - margin - 25, sigLineY + 10, { align: 'center' });

        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Issued on: ${new Date().toLocaleDateString('en-IN')} | Certificate No: ${record.certificate_no || '—'}`,
            pageWidth / 2,
            pageHeight - 16,
            { align: 'center' }
        );

        doc.save(`Death_Certificate_${record.death_id}.pdf`);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('death-certificate-print');
        if (!printContent) return;
        const w = window.open('', '_blank');
        w.document.write(`
            <html>
                <head>
                    <title>Death Certificate - ${record.death_id}</title>
                    <style>
                        body { font-family: Georgia, serif; padding: 40px; color: #0f172a; }
                        .cert { max-width: 700px; margin: 0 auto; border: 3px solid #1e40af; padding: 40px; }
                        h1 { text-align: center; color: #1e40af; font-size: 28px; }
                        h2 { text-align: center; font-size: 22px; }
                        .center { text-align: center; }
                        .section { margin: 16px 0; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; background: #eff6ff; padding: 16px; }
                        .sig { display: flex; justify-content: space-between; margin-top: 60px; }
                        .sig-line { width: 160px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; }
                        .label { color: #64748b; font-size: 12px; }
                        .value { font-size: 14px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="cert">
                        <h1>MAHALLU</h1>
                        <p class="center label">Community Management System</p>
                        <hr />
                        <h2>${t('death.certificate.title').toUpperCase()}</h2>
                        <p class="center label">Certificate No: ${record.certificate_no || '—'} | Death ID: ${record.death_id}</p>
                        <p class="center" style="margin-top:20px;font-style:italic;">${t('death.certificate.thisIsToCertify')}</p>
                        <h2 style="margin-top:12px;">${record.name}</h2>
                        ${record.father_name ? `<p class="center">${t('death.certificate.fatherOf')}: ${record.father_name}</p>` : ''}
                        ${record.spouse_name ? `<p class="center">Spouse: ${record.spouse_name}</p>` : ''}
                        ${record.house_id ? `<p class="center">${t('death.certificate.houseOf')}: ${typeof record.house_id === 'object' ? record.house_id.house_code : record.house_id}</p>` : ''}
                        <div class="grid">
                            <div><div class="label">Date of Death</div><div class="value">${formatDate(record.date_of_death)}</div></div>
                            <div><div class="label">Age</div><div class="value">${record.age != null ? `${record.age} years` : '—'}</div></div>
                            <div><div class="label">Place of Death</div><div class="value">${record.place_of_death || '—'}</div></div>
                            <div><div class="label">Janaza Date</div><div class="value">${formatDate(record.janaza_date)}</div></div>
                            ${record.imam ? `<div><div class="label">Imam</div><div class="value">${record.imam}</div></div>` : ''}
                        </div>
                        <div class="sig">
                            <div class="sig-line">Secretary</div>
                            <div class="sig-line">President</div>
                        </div>
                        <p class="center label" style="margin-top:24px;">Issued: ${new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                </body>
            </html>
        `);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 500);
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
                    className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('death.certificate.title')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors"
                            >
                                <Download size={13} />
                                {t('death.certificate.download')}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium transition-colors"
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
                    <div className="overflow-y-auto flex-1 p-5">
                        <div
                            id="death-certificate-print"
                            className="bg-white rounded-2xl border-2 border-blue-700 p-8 space-y-4"
                        >
                            {/* Certificate Header */}
                            <div className="text-center border-b border-blue-100 pb-4">
                                <h1 className="text-2xl font-bold text-blue-700">MAHALLU</h1>
                                <p className="text-xs text-gray-500">Community Management System</p>
                                <h2 className="text-xl font-bold text-gray-900 mt-3 uppercase tracking-wide">
                                    {t('death.certificate.title')}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Certificate No: {record.certificate_no || '—'} &nbsp;|&nbsp; Death ID: {record.death_id}
                                </p>
                            </div>

                            {/* Main content */}
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-500 italic">{t('death.certificate.thisIsToCertify')}</p>
                                <h3 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 inline-block pb-1">
                                    {record.name}
                                </h3>
                                {record.father_name && (
                                    <p className="text-sm text-gray-700">
                                        {t('death.certificate.fatherOf')}: <strong>{record.father_name}</strong>
                                    </p>
                                )}
                                {record.spouse_name && (
                                    <p className="text-sm text-gray-700">
                                        Spouse: <strong>{record.spouse_name}</strong>
                                    </p>
                                )}
                                {record.house_id && (
                                    <p className="text-sm text-gray-700">
                                        {t('death.certificate.houseOf')}:{' '}
                                        <strong>
                                            {typeof record.house_id === 'object'
                                                ? `${record.house_id.house_code} – ${record.house_id.householder_name}`
                                                : record.house_id}
                                        </strong>
                                    </p>
                                )}
                            </div>

                            {/* Key Details Grid */}
                            <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold">Date of Death</p>
                                    <p className="text-sm font-bold text-gray-900">{formatDate(record.date_of_death)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold">{t('death.certificate.age')}</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {record.age != null ? `${record.age} ${t('death.certificate.years')}` : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold">Place of Death</p>
                                    <p className="text-sm font-bold text-gray-900">{record.place_of_death || '—'}</p>
                                </div>
                                {record.janaza_date && (
                                    <div>
                                        <p className="text-xs text-blue-600 font-semibold">{t('death.certificate.janazaPerformed')}</p>
                                        <p className="text-sm font-bold text-gray-900">{formatDate(record.janaza_date)}</p>
                                    </div>
                                )}
                                {record.janaza_place && (
                                    <div>
                                        <p className="text-xs text-blue-600 font-semibold">{t('death.form.janazaPlace')}</p>
                                        <p className="text-sm font-bold text-gray-900">{record.janaza_place}</p>
                                    </div>
                                )}
                                {record.imam && (
                                    <div>
                                        <p className="text-xs text-blue-600 font-semibold">{t('death.certificate.imam')}</p>
                                        <p className="text-sm font-bold text-gray-900">{record.imam}</p>
                                    </div>
                                )}
                            </div>

                            {record.cause_of_death && (
                                <p className="text-center text-xs text-gray-500 italic">
                                    Cause of Death: {record.cause_of_death}
                                </p>
                            )}

                            {/* Signature area */}
                            <div className="flex items-end justify-between pt-8">
                                <div className="text-center">
                                    <div className="w-32 border-t border-gray-400 pt-2">
                                        <p className="text-xs text-gray-500">{t('death.certificate.signature')}</p>
                                        <p className="text-xs text-gray-400">Secretary</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-full flex items-center justify-center mx-auto">
                                        <p className="text-xs text-blue-400 text-center">{t('death.certificate.seal')}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="w-32 border-t border-gray-400 pt-2">
                                        <p className="text-xs text-gray-500">{t('death.certificate.signature')}</p>
                                        <p className="text-xs text-gray-400">President</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-xs text-gray-400 pt-2">
                                Issued on: {new Date().toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CertificateModal;
