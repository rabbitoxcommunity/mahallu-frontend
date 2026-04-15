import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  Users, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  Settings,
  Home,
  FileText,
  CreditCard,
  BarChart,
  Calendar,
  Loader2
} from 'lucide-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const permissionModules = [
  { key: 'family', label: 'Family Management', icon: Users, description: 'Manage family records and members' },
  { key: 'payments', label: 'Payments', icon: CreditCard, description: 'Handle payments and transactions' },
  { key: 'campaigns', label: 'Campaigns', icon: Calendar, description: 'Manage campaigns and events' },
  { key: 'reports', label: 'Reports', icon: BarChart, description: 'View and generate reports' },
  { key: 'settings', label: 'Settings', icon: Settings, description: 'Access system settings' }
];

export default function EditStaffPermissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { refreshPermissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch
  } = useForm();

  const selectedPermissions = watch('permissions', {});

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${id}`);
      setStaff(response.data.user);
      
      // Set form values
      setValue('permissions', response.data.user.permissions);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff details');
      navigate('/super-admin/staff');
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

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await axios.patch(`/users/${id}/permissions`, {
        permissions: data.permissions
      });
      
      // Refresh permissions if editing current user
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.id === id) {
        await refreshPermissions();
      }
      
      toast.success('Permissions updated successfully!');
      navigate('/super-admin/staff');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B65F6]" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Staff not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The staff member you're looking for doesn't exist or you don't have access.
        </p>
        <button
          onClick={() => navigate('/super-admin/staff')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
        >
          Back to Staff
        </button>
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
          Back to Staff
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Staff Permissions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage module access for {staff.name}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-8"
      >
        {/* Staff Info */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-[#252731] rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-[#252731] rounded-xl">
              <Users size={24} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {staff.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  staff.role === 'admin' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  <Shield size={12} />
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  staff.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {staff.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings size={20} />
              Module Permissions
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
                            {module.label}
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Permission Note:</strong> Staff members can only access the modules you enable here. 
                  SuperAdmins and PlatformAdmins bypass all permission restrictions.
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/super-admin/staff')}
              className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
