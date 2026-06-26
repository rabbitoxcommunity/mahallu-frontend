import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Save, Plus, X, Settings2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCommSettings, updateCommSettings } from '../../../api/communicationService';

const DEFAULT_TYPES = [
    'Death Notice', 'Marriage Notice', 'Welfare', 'Meeting',
    'General', 'Ramadan', 'Eid', 'Emergency', 'Other',
];

const CommSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [announcementTypes, setAnnouncementTypes] = useState(DEFAULT_TYPES);
    const [newType, setNewType] = useState('');

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            organization_name: '',
            signature: '',
        },
    });

    useEffect(() => {
        getCommSettings()
            .then(d => {
                const s = d.settings || {};
                reset({
                    organization_name: s.organization_name || '',
                    signature: s.signature || '',
                });
                setAnnouncementTypes(s.announcement_types?.length ? s.announcement_types : DEFAULT_TYPES);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [reset]);

    const addType = () => {
        const trimmed = newType.trim();
        if (!trimmed) return;
        if (announcementTypes.includes(trimmed)) {
            toast.error(t('comm.settings.typeExists'));
            return;
        }
        setAnnouncementTypes(prev => [...prev, trimmed]);
        setNewType('');
    };

    const removeType = (type) => {
        setAnnouncementTypes(prev => prev.filter(t => t !== type));
    };

    const onSubmit = async (values) => {
        try {
            await updateCommSettings({ ...values, announcement_types: announcementTypes });
            toast.success(t('comm.settings.saved'));
        } catch { /* handled */ }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Info */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Settings2 size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('comm.settings.orgInfo')}</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('comm.settings.organizationName')}</label>
                    <input
                        {...register('organization_name')}
                        placeholder={t('comm.settings.organizationNamePlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('comm.settings.signature')}</label>
                    <input
                        {...register('signature')}
                        placeholder={t('comm.settings.signaturePlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Announcement Types */}
            <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('comm.settings.announcementTypes')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('comm.settings.announcementTypesDesc')}</p>

                <div className="flex flex-wrap gap-2">
                    {announcementTypes.map(type => (
                        <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                            {type}
                            <button type="button" onClick={() => removeType(type)} className="text-blue-400 hover:text-red-500 transition-colors">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newType}
                        onChange={e => setNewType(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addType())}
                        placeholder={t('comm.settings.newTypePlaceholder')}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={addType} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                        <Plus size={14} />
                        {t('common.add')}
                    </button>
                </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                    <Save size={15} />
                    {t('comm.settings.save')}
                </button>
            </div>
        </form>
    );
};

export default CommSettings;
