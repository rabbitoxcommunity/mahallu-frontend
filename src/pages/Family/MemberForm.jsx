import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, User, Calendar, Heart, Shield, GraduationCap, Briefcase, Droplets, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import SearchableSelect from '../../components/ui/SearchableSelect';

export default function MemberForm({ initialData, onSuccess, onCancel, defaultHouseId }) {
    const { t } = useTranslation();
    const isEdit = !!initialData?._id;
    const [houses, setHouses] = useState([]);
    const [loadingHouses, setLoadingHouses] = useState(true);

    const [isWhatsappSame, setIsWhatsappSame] = useState(false);

    const methods = useForm({
        defaultValues: {
            house_id: defaultHouseId || '',
            full_name: '',
            dob: '',
            gender: 'Male',
            relation_to_head: '',
            whatsapp: '',
            contact_number: '',
            yateem_status: false,
            marital_status: 'Single',
            religious_education: '',
            general_education: '',
            occupation: '',
            monthly_income: 0,
            blood_group: '',
            medical_notes: '',
            skills: '',
            is_family_head: false,
            is_active: true
        }
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = methods;
    const contactNumber = watch("contact_number");

    useEffect(() => {
        if (isWhatsappSame) {
            setValue("whatsapp", contactNumber);
        }
    }, [isWhatsappSame, contactNumber, setValue]);

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                const { data } = await axios.get('/house', { params: { limit: 1000 } });
                setHouses(data.houses || []);
            } catch (error) {
                console.error("Error fetching houses", error);
            } finally {
                setLoadingHouses(false);
            }
        };
        fetchHouses();
    }, []);

    useEffect(() => {
        if (initialData) {
            reset({
                house_id: initialData.house_id?._id || initialData.house_id || defaultHouseId || '',
                full_name: initialData.full_name || '',
                dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
                gender: initialData.gender || 'Male',
                relation_to_head: initialData.relation_to_head || '',
                whatsapp: initialData.whatsapp || '',
                contact_number: initialData.contact_number || '',
                yateem_status: initialData.yateem_status || false,
                marital_status: initialData.marital_status || 'Single',
                religious_education: initialData.religious_education || '',
                general_education: initialData.general_education || '',
                occupation: initialData.occupation || '',
                monthly_income: initialData.monthly_income || 0,
                blood_group: initialData.blood_group || '',
                medical_notes: initialData.medical_notes || '',
                skills: initialData.skills || '',
                is_family_head: initialData.is_family_head || false,
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData, reset, defaultHouseId]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await axios.put(`/member/${initialData._id}`, data);
                toast.success(t('family.form.memberUpdated'));
            } else {
                await axios.post('/member/add', data);
                toast.success(t('family.form.memberSaved'));
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            // error handled by interceptor
        }
    };

    const houseOptions = houses.map(h => ({
        value: h._id,
        label: `${h.householder_name} (${h.house_code}) - ${h.family_id?.family_name || 'No Family'}`
    }));

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ];

    const maritalOptions = [
        { value: 'Single', label: 'Single' },
        { value: 'Married', label: 'Married' },
        { value: 'Widow', label: 'Widow' },
        { value: 'Divorced', label: 'Divorced' }
    ];

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">

                {/* Select House Section */}
                <div className="bg-gray-50 dark:bg-[#16171d] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className=" font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Info size={18} className="text-[#0B65F6]" />
                        {t('family.form.houseSelection')}
                    </h3>
                    <div className="max-w-md ">
                        <SearchableSelect
                            name="house_id"
                            label={t('family.form.houseLabel')}
                            options={houseOptions}
                            isLoading={loadingHouses}
                            required={true}
                            error={errors.house_id}
                        />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <h3 className=" font-semibold text-gray-900 dark:text-white">{t('family.form.basicInformation')}</h3>
                    </div>

                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.fullNameLabel')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border ${errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-[#0B65F6]'
                                    } rounded-xl  text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-colors`}
                                placeholder={t('family.form.fullNamePlaceholder')}
                                {...register("full_name", { required: t('family.form.fullNameRequired') })}
                            />
                        </div>
                        {errors.full_name && (
                            <p className="mt-1.5  text-red-500">{errors.full_name.message}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="">
                        <SearchableSelect
                            name="gender"
                            label={t('family.form.genderLabel')}
                            options={genderOptions}
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">{t('family.form.dobLabel')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                {...register("dob")}
                            />
                        </div>
                    </div>

                    {/* Relation to Head */}
                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">{t('family.form.relationToHeadLabel')}</label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            placeholder={t('family.form.relationToHeadPlaceholder')}
                            {...register("relation_to_head")}
                        />
                    </div>

                    {/* Marital Status */}
                    <div className="">
                        <SearchableSelect
                            name="marital_status"
                            label={t('family.form.maritalStatusLabel')}
                            options={maritalOptions}
                        />
                    </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white dark:bg-[#1e1f25] pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className=" font-semibold text-gray-900 dark:text-white">{t('family.form.contactDetails')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('family.form.contactNumberLabel')}
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            placeholder="e.g. 9876543210"
                            {...register("contact_number")}
                        />
                    </div>

                    <div className="flex flex-col gap-2 justify-start">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300">
                            {t('family.form.whatsappNumberLabel')}
                        </label>
                        {!isWhatsappSame && (
                            <input
                                type="text"
                                className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                                placeholder="e.g. 9876543210"
                                {...register("whatsapp")}
                            />
                        )}
                        <label className="flex items-center gap-2  text-gray-600 dark:text-gray-400 cursor-pointer mt-1">
                            <input 
                                type="checkbox" 
                                checked={isWhatsappSame} 
                                onChange={(e) => setIsWhatsappSame(e.target.checked)}
                                className="rounded text-[#0B65F6] focus:ring-[#0B65F6] dark:bg-gray-800 dark:border-gray-700" 
                            />
                            {t('family.form.whatsappSameAsContact')}
                        </label>
                    </div>
                </div>

                {/* Education & Work */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="md:col-span-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <h3 className=" font-semibold text-gray-900 dark:text-white">{t('family.form.educationCareer')}</h3>
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <GraduationCap size={16} /> {t('family.form.religiousEducationLabel')}
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            {...register("religious_education")}
                        />
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <GraduationCap size={16} /> {t('family.form.generalEducationLabel')}
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            {...register("general_education")}
                        />
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <Briefcase size={16} /> {t('family.form.occupationLabel')}
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            {...register("occupation")}
                        />
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">{t('family.form.monthlyIncomeLabel')}</label>
                        <input
                            type="number"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            {...register("monthly_income")}
                        />
                    </div>
                </div>

                {/* Health & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="md:col-span-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <h3 className=" font-semibold text-gray-900 dark:text-white">{t('family.form.healthSkills')}</h3>
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <Droplets size={16} className="text-red-500" /> {t('family.form.bloodGroupLabel')}
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            placeholder={t('family.form.bloodGroupPlaceholder')}
                            {...register("blood_group")}
                        />
                    </div>

                    <div>
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">{t('family.form.skillsLabel')}</label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none"
                            placeholder={t('family.form.skillsPlaceholder')}
                            {...register("skills")}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">{t('family.form.medicalNotesLabel')}</label>
                        <textarea
                            rows={2}
                            className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-[#16171d] border border-gray-200 dark:border-gray-800 rounded-xl  text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B65F6] outline-none resize-none"
                            {...register("medical_notes")}
                        />
                    </div>
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 ">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" {...register("is_family_head")} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <span className="font-medium text-gray-900 dark:text-white">{t('family.form.isFamilyHead')}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" {...register("yateem_status")} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <span className="font-medium text-gray-900 dark:text-white">{t('family.form.yateemStatus')}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#16171d] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" {...register("is_active")} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0B65F6] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B65F6]"></div>
                        </label>
                        <span className="font-medium text-gray-900 dark:text-white">{t('family.form.active')}</span>
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
                        className="flex items-center justify-center gap-2 px-8 py-2.5  font-semibold text-white bg-[#0B65F6] rounded-xl hover:bg-[#0653d1] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isEdit ? t('family.form.updateMember') : t('family.form.saveMember')}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}
