import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, Save, Globe } from 'lucide-react';
import Toggle from '../../ui/Toggle';

const WhatsAppIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);
import { toast } from 'react-toastify';
import {
    createAnnouncement,
    updateAnnouncement,
    publishAnnouncement,
    getCommSettings,
} from '../../../api/communicationService';
import AnnouncementPreview from './AnnouncementPreview';

const buildMessage = ({ body, announcementDate, signature, organizationName, t }) => {
    const org = organizationName || '';
    const sig = signature || '';
    const dateStr = announcementDate
        ? new Date(announcementDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    let msg = `${t('comm.preview.salutation')}\n\n`;
    if (body) msg += `${body}\n\n`;
    if (dateStr) msg += `📅 ${dateStr}\n\n`;
    msg += `— ${sig}\n${org}\n\nwww.mahalluconnect.com`;
    return msg.trim();
};


const AnnouncementFormModal = ({ editRecord, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({});
    const isEdit = !!editRecord;

    const [showOnPortal, setShowOnPortal] = useState(true);

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { title: '', body: '', announcement_date: '' },
    });

    const watchedTitle = watch('title');
    const watchedBody = watch('body');
    const watchedDate = watch('announcement_date');

    useEffect(() => {
        getCommSettings().then(d => setSettings(d.settings || {})).catch(() => {});
    }, []);

    useEffect(() => {
        if (editRecord) {
            reset({
                title: editRecord.title || '',
                body: editRecord.body || '',
                announcement_date: editRecord.announcement_date
                    ? new Date(editRecord.announcement_date).toISOString().split('T')[0]
                    : '',
            });
            setShowOnPortal(editRecord.visibility === 'public');
        } else {
            setShowOnPortal(true);
        }
    }, [editRecord, reset]);

    const getFormattedMessage = () => buildMessage({
        body: watchedBody,
        announcementDate: watchedDate,
        signature: settings.signature,
        organizationName: settings.organization_name,
        t,
    });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getFormattedMessage());
            toast.success(t('comm.actions.copied'));
        } catch {
            toast.error(t('comm.actions.copyFailed'));
        }
    };

    const handleShare = () => {
        const text = getFormattedMessage();
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const onSubmit = async (values, publishNow = false) => {
        const payload = {
            title: values.title,
            body: values.body,
            visibility: showOnPortal ? 'public' : 'members_only',
            publish_immediately: publishNow,
            announcement_date: values.announcement_date || null,
        };

        try {
            if (isEdit) {
                await updateAnnouncement(editRecord._id, payload);
                if (publishNow) await publishAnnouncement(editRecord._id);
                toast.success(t('comm.messages.updated'));
            } else {
                await createAnnouncement(payload);
                toast.success(publishNow ? t('comm.messages.published') : t('comm.messages.saved'));
            }
            onSuccess();
        } catch {
            // handled by interceptor
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#1e1f25] rounded-3xl shadow-2xl w-full max-w-5xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEdit ? t('comm.form.editTitle') : t('comm.form.newTitle')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.form.subtitle')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
                        {/* Form */}
                        <div className="p-6 space-y-4">
                                {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('comm.form.titleLabel')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('title', { required: t('comm.form.titleRequired') })}
                                    placeholder={t('comm.form.titlePlaceholder')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('comm.form.bodyLabel')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register('body', { required: t('comm.form.bodyRequired') })}
                                    rows={5}
                                    placeholder={t('comm.form.bodyPlaceholder')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                {errors.body && (
                                    <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>
                                )}
                            </div>

                            {/* Announcement Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t('comm.form.announcementDate')}
                                </label>
                                <input
                                    type="date"
                                    {...register('announcement_date')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Show on portal toggle */}
                            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252731]">
                                <div className="flex items-center gap-2.5">
                                    <Globe size={16} className={showOnPortal ? 'text-blue-500' : 'text-gray-400'} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Show on public portal</p>
                                        <p className="text-xs text-gray-400">Visible to everyone on the portal</p>
                                    </div>
                                </div>
                                <Toggle checked={showOnPortal} onChange={setShowOnPortal} />
                            </div>

                        </div>

                        {/* Preview */}
                        <div className="p-6 flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                                {t('comm.preview.title')}
                            </h3>

                            {/* WhatsApp mockup */}
                            <div className="flex-1 bg-[#e5ddd5] dark:bg-[#0d1418] rounded-2xl p-4 min-h-64">
                                <AnnouncementPreview
                                    type=""
                                    title={watchedTitle}
                                    body={watchedBody}
                                    announcementDate={watchedDate}
                                    organizationName={settings.organization_name}
                                    signature={settings.signature}
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    <Copy size={15} />
                                    {t('comm.actions.copy')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl transition-colors text-sm font-medium"
                                >
                                    <WhatsAppIcon size={15} />
                                    {t('comm.actions.share')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit((v) => onSubmit(v, false))}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                        >
                            <Save size={15} />
                            {t('comm.actions.saveDraft')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit((v) => onSubmit(v, true))}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Send size={15} />
                            {t('comm.actions.publish')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnnouncementFormModal;
