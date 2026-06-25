import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import { createDeathRecord, updateDeathRecord, searchMembersForSelect } from '../../../api/deathService';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial Paid' },
    { value: 'pending', label: 'Pending' },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank', label: 'Bank Transfer' },
];

const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? '#0B65F6' : '#e5e7eb',
        borderRadius: '0.75rem',
        minHeight: '42px',
        boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
        '&:hover': { borderColor: '#0B65F6' },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        zIndex: 9999,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '0.875rem',
        backgroundColor: state.isSelected ? '#0B65F6' : state.isFocused ? '#f3f4f6' : 'transparent',
        color: state.isSelected ? '#fff' : '#374151',
        cursor: 'pointer',
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
    input: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
    clearIndicator: (base) => ({ ...base, padding: '4px', cursor: 'pointer' }),
    dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
    noOptionsMessage: (base) => ({ ...base, fontSize: '0.875rem' }),
});

const calculateAge = (dob, dateOfDeath) => {
    if (!dob || !dateOfDeath) return null;
    const birth = new Date(dob);
    const death = new Date(dateOfDeath);
    if (isNaN(birth) || isNaN(death)) return null;
    let age = death.getFullYear() - birth.getFullYear();
    const m = death.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : null;
};

const toDateInput = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return '';
    return date.toISOString().split('T')[0];
};

const InputField = ({ label, error, children, required }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252731] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const readOnlyClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1e1f25] text-gray-700 dark:text-gray-300 text-sm cursor-default';

const SectionHeader = ({ title }) => (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
    </div>
);

