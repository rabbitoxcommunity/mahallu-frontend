import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { X, FolderHeart, DollarSign, Calendar, FileText } from 'lucide-react';

const getSelectStyles = () => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: 'transparent',
    borderColor: state.isFocused ? '#0B65F6' : 'transparent',
    borderRadius: '0.75rem',
    paddingTop: '0.125rem',
    paddingBottom: '0.125rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0B65F6' : 'none',
    '&:hover': { borderColor: '#0B65F6' }
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
  input: (base) => ({ ...base, color: 'inherit' })
});

const FUNDING_SOURCES = ['Zakat', 'Sadaqah', 'Donation', 'General Fund', 'Other'];
const STATUS_OPTIONS = ['active', 'inactive', 'completed'];

const ProgramFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      program_name: '',
      description: '',
      budget: '',
      funding_source: '',
      start_date: '',
      end_date: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          program_name: initialData.program_name || '',
          description: initialData.description || '',
          budget: initialData.budget || '',
          funding_source: initialData.funding_source || '',
          start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
          end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
          status: initialData.status || 'active'
        });
      } else {
        reset({
          program_name: '',
          description: '',
          budget: '',
          funding_source: '',
          start_date: '',
          end_date: '',
          status: 'active'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
  };

  const sourceOptions = FUNDING_SOURCES.map(s => ({ value: s, label: s }));
  const statusOptions = STATUS_OPTIONS.map(s => ({
    value: s,
    label: t(`welfare.programs.statusOptions.${s}`)
  }));

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252731] border ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

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
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <FolderHeart size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEdit ? t('welfare.programs.editProgram') : t('welfare.programs.addProgram')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEdit ? initialData.program_code : t('welfare.programs.description')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
              {/* Program Name */}
              <div>
                <label className={labelClass}>
                  {t('welfare.programs.programName')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('program_name', { required: t('welfare.programs.nameRequired') })}
                  placeholder={t('welfare.programs.namePlaceholder')}
                  className={inputClass(errors.program_name)}
                />
                {errors.program_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.program_name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>{t('welfare.programs.description')}</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder={t('welfare.programs.descriptionPlaceholder')}
                  className={inputClass(false) + ' resize-none'}
                />
              </div>

              {/* Budget + Funding Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('welfare.programs.budget')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      onWheel={(e) => e.target.blur()}
                      {...register('budget', { min: { value: 0, message: 'Must be 0 or more' } })}
                      placeholder="0.00"
                      className={inputClass(errors.budget) + ' pl-8'}
                    />
                  </div>
                  {errors.budget && (
                    <p className="mt-1 text-xs text-red-500">{errors.budget.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    {t('welfare.programs.fundingSource')} <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                    <Controller
                      name="funding_source"
                      control={control}
                      rules={{ required: t('welfare.programs.sourceRequired') }}
                      render={({ field }) => (
                        <Select
                          options={sourceOptions}
                          value={sourceOptions.find(o => o.value === field.value) || null}
                          onChange={opt => field.onChange(opt?.value || '')}
                          placeholder="Select source..."
                          styles={getSelectStyles()}
                          isClearable
                        />
                      )}
                    />
                  </div>
                  {errors.funding_source && (
                    <p className="mt-1 text-xs text-red-500">{errors.funding_source.message}</p>
                  )}
                </div>
              </div>

              {/* Start + End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('welfare.programs.startDate')}</label>
                  <input
                    type="date"
                    {...register('start_date')}
                    className={inputClass(false)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('welfare.programs.endDate')}</label>
                  <input
                    type="date"
                    {...register('end_date')}
                    className={inputClass(false)}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>{t('welfare.programs.status')}</label>
                <div className="bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={statusOptions}
                        value={statusOptions.find(o => o.value === field.value) || null}
                        onChange={opt => field.onChange(opt?.value || 'active')}
                        placeholder="Select status..."
                        styles={getSelectStyles()}
                      />
                    )}
                  />
                </div>
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

export default ProgramFormModal;
