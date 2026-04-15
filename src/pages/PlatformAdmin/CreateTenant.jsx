import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Shield, 
  Mail, 
  User, 
  Key, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from '../../api/axios';

export default function CreateTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm();

  const tenantName = watch('name', '');
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('/tenants/create', {
        name: data.name,
        slug: data.slug,
        superAdminName: data.superAdminName,
        superAdminEmail: data.superAdminEmail,
        password: data.password
      });

      setCreatedCredentials({
        tenant: response.data.tenant,
        superAdmin: response.data.superAdmin,
        plainPassword: data.password
      });

      toast.success('Tenant created successfully!');
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('slug')) {
          setError('slug', { message: 'This slug is already taken' });
        } else if (error.response.data.message.includes('email')) {
          setError('superAdminEmail', { message: 'This email is already registered' });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to create tenant');
      }
    } finally {
      setLoading(false);
    }
  };

  if (createdCredentials) {
    return (
      <div className="max-w-2xl mx-auto">
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
              Tenant Created Successfully!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your tenant and super admin account have been created
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#252731] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 size={20} />
                Tenant Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{createdCredentials.tenant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</label>
                  <p className="text-gray-900 dark:text-white font-mono">{createdCredentials.tenant.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white capitalize">{createdCredentials.tenant.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Super Admin Credentials
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{createdCredentials.superAdmin.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{createdCredentials.superAdmin.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 dark:text-white font-mono">{createdCredentials.plainPassword}</p>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Save this password
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> Please save these credentials securely. 
                  The super admin password will not be shown again.
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/platform-admin/tenants')}
                className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
              >
                View All Tenants
              </button>
              <button
                onClick={() => {
                  setCreatedCredentials(null);
                  // Reset form
                }}
                className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
              >
                Create Another Tenant
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/platform-admin/tenants')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Tenants
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Tenant</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Set up a new tenant organization with super admin credentials
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 size={20} />
                Tenant Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenant Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      {...register('name', { required: 'Tenant name is required' })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter tenant name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      {...register('slug', { 
                        required: 'Slug is required',
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: 'Slug can only contain lowercase letters, numbers, and hyphens'
                        }
                      })}
                      value={generateSlug(tenantName)}
                      onChange={(e) => {
                        // Allow manual override of slug
                        document.querySelector('input[name="slug"]').value = e.target.value;
                      }}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white font-mono ${
                        errors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="tenant-slug"
                    />
                  </div>
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Unique identifier for the tenant (auto-generated from name)
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/60 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Super Admin Account
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Super Admin Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      {...register('superAdminName', { required: 'Super admin name is required' })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.superAdminName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter super admin name"
                    />
                  </div>
                  {errors.superAdminName && (
                    <p className="mt-1 text-sm text-red-500">{errors.superAdminName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Super Admin Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      {...register('superAdminEmail', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.superAdminEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="admin@tenant.com"
                    />
                  </div>
                  {errors.superAdminEmail && (
                    <p className="mt-1 text-sm text-red-500">{errors.superAdminEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/platform-admin/tenants')}
              className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