const DeathFormModal = ({ editRecord, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const isEdit = !!editRecord;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            is_registered_member: true,
            member: null,
            name: '',
            gender: null,
            dob: '',
            father_name: '',
            mother_name: '',
            spouse_name: '',
            primary_contact: '',
            date_of_death: '',
            time_of_death: '',
            place_of_death: '',
            cause_of_death: '',
            hospital: '',
            janaza_date: '',
            janaza_time: '',
            charge_applicable: false,
            charge_amount: '',
            payment_status: null,
            payment_method: null,
            notes: '',
        },
    });

    const isRegisteredMember = watch('is_registered_member');
    const chargeApplicable = watch('charge_applicable');
    const dobVal = watch('dob');
    const dateOfDeathVal = watch('date_of_death');

    const calculatedAge = calculateAge(dobVal, dateOfDeathVal);

    // Populate form when editing
    useEffect(() => {
        if (editRecord) {
            reset({
                is_registered_member: editRecord.is_registered_member || false,
                member: null,
                name: editRecord.name || '',
                gender: editRecord.gender
                    ? { value: editRecord.gender, label: editRecord.gender }
                    : null,
                dob: toDateInput(editRecord.dob),
                father_name: editRecord.father_name || '',
                mother_name: editRecord.mother_name || '',
                spouse_name: editRecord.spouse_name || '',
                primary_contact: editRecord.primary_contact || '',
                date_of_death: toDateInput(editRecord.date_of_death),
                time_of_death: editRecord.time_of_death || '',
                place_of_death: editRecord.place_of_death || '',
                cause_of_death: editRecord.cause_of_death || '',
                hospital: editRecord.hospital || '',
                janaza_date: toDateInput(editRecord.janaza_date),
                janaza_time: editRecord.janaza_time || '',
                charge_applicable: editRecord.charge_applicable || false,
                charge_amount: editRecord.charge_amount || '',
                payment_status: editRecord.payment_status
                    ? PAYMENT_STATUS_OPTIONS.find(o => o.value === editRecord.payment_status) || null
                    : null,
                payment_method: editRecord.payment_method
                    ? PAYMENT_METHOD_OPTIONS.find(o => o.value === editRecord.payment_method) || null
                    : null,
                notes: editRecord.notes || '',
            });
        }
    }, [editRecord, reset]);

    const loadMemberOptions = useCallback(async (inputValue) => {
        if (!inputValue || inputValue.length < 2) return [];
        try {
            return await searchMembersForSelect(inputValue);
        } catch {
            return [];
        }
    }, []);

    // When member selected, auto-fill fields
    const handleMemberSelect = (option) => {
        setValue('member', option);
        if (option && option.member) {
            const m = option.member;
            setValue('name', m.full_name || '');
            setValue('gender', m.gender ? { value: m.gender, label: m.gender } : null);
            setValue('dob', toDateInput(m.dob));
            setValue('primary_contact', m.contact_number || m.whatsapp || '');
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                is_registered_member: data.is_registered_member,
                member_id: data.is_registered_member && data.member ? data.member.value : undefined,
                name: data.name,
                gender: data.gender ? data.gender.value : undefined,
                dob: data.dob || undefined,
                father_name: data.father_name || undefined,
                mother_name: data.mother_name || undefined,
                spouse_name: data.spouse_name || undefined,
                primary_contact: data.primary_contact || undefined,
                date_of_death: data.date_of_death,
                time_of_death: data.time_of_death || undefined,
                place_of_death: data.place_of_death || undefined,
                cause_of_death: data.cause_of_death || undefined,
                hospital: data.hospital || undefined,
                janaza_date: data.janaza_date || undefined,
                janaza_time: data.janaza_time || undefined,
                charge_applicable: data.charge_applicable,
                charge_amount: data.charge_applicable ? Number(data.charge_amount) || 0 : 0,
                payment_status: data.charge_applicable && data.payment_status ? data.payment_status.value : undefined,
                payment_method: data.charge_applicable && data.payment_method ? data.payment_method.value : undefined,
                notes: data.notes || undefined,
            };

            if (isEdit) {
                await updateDeathRecord(editRecord._id, payload);
                toast.success(t('death.form.updated'));
            } else {
                await createDeathRecord(payload);
                toast.success(t('death.form.created'));
            }
            onSuccess();
        } catch (e) {
            // handled by interceptor
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isEdit ? t('death.form.editTitle') : t('death.form.title')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="overflow-y-auto flex-1 p-5 space-y-6"
                    >
                        {/* Section 1: Member Information */}
                        <div>
                            <SectionHeader title={t('death.form.section1')} />

                            {/* Toggle: Registered Member / New Entry */}
                            {!isEdit && (
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setValue('is_registered_member', true)}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${isRegisteredMember
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                                            }`}
                                    >
                                        {t('death.form.registeredMember')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('is_registered_member', false)}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${!isRegisteredMember
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                                            }`}
                                    >
                                        {t('death.form.newEntry')}
                                    </button>
                                </div>
                            )}

                            {/* Member Search */}
                            {isRegisteredMember && !isEdit && (
                                <div className="mb-4">
                                    <InputField label={t('death.form.searchMember')}>
                                        <Controller
                                            name="member"
                                            control={control}
                                            render={({ field }) => (
                                                <AsyncSelect
                                                    {...field}
                                                    loadOptions={loadMemberOptions}
                                                    onChange={handleMemberSelect}
                                                    placeholder={t('death.form.searchMember')}
                                                    styles={getSelectStyles()}
                                                    noOptionsMessage={({ inputValue }) =>
                                                        inputValue.length < 2
                                                            ? 'Type at least 2 characters to search'
                                                            : 'No members found'
                                                    }
                                                    isClearable
                                                />
                                            )}
                                        />
                                    </InputField>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label={t('death.form.name')} error={errors.name?.message} required>
                                    <input
                                        {...register('name', { required: t('death.form.nameRequired') })}
                                        readOnly={isRegisteredMember && !isEdit}
                                        className={isRegisteredMember && !isEdit ? readOnlyClass : inputClass}
                                        placeholder={t('death.form.name')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.gender')}>
                                    {isRegisteredMember && !isEdit ? (
                                        <input
                                            value={watch('gender')?.label || ''}
                                            readOnly
                                            className={readOnlyClass}
                                        />
                                    ) : (
                                        <Controller
                                            name="gender"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={GENDER_OPTIONS}
                                                    placeholder={t('death.form.gender')}
                                                    styles={getSelectStyles()}
                                                    isClearable
                                                />
                                            )}
                                        />
                                    )}
                                </InputField>

                                <InputField label={t('death.form.dob')}>
                                    <input
                                        type="date"
                                        {...register('dob')}
                                        readOnly={isRegisteredMember && !isEdit}
                                        className={isRegisteredMember && !isEdit ? readOnlyClass : inputClass}
                                    />
                                </InputField>

                                <InputField label={t('death.form.contact')}>
                                    <input
                                        {...register('primary_contact')}
                                        readOnly={isRegisteredMember && !isEdit}
                                        className={isRegisteredMember && !isEdit ? readOnlyClass : inputClass}
                                        placeholder={t('death.form.contact')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.fatherName')}>
                                    <input
                                        {...register('father_name')}
                                        className={inputClass}
                                        placeholder={t('death.form.fatherName')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.motherName')}>
                                    <input
                                        {...register('mother_name')}
                                        className={inputClass}
                                        placeholder={t('death.form.motherName')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.spouseName')}>
                                    <input
                                        {...register('spouse_name')}
                                        className={inputClass}
                                        placeholder={t('death.form.spouseName')}
                                    />
                                </InputField>
                            </div>
                        </div>

                        {/* Section 2: Death Information */}
                        <div>
                            <SectionHeader title={t('death.form.section2')} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label={t('death.form.dateOfDeath')} error={errors.date_of_death?.message} required>
                                    <input
                                        type="date"
                                        {...register('date_of_death', { required: t('death.form.dateRequired') })}
                                        className={inputClass}
                                    />
                                </InputField>

                                <InputField label={t('death.form.timeOfDeath')}>
                                    <input
                                        type="time"
                                        {...register('time_of_death')}
                                        className={inputClass}
                                    />
                                </InputField>

                                <InputField label={t('death.form.age')}>
                                    <input
                                        type="number"
                                        value={calculatedAge !== null ? calculatedAge : ''}
                                        readOnly
                                        className={readOnlyClass}
                                        placeholder="Auto-calculated"
                                    />
                                </InputField>

                                <InputField label={t('death.form.placeOfDeath')}>
                                    <input
                                        {...register('place_of_death')}
                                        className={inputClass}
                                        placeholder={t('death.form.placeOfDeath')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.causeOfDeath')}>
                                    <input
                                        {...register('cause_of_death')}
                                        className={inputClass}
                                        placeholder={t('death.form.causeOfDeath')}
                                    />
                                </InputField>

                                <InputField label={t('death.form.hospital')}>
                                    <input
                                        {...register('hospital')}
                                        className={inputClass}
                                        placeholder={t('death.form.hospital')}
                                    />
                                </InputField>
                            </div>
                        </div>

                        {/* Section 3: Janaza Information */}
                        <div>
                            <SectionHeader title={t('death.form.section3')} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label={t('death.form.janazaDate')}>
                                    <input
                                        type="date"
                                        {...register('janaza_date')}
                                        className={inputClass}
                                    />
                                </InputField>

                                <InputField label={t('death.form.janazaTime')}>
                                    <input
                                        type="time"
                                        {...register('janaza_time')}
                                        className={inputClass}
                                    />
                                </InputField>

                            </div>
                        </div>

                        {/* Section 4: Burial & Janaza Charges */}
                        <div>
                            <SectionHeader title={t('death.form.section4')} />

                            {/* Toggle Yes/No */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setValue('charge_applicable', true)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${chargeApplicable
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                                        }`}
                                >
                                    {t('common.yes')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('charge_applicable', false)}
                                    className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${!chargeApplicable
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                                        }`}
                                >
                                    {t('common.no')}
                                </button>
                            </div>

                            {chargeApplicable && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InputField
                                        label={t('death.form.chargeAmount')}
                                        error={errors.charge_amount?.message}
                                        required
                                    >
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...register('charge_amount', {
                                                    required: chargeApplicable ? t('death.form.amountRequired') : false,
                                                })}
                                                className={`${inputClass} pl-7`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </InputField>

                                    <InputField label={t('death.form.paymentStatus')}>
                                        <Controller
                                            name="payment_status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={PAYMENT_STATUS_OPTIONS}
                                                    placeholder={t('death.form.paymentStatus')}
                                                    styles={getSelectStyles()}
                                                />
                                            )}
                                        />
                                    </InputField>

                                    <InputField label={t('death.form.paymentMethod')}>
                                        <Controller
                                            name="payment_method"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={PAYMENT_METHOD_OPTIONS}
                                                    placeholder={t('death.form.paymentMethod')}
                                                    styles={getSelectStyles()}
                                                />
                                            )}
                                        />
                                    </InputField>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <InputField label={t('death.form.notes')}>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                    placeholder={t('death.form.notes')}
                                />
                            </InputField>
                        </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            form="death-form"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            {isSubmitting ? t('common.loading') : t('death.form.saveBtn')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeathFormModal;
