import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, Home, FileText, Phone, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import SearchableSelect from '../../components/ui/SearchableSelect';

export default function HouseForm({ initialData, onSuccess, onCancel }) {
    const { t } = useTranslation();
    const isEdit = !!initialData?._id;
    const [families, setFamilies] = useState([]);
    const [loadingFamilies, setLoadingFamilies] = useState(true);

    const methods = useForm({
        defaultValues: {
            family_id: '',
            householder_name: '',
            address: '',
            primary_contact: '',
            economic_status: 'Normal',
            zakat_eligible: false,
            notes: '',
            is_active: true
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = methods;

    useEffect(() => {
        const fetchFamilies = async () => {
            try {
                const { data } = await axios.get('/family', { params: { limit: 1000 } });
                setFamilies(data.families || []);
            } catch (error) {
                console.error("Error fetching families", error);
            } finally {
                setLoadingFamilies(false);
            }
        };
        fetchFamilies();
    }, []);

    useEffect(() => {
        if (initialData) {
            reset({
                family_id: initialData.family_id?._id || initialData.family_id || '',
                householder_name: initialData.householder_name || '',
                address: initialData.address || '',
                primary_contact: initialData.primary_contact || '',
                economic_status: initialData.economic_status || 'Normal',
                zakat_eligible: initialData.zakat_eligible || false,
                notes: initialData.notes || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await axios.put(`/house/${initialData._id}`, data);
                toast.success(t('family.form.houseUpdated'));
            } else {
                await axios.post('/house/create', data);
                toast.success(t('family.form.houseSaved'));
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            // error handled by axios interceptor
        }
    };

    const familyOptions = families.map(f => ({
        value: f._id,
        label: `${f.family_name} (${f.family_code})`
    }));

    const economicOptions = [
        { value: 'Normal', label: 'Normal' },
        { value: 'Miskeen', label: 'Miskeen' },
        { value: 'Poor', label: 'Poor' }
    ];

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Family Selection */}
                    <div className="md:col-span-2">
                        <SearchableSelect
                            name="family_id"
                            label={t('family.form.selectFamily')}
                            options={familyOptions}
                            icon={Users}
                            required={true}
                            isLoading={loadingFamilies}
                            error={errors.family_id}
                        />
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.householderNameLabel')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Home size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.householder_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                    } rounded-xl  text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                placeholder={t('family.form.householderNamePlaceholder')}
                                {...register("householder_name", { required: t('family.form.householderNameRequired') })}
                            />
                        </div>
                        {errors.householder_name && (
                            <p className="mt-1.5  text-red-500">{errors.householder_name.message}</p>
                        )}
                    </div>

                    {/* Primary Contact */}
                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.primaryContactLabel')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.primary_contact ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                    } rounded-xl  text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                placeholder={t('family.form.primaryContactPlaceholder')}
                                {...register("primary_contact", { required: t('family.form.primaryContactRequired') })}
                            />
                        </div>
                        {errors.primary_contact && (
                            <p className="mt-1.5  text-red-500">{errors.primary_contact.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.addressLabel')}
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <MapPin size={18} className="text-gray-400" />
                            </div>
                            <textarea
                                rows={3}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                                placeholder={t('family.form.addressPlaceholder')}
                                {...register("address")}
                            />
                        </div>
                    </div>

                    {/* Economic Status */}
                    <div>
                        <SearchableSelect
                            name="economic_status"
                            label={t('family.form.economicStatusLabel')}
                            options={economicOptions}
                            error={errors.economic_status}
                        />
                    </div>

                    {/* Zakat Eligible (Checkbox) */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800 h-fit self-end ">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                {...register("zakat_eligible")}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                {t('family.form.zakatEligible')}
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.notesLabel')}
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <FileText size={18} className="text-gray-400" />
                            </div>
                            <textarea
                                rows={2}
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] focus:border-[#0B65F6] focus:outline-none transition-colors resize-none"
                                placeholder={t('family.form.notesPlaceholder')}
                                {...register("notes")}
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800 md:col-span-2 ">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                {...register("is_active")}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] dark:peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t('family.form.activeStatus')}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 bg-white dark:bg-[#1e1f25] border-t border-gray-100 dark:border-gray-800 -mx-6 -mb-6 p-6 sticky bottom-0 z-20">
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
                        {isEdit ? t('family.form.updateHouse') : t('family.form.saveHouse')}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}
