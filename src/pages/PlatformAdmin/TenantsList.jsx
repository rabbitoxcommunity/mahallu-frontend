import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Building2, 
  Users, 
  Calendar, 
  Shield, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Power
} from 'lucide-react';
import axios from '../../api/axios';

export default function TenantsList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchTenants = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/tenants?page=${page}&limit=${pagination.limit}`);
      setTenants(response.data.tenants);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleStatusToggle = async (tenantId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionText = currentStatus === 'active' ? 'suspend' : 'activate';
    
    Swal.fire({
        title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Tenant`,
        text: `Are you sure you want to ${actionText} this tenant?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: newStatus === 'suspended' ? "#d33" : "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, ${actionText} it!`,
        customClass: {
            popup: "rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 dark:bg-[#1e1f25]",
            confirmButton: "rounded-xl px-6 py-2.5 font-bold transition-transform active:scale-95",
            cancelButton: "rounded-xl px-6 py-2.5 text-white font-bold transition-transform active:scale-95"
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.patch(`/tenants/${tenantId}/status`, { status: newStatus });
                fetchTenants(pagination.page);
                Swal.fire({
                    title: "Updated!",
                    text: `Tenant has been ${newStatus}.`,
                    icon: "success",
                    confirmButtonColor: "#0B65F6",
                    customClass: {
                        popup: "rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 dark:bg-[#1e1f25]",
                        confirmButton: "rounded-xl px-6 py-2.5 font-bold"
                    }
                });
            } catch (error) {
                console.error('Error updating tenant status:', error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to update tenant status.",
                    icon: "error",
                    confirmButtonColor: "#0B65F6",
                    customClass: {
                        popup: "rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 dark:bg-[#1e1f25]",
                        confirmButton: "rounded-xl px-6 py-2.5 font-bold"
                    }
                });
            }
        }
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={12} />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle size={12} />
          Suspended
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B65F6]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all tenant organizations</p>
        </div>
        <Link
          to="/platform-admin/tenants/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors text-sm"
        >
          <Plus size={18} />
          Create Tenant
        </Link>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252731] border-b border-gray-100 dark:border-gray-800/60">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Super Admin
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {tenants.map((tenant, index) => (
                <motion.tr
                  key={tenant._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-[#252731] rounded-lg">
                        <Building2 size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {tenant.name}
                          {tenant.nameMalayalam && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal"> ({tenant.nameMalayalam})</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tenant.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tenant.superAdmin ? (
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tenant.superAdmin.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {tenant.superAdmin.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No super admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tenant.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      {formatDate(tenant.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/platform-admin/tenants/${tenant._id}/edit`}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit tenant"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(tenant._id, tenant.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          tenant.status === 'active'
                            ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                        }`}
                        title={tenant.status === 'active' ? 'Suspend tenant' : 'Activate tenant'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTenants(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-100 dark:border-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#252731] rounded-lg">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => fetchTenants(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-100 dark:border-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {tenants.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tenants found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by creating your first tenant organization
          </p>
          <Link
            to="/platform-admin/tenants/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
          >
            <Plus size={20} />
            Create Tenant
          </Link>
        </div>
      )}
    </div>
  );
}
