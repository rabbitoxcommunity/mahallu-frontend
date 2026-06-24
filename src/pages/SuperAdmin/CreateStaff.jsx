import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Mail,
  User,
  Key,
  ArrowLeft,
  CheckCircle,
  Home,
  Users,
  Settings,
  FileText
} from 'lucide-react';
import axios from '../../api/axios';
import { permissionModules } from '../../configs/permissionModules';

export default function CreateStaff() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [createdStaff, setCreatedStaff] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      role: 'admin' // Always set to admin for staff creation
    }
  });

  const selectedPermissions = watch('permissions', {});

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('/users/create', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin', // Force admin role
        permissions: data.permissions
      });

      setCreatedStaff({
        user: response.data.user,
        plainPassword: data.password
      });

      toast.success(t('superAdmin.staffCreatedToast'));
    } catch (error) {
      console.error('Error creating staff:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('superAdmin.staffCreateFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (moduleKey) => {
    const currentPermissions = getValues('permissions') || {};
    setValue('permissions', {
      ...currentPermissions,
      [moduleKey]: !currentPermissions[moduleKey]
    });
  };

  if (createdStaff) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('superAdmin.staffCreatedSuccess')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('superAdmin.staffCreatedSuccessDesc')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                {t('superAdmin.staffDetails')}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className=" font-medium text-gray-500 dark:text-gray-400">{t('superAdmin.staffName')}</label>
                  <p className="text-gray-900 dark:text-white">{createdStaff.user.name}</p>
                </div>
                <div>
                  <label className=" font-medium text-gray-500 dark:text-gray-400">{t('superAdmin.staffEmail')}</label>
                  <p className="text-gray-900 dark:text-white">{createdStaff.user.email}</p>
                </div>
                <div>
                  <label className=" font-medium text-gray-500 dark:text-gray-400">{t('superAdmin.staffRole')}</label>
                  <p className="text-gray-900 dark:text-white capitalize">{createdStaff.user.role}</p>
                </div>
                <div>
                  <label className=" font-medium text-gray-500 dark:text-gray-400">{t('superAdmin.staffPassword')}</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 dark:text-white font-mono">{createdStaff.plainPassword}</p>
                    <span className=" text-amber-600 dark:text-amber-400 font-medium">
                      {t('superAdmin.sharePassword')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                {t('superAdmin.assignedPermissions')}
              </h3>
              <div className="space-y-2">
                {Object.entries(createdStaff.user.permissions).map(([key, enabled]) => {
                  const module = permissionModules.find(m => m.key === key);
                  if (!module) return null;

                  return (
                    <div key={key} className="flex items-center gap-2">
                      {enabled ? (
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                      <span className=" text-gray-900 dark:text-white">{t(module.label)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className=" text-amber-800 dark:text-amber-200">
                  {t('superAdmin.successMessage')}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/super-admin/staff')}
                className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
              >
                {t('superAdmin.viewAllStaff')}
              </button>
              <button
                onClick={() => {
                  setCreatedStaff(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
              >
                {t('superAdmin.createAnotherStaff')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate('/super-admin/staff')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          {t('superAdmin.backToStaff')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('superAdmin.createNewStaff')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('superAdmin.createNewStaffDesc')}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                {t('superAdmin.staffInformation')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('superAdmin.staffName')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      {...register('name', { required: t('superAdmin.nameRequired') })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('superAdmin.staffNamePlaceholder')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1  text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('superAdmin.staffEmail')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      {...register('email', {
                        required: t('superAdmin.emailRequired'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('superAdmin.invalidEmail')
                        }
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('superAdmin.staffEmailPlaceholder')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1  text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('superAdmin.staffPassword')} *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      {...register('password', {
                        required: t('superAdmin.passwordRequired'),
                        minLength: {
                          value: 6,
                          message: t('superAdmin.passwordMinLength')
                        }
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('superAdmin.staffPasswordPlaceholder')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1  text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block  font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('superAdmin.staffRole')}
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={t('superAdmin.adminRole')}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-800/60 rounded-lg bg-gray-100 dark:bg-[#252731] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      readOnly
                    />
                    <input type="hidden" {...register('role')} value="admin" />
                  </div>
                  <p className="mt-1  text-gray-500 dark:text-gray-400">
                    {t('superAdmin.adminRoleNote')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/60 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                {t('superAdmin.modulePermissions')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionModules.map((module) => {
                  const Icon = module.icon;
                  const isEnabled = selectedPermissions[module.key] || false;
                  
                  return (
                    <div
                      key={module.key}
                      className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                        isEnabled
                          ? 'border-[#0B65F6] bg-[#0B65F6]/5 dark:bg-[#0B65F6]/10'
                          : 'border-gray-200 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      onClick={() => handlePermissionToggle(module.key)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isEnabled
                            ? 'bg-[#0B65F6]/10 dark:bg-[#0B65F6]/20'
                            : 'bg-gray-100 dark:bg-[#252731]'
                        }`}>
                          <Icon
                            size={20}
                            className={`${
                              isEnabled
                                ? 'text-[#0B65F6] dark:text-[#0B65F6]'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {t(module.label)}
                            </h4>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isEnabled
                                ? 'border-[#0B65F6] bg-[#0B65F6]'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isEnabled && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className=" text-gray-500 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        {...register(`permissions.${module.key}`)}
                        checked={isEnabled}
                        onChange={() => {}}
                        className="sr-only"
                      />
                    </div>
                  );
                })}
              </div>
              
              <p className="mt-4  text-gray-500 dark:text-gray-400">
                {t('superAdmin.modulePermissionsNote')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/super-admin/staff')}
              className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
            >
              {t('superAdmin.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('superAdmin.creating') : t('superAdmin.createStaffBtn')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
