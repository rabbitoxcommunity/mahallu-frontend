import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { X, Gift, Home, UserX } from 'lucide-react';
import { getWelfarePrograms, searchHousesForSelect } from '../../../api/welfareService';

const getSelectStyles = (hasError = false) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: 'transparent',
    borderColor: hasError ? '#ef4444' : state.isFocused ? '#0B65F6' : 'transparent',
    borderRadius: '0.75rem',
    paddingTop: '0.125rem',
    paddingBottom: '0.125rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
    '&:hover': { borderColor: hasError ? '#ef4444' : '#0B65F6' }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 100
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#0B65F6' : state.isFocused ? '#f3f4f6' : 'transparent',
    color: state.isSelected ? '#fff' : '#374151',
    cursor: 'pointer'
  }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, color: 'inherit', fontSize: '0.875rem' }),
  input: (base) => ({ ...base, color: 'inherit' }),
  noOptionsMessage: (base) => ({ ...base, fontSize: '0.875rem' })
});

const DISTRIBUTION_TYPES = ['Cash', 'Food Kit', 'Medicine', 'Education', 'Marriage', 'House Repair', 'Emergency Relief', 'Other'];
const FUNDING_SOURCES = ['Zakat', 'Sadaqah', 'Donation', 'General Fund', 'Other'];

