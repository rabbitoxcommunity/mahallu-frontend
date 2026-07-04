import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
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
  Power,
  Search,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from '../../api/axios';

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchStaff = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`/users?page=${page}&limit=${pagination.limit}${search ? `&search=${search}` : ''}`);
      setStaff(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStaff(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleStatusToggle = async (staffId, currentStatus) => {
    const newStatus = !currentStatus;

    const result = await Swal.fire({
      title: newStatus ? 'Activate staff member?' : 'Deactivate staff member?',
      text: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this staff member?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#22c55e' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: newStatus ? 'Yes, activate' : 'Yes, deactivate',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-3xl' },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(`/users/${staffId}/status`, { is_active: newStatus });
      fetchStaff(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating staff status:', error);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      superAdmin: {
        color: 'purple',
        icon: Shield,
        label: 'Super Admin'
      },
      admin: {
        color: 'blue',
        icon: Shield,
        label: 'Admin'
      },
      user: {
        color: 'gray',
        icon: Users,
        label: 'User'
      }
    };

    const badge = badges[role] || badges.user;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full  font-medium bg-${badge.color}-100 text-${badge.color}-800 dark:bg-${badge.color}-900/30 dark:text-${badge.color}-400`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (is_active) => {
    if (is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full  font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={12} />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full  font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }
  };

  const getPermissionsSummary = (permissions) => {
    const enabledPermissions = Object.keys(permissions).filter(key => permissions[key]);
    const count = enabledPermissions.length;
    
    if (count === 0) {
      return <span className=" text-gray-500 dark:text-gray-400">No permissions</span>;
    }
    
    return (
      <div className="flex items-center gap-1">
        <span className=" font-medium text-gray-900 dark:text-white">{count}</span>
        <span className=" text-gray-500 dark:text-gray-400">modules</span>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage staff in your tenant</p>
        </div>
        <Link
          to="/super-admin/staff/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
        >
          <Plus size={20} />
          Create Staff
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-800/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B65F6] dark:bg-[#252731] dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-800/60 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors">
          <Filter size={20} />
          Filter
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252731] border-b border-gray-100 dark:border-gray-800/60">
              <tr>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {staff.map((staffMember, index) => (
                <motion.tr
                  key={staffMember._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-[#252731] rounded-lg">
                        <Users size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className=" font-medium text-gray-900 dark:text-white">
                          {staffMember.name}
                        </div>
                        <div className=" text-gray-500 dark:text-gray-400">
                          {staffMember.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(staffMember.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPermissionsSummary(staffMember.permissions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(staffMember.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1  text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      {formatDate(staffMember.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {staffMember.role !== 'superAdmin' && (
                        <>
                          <Link
                            to={`/super-admin/staff/${staffMember._id}/permissions`}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                            title="Edit permissions"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(staffMember._id, staffMember.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              staffMember.is_active
                                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                            }`}
                            title={staffMember.is_active ? 'Deactivate staff' : 'Activate staff'}
                          >
                            <Power size={16} />
                          </button>
                        </>
                      )}
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
              <div className=" text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchStaff(pagination.page - 1, searchTerm)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-100 dark:border-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#252731]/50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1  font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#252731] rounded-lg">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => fetchStaff(pagination.page + 1, searchTerm)}
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

      {staff.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No staff found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by creating your first staff member
          </p>
          <Link
            to="/super-admin/staff/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B65F6] text-white rounded-lg hover:bg-[#0B65F6]/90 transition-colors"
          >
            <Plus size={20} />
            Create Staff
          </Link>
        </div>
      )}
    </div>
  );
}
