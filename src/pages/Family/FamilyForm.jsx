import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Users, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

export default function FamilyForm({ initialData, onSuccess, onCancel }) {
    const { t } = useTranslation();
    const isEdit = !!initialData?._id;

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            family_name: '',
            notes: '',
            is_active: true
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                family_name: initialData.family_name || '',
                notes: initialData.notes || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await axios.put(`/family/${initialData._id}`, data);
                toast.success(t('family.form.familyUpdated'));
            } else {
                await axios.post('/family/create', data);
                toast.success(t('family.form.familySaved'));
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            // Error managed by axios interceptor
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Family Name */}
            <div>
                <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('family.form.familyNameLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${
                            errors.family_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                        } rounded-xl  text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                        placeholder={t('family.form.familyNamePlaceholder')}
                        {...register("family_name", { required: t('family.form.familyNameRequired') })}
                    />
                </div>
                {errors.family_name && (
                    <p className="mt-1.5  text-red-500">{errors.family_name.message}</p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('family.form.notesLabel')}
                </label>
                <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <FileText size={18} className="text-gray-400" />
                    </div>
                    <textarea
                        rows={4}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                        placeholder={t('family.form.notesPlaceholder')}
                        {...register("notes")}
                    />
                </div>
            </div>

            {/* Is Active Status (Checkbox) */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        {...register("is_active")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0B65F6]"></div>
                </label>
                <div>
                    <p className=" font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        {t('family.form.activeStatus')}
                    </p>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5  font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-[#1e1f25] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
                    >
                        {t('family.form.cancel')}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5  font-medium text-white bg-[#0B65F6] rounded-xl hover:bg-[#0B65F6]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B65F6] disabled:opacity-50 transition-all shadow-sm"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {isEdit ? t('family.form.updateFamily') : t('family.form.saveFamily')}
                </button>
            </div>
        </form>
    );
}
