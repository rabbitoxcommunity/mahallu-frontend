import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Home, Phone, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { toPng } from 'html-to-image';

const Card = ({ house, orgName }) => {
    const { t } = useTranslation();

    const economicColor =
        house.economic_status === 'Poor' ? '#ef4444' :
            house.economic_status === 'Miskeen' ? '#f97316' :
                '#0B65F6';

    return (
        <div
            id="membership-card"
            style={{
                width: '85.6mm',
                height: '53.98mm',
                background: '#fff',
                borderRadius: '4mm',
                overflow: 'hidden',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Top stripe */}
            <div style={{
                background: 'linear-gradient(135deg, #0B65F6 0%, #0a4fc4 100%)',
                padding: '3mm 4mm 2.5mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
                    <div style={{
                        width: '7mm', height: '7mm',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '1.5mm',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontSize: '3.2mm', fontWeight: 700, lineHeight: 1.1, letterSpacing: '0.02em' }}>
                            {orgName || 'Mahallu'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '2mm', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {t('family.houseDetail.pageTitle')}
                        </div>
                    </div>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '1.5mm',
                    padding: '1mm 2mm',
                    color: '#fff',
                    fontSize: '3.5mm',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                }}>
                    {house.house_code}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '3mm 4mm', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Name block */}
                <div>
                    <div style={{ fontSize: '5mm', fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: '0.8mm' }}>
                        {house.householder_name}
                    </div>
                    {house.family_id?.family_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1mm', color: '#6b7280', fontSize: '2.8mm', fontWeight: 500 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {house.family_id.family_name}
                        </div>
                    )}
                </div>

                {/* Contact & Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1mm' }}>
                    {house.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5mm', color: '#374151', fontSize: '2.6mm' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0B65F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '0.5mm', flexShrink: 0 }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            <span style={{ lineHeight: 1.3 }}>{house.address}</span>
                        </div>
                    )}
                    {house.primary_contact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', color: '#374151', fontSize: '2.6mm' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0B65F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                            </svg>
                            {house.primary_contact}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                background: '#f9fafb',
                borderTop: '0.3mm solid #e5e7eb',
                padding: '2mm 4mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                {/* Org name — left */}
                <div style={{ fontSize: '2.4mm', color: '#374151', fontWeight: 700, letterSpacing: '0.02em' }}>
                    {orgName || 'Mahallu'}
                </div>

                {/* Signature area — right */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8mm' }}>
                    <div style={{ width: '18mm', borderBottom: '0.3mm solid #9ca3af' }} />
                    <span style={{ fontSize: '1.8mm', color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {t('common.signature')}
                    </span>
                </div>
            </div>
        </div>
    );
};

const HouseMembershipCard = ({ isOpen, onClose, house }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isDownloading, setIsDownloading] = useState(false);
    const orgName = user?.tenant_name || '';

    const handleDownload = async () => {
        const cardEl = document.getElementById('membership-card');
        if (!cardEl) return;
        
        try {
            setIsDownloading(true);
            
            const dataUrl = await toPng(cardEl, {
                pixelRatio: 4,
                cacheBust: true,
            });
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `House_Membership_Card_${house?.house_code || 'Card'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading image:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        className="bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 w-full max-w-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                {t('family.houseDetail.membershipCard')}
                            </h2>
                            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Card preview */}
                        <div className="flex justify-center mb-5">
                            {house && <Card house={house} orgName={orgName} />}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isDownloading}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <Download size={15} />
                                )}
                                {isDownloading ? t('common.downloading') : t('common.download4K')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HouseMembershipCard;