const DistributionFormModal = ({ isOpen, onClose, onSubmit, initialData, preselectedFamily }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const [programOptions, setProgramOptions] = useState([]);
  const [isExternal, setIsExternal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    getWelfarePrograms({ limit: 100, status: 'active' })
      .then(data => {
        setProgramOptions((data.programs || []).map(p => ({
          value: p._id,
          label: `${p.program_code} – ${p.program_name}`
        })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const ext = !!initialData.is_external;
        setIsExternal(ext);
        reset({
          family_id: !ext && initialData.family_id?._id
            ? { value: initialData.family_id._id, label: `${initialData.family_id.house_code} – ${initialData.family_id.householder_name}` }
            : null,
          beneficiary_name: initialData.beneficiary_name || '',
          beneficiary_contact: initialData.beneficiary_contact || '',
          program_id: initialData.program_id?._id
            ? { value: initialData.program_id._id, label: `${initialData.program_id.program_code} – ${initialData.program_id.program_name}` }
            : null,
          distribution_type: initialData.distribution_type || '',
          funding_source: initialData.funding_source || '',
          amount: initialData.amount || '',
          distribution_date: initialData.distribution_date ? initialData.distribution_date.split('T')[0] : '',
          notes: initialData.notes || ''
        });
      } else {
        setIsExternal(false);
        reset({
          family_id: preselectedFamily
            ? { value: preselectedFamily._id, label: `${preselectedFamily.house_code} – ${preselectedFamily.householder_name}` }
            : null,
          beneficiary_name: '',
          beneficiary_contact: '',
          program_id: null,
          distribution_type: '',
          funding_source: '',
          amount: '',
          distribution_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    }
  }, [isOpen, initialData, preselectedFamily, reset]);

  const loadFamilyOptions = useCallback(async (inputValue) => {
    try {
      return await searchHousesForSelect(inputValue);
    } catch {
      return [];
    }
  }, []);

  const handleFormSubmit = async (data) => {
    const payload = {
      is_external: isExternal,
      program_id: data.program_id?.value || data.program_id,
      distribution_type: data.distribution_type?.value || data.distribution_type,
      funding_source: data.funding_source?.value || data.funding_source,
      amount: data.amount,
      distribution_date: data.distribution_date,
      notes: data.notes
    };

    if (isExternal) {
      payload.beneficiary_name = data.beneficiary_name;
      payload.beneficiary_contact = data.beneficiary_contact;
    } else {
      payload.family_id = data.family_id?.value || data.family_id;
    }

    await onSubmit(payload);
  };

  const typeOptions = DISTRIBUTION_TYPES.map(t => ({ value: t, label: t }));
  const sourceOptions = FUNDING_SOURCES.map(s => ({ value: s, label: s }));

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252731] border ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  const selectWrapClass = (hasError) =>
    `bg-gray-50 dark:bg-[#252731] border ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white dark:bg-[#1e1f25] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Gift size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEdit ? t('welfare.distribution.editDistribution') : t('welfare.distribution.newDistribution')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEdit ? initialData.distribution_no : t('welfare.distribution.description')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">

              {/* Beneficiary Type Toggle */}
              <div>
                <label className={labelClass}>Beneficiary Type <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExternal(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      !isExternal
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-[#252731] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <Home size={15} />
                    Registered House
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExternal(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      isExternal
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-50 dark:bg-[#252731] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-400'
                    }`}
                  >
                    <UserX size={15} />
                    External / Walk-in
                  </button>
                </div>
              </div>

              {/* Conditional Beneficiary Fields */}
              {!isExternal ? (
                <div>
                  <label className={labelClass}>
                    {t('welfare.distribution.family')} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapClass(!!errors.family_id)}>
                    <Controller
                      name="family_id"
                      control={control}
                      rules={{ required: !isExternal ? t('welfare.distribution.familyRequired') : false }}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          cacheOptions
                          defaultOptions
                          loadOptions={loadFamilyOptions}
                          placeholder={t('welfare.distribution.selectFamily')}
                          styles={getSelectStyles(!!errors.family_id)}
                          isClearable
                          noOptionsMessage={() => 'Type to search families...'}
                          loadingMessage={() => 'Searching...'}
                        />
                      )}
                    />
                  </div>
                  {errors.family_id && <p className="mt-1 text-xs text-red-500">{errors.family_id.message}</p>}
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    This person is not registered in the Mahallu system.
                  </p>
                  <div>
                    <label className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('beneficiary_name', { required: isExternal ? 'Name is required' : false })}
                      placeholder="Enter beneficiary full name"
                      className={inputClass(!!errors.beneficiary_name)}
                    />
                    {errors.beneficiary_name && <p className="mt-1 text-xs text-red-500">{errors.beneficiary_name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Contact / ID Number</label>
                    <input
                      {...register('beneficiary_contact')}
                      placeholder="Phone number or ID proof number (optional)"
                      className={inputClass(false)}
                    />
                  </div>
                </div>
              )}

              {/* Distribution Date */}
              <div>
                <label className={labelClass}>
                  {t('welfare.distribution.distributionDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('distribution_date', { required: t('welfare.distribution.dateRequired') })}
                  className={inputClass(errors.distribution_date)}
                />
                {errors.distribution_date && <p className="mt-1 text-xs text-red-500">{errors.distribution_date.message}</p>}
              </div>

              {/* Program */}
              <div>
                <label className={labelClass}>
                  {t('welfare.distribution.program')} <span className="text-red-500">*</span>
                </label>
                <div className={selectWrapClass(!!errors.program_id)}>
                  <Controller
                    name="program_id"
                    control={control}
                    rules={{ required: t('welfare.distribution.programRequired') }}
                    render={({ field }) => (
                      <Select
                        options={programOptions}
                        value={field.value}
                        onChange={opt => field.onChange(opt)}
                        placeholder={t('welfare.distribution.selectProgram')}
                        styles={getSelectStyles(!!errors.program_id)}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => 'No active programs. Create one first.'}
                      />
                    )}
                  />
                </div>
                {errors.program_id && <p className="mt-1 text-xs text-red-500">{errors.program_id.message}</p>}
              </div>

              {/* Type + Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {t('welfare.distribution.distributionType')} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapClass(!!errors.distribution_type)}>
                    <Controller
                      name="distribution_type"
                      control={control}
                      rules={{ required: t('welfare.distribution.typeRequired') }}
                      render={({ field }) => (
                        <Select
                          options={typeOptions}
                          value={typeOptions.find(o => o.value === (field.value?.value || field.value)) || null}
                          onChange={opt => field.onChange(opt?.value || '')}
                          placeholder="Select type..."
                          styles={getSelectStyles(!!errors.distribution_type)}
                          isClearable
                        />
                      )}
                    />
                  </div>
                  {errors.distribution_type && <p className="mt-1 text-xs text-red-500">{errors.distribution_type.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    {t('welfare.distribution.fundingSource')} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapClass(!!errors.funding_source)}>
                    <Controller
                      name="funding_source"
                      control={control}
                      rules={{ required: t('welfare.distribution.sourceRequired') }}
                      render={({ field }) => (
                        <Select
                          options={sourceOptions}
                          value={sourceOptions.find(o => o.value === (field.value?.value || field.value)) || null}
                          onChange={opt => field.onChange(opt?.value || '')}
                          placeholder="Select source..."
                          styles={getSelectStyles(!!errors.funding_source)}
                          isClearable
                        />
                      )}
                    />
                  </div>
                  {errors.funding_source && <p className="mt-1 text-xs text-red-500">{errors.funding_source.message}</p>}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={labelClass}>
                  {t('welfare.distribution.amount')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    {...register('amount', {
                      required: t('welfare.distribution.amountRequired'),
                      min: { value: 0.01, message: t('welfare.distribution.amountPositive') }
                    })}
                    placeholder="0.00"
                    className={inputClass(errors.amount) + ' pl-8'}
                  />
                </div>
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>
                  {t('welfare.distribution.notes')}
                  <span className="text-gray-400 font-normal ml-1">({t('common.optional')})</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Additional notes about this distribution..."
                  className={inputClass(false) + ' resize-none'}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</>
                  ) : (
                    isEdit ? t('common.update') : t('common.save')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DistributionFormModal;
