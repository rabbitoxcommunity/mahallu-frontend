import axios from './axios';

// Create a new user
export const createUser = async (userData) => {
  const response = await axios.post('/users/create', userData);
  return response.data;
};

// Get all users of current tenant with pagination
export const getTenantUsers = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  
  const response = await axios.get(`/users?${params}`);
  return response.data;
};

// Get single user details
export const getUser = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

// Update user permissions
export const updateUserPermissions = async (userId, permissions) => {
  const response = await axios.patch(`/users/${userId}/permissions`, { permissions });
  return response.data;
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (userId, is_active) => {
  const response = await axios.patch(`/users/${userId}/status`, { is_active });
  return response.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const response = await axios.patch(`/users/${userId}/role`, { role });
  return response.data;
};
