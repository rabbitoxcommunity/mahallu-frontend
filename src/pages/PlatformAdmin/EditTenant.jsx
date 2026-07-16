import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Building2,
  User,
  Shield,
  ArrowLeft,
  PenTool
} from 'lucide-react';
import axios from '../../api/axios';

export default function EditTenant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [slug, setSlug] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await axios.get(`/tenants/${id}`);
        const tenant = response.data.tenant;
        setSlug(tenant.slug);
        setSignaturePreview(tenant.signatorySignature || '');
        reset({
          name: tenant.name,
          nameMalayalam: tenant.nameMalayalam,
          address: tenant.address,
          addressMalayalam: tenant.addressMalayalam,
          regNo: tenant.regNo,
          signatoryName: tenant.signatoryName,
          signatoryTitle: tenant.signatoryTitle || 'Secretary'
        });
      } catch (error) {
        console.error('Error fetching tenant:', error);
        toast.error('Failed to load tenant details');
        navigate('/platform-admin/tenants');
      } finally {
        setFetching(false);
      }
    };

    fetchTenant();
  }, [id, navigate, reset]);

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('nameMalayalam', data.nameMalayalam || '');
      formData.append('address', data.address || '');
      formData.append('addressMalayalam', data.addressMalayalam || '');
      formData.append('regNo', data.regNo || '');
      formData.append('signatoryName', data.signatoryName || '');
      formData.append('signatoryTitle', data.signatoryTitle || 'Secretary');
      if (signatureFile) formData.append('signatorySignature', signatureFile);

      await axios.put(`/tenants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Tenant updated successfully!');
      navigate('/platform-admin/tenants');
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error(error.response?.data?.message || 'Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B65F6]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <button
          onClick={() => navigate('/platform-admin/tenants')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Tenants
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Tenant</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Update mahallu details for this tenant
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant Name / Mahallu Name *
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
                Mahallu Name (Malayalam)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  {...register('nameMalayalam')}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300"
                  placeholder="മഹല്ല് പേര്"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300 resize-none"
                  placeholder="Enter mahallu address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address (Malayalam)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  {...register('addressMalayalam')}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300 resize-none"
                  placeholder="മഹല്ല് വിലാസം"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registration No.
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  {...register('regNo')}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300"
                  placeholder="Enter registration number"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <PenTool size={16} />
                Signatory (shown on membership cards)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      {...register('signatoryName')}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300"
                      placeholder="Enter signatory's name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      {...register('signatoryTitle')}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:border-gray-800/60 dark:text-white border-gray-300"
                    >
                      <option value="Secretary">Secretary</option>
                      <option value="President">President</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                {signaturePreview && (
                  <img
                    src={signaturePreview}
                    alt="Signatory signature"
                    className="h-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white object-contain px-2"
                  />
                )}
                <label className="text-sm text-[#0B65F6] cursor-pointer hover:underline">
                  {signaturePreview ? 'Replace signature image' : 'Upload signature image'} (300x170px recommended)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={slug}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-[#252731] dark:border-gray-800/60 dark:text-gray-400 font-mono border-gray-300"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Slug cannot be changed after creation
              </p>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
