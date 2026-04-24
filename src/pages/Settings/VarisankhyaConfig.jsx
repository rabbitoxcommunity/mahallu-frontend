import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Save, Settings } from 'lucide-react';
import {
  getConfigs,
  createOrUpdateConfig
} from '../../api/varisankhyaConfigService';

const VarisankhyaConfig = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm();

  const categoryOptions = [
    { value: 'Normal', label: t('finance.settings.varisankhyaConfig.normal') },
    { value: 'Poor', label: t('finance.settings.varisankhyaConfig.poor') },
    { value: 'Miskeen', label: t('finance.settings.varisankhyaConfig.miskeen') }
  ];

  // Fetch configs on mount
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getConfigs();
      setConfigs(data);
      
      // Pre-fill form with existing configs
      data.forEach(config => {
        setValue(`config_${config.category}`, config.monthly_amount);
      });
    } catch (error) {
      toast.error(t('finance.settings.varisankhyaConfig.configError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const promises = categoryOptions.map(async (option) => {
        const amount = data[`config_${option.value}`];
        if (amount !== undefined && amount !== null && amount !== '') {
          return createOrUpdateConfig({
            category: option.value,
            monthly_amount: Number(amount),
            is_active: true
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(t('finance.settings.varisankhyaConfig.configSaved'));
      await fetchConfigs();
    } catch (error) {
      toast.error(t('finance.settings.varisankhyaConfig.configError'));
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Settings size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('finance.settings.varisankhyaConfig.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('finance.settings.varisankhyaConfig.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryOptions.map((option) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryOptions.indexOf(option) * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {option.label}
                </label>
                <input
                  type="number"
                  {...register(`config_${option.value}`, {
                    required: t('finance.settings.varisankhyaConfig.amountRequired'),
                    min: { value: 0, message: t('finance.settings.varisankhyaConfig.amountPositive') }
                  })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252731] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder={t('finance.settings.varisankhyaConfig.monthlyAmount')}
                />
                {errors[`config_${option.value}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`config_${option.value}`].message}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              {isSubmitting ? t('common.loading') : t('finance.settings.varisankhyaConfig.save')}
            </button>
          </div>
        </form>
      </div>

      {/* Config Table */}
      <div className="bg-white dark:bg-[#1e1f25] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('finance.settings.varisankhyaConfig.title')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t('finance.settings.varisankhyaConfig.category')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t('finance.settings.varisankhyaConfig.monthlyAmount')}
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {t('finance.settings.varisankhyaConfig.isActive')}
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryOptions.map((option) => {
                const config = configs.find(c => c.category === option.value);
                return (
                  <tr key={option.value} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white font-medium">
                      {config ? `₹${config.monthly_amount}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {config ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">
                          {t('common.active')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                          {t('common.inactive')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VarisankhyaConfig;
