import axios from './axios';

// Create a new tenant
export const createTenant = async (tenantData) => {
  const response = await axios.post('/tenants/create', tenantData);
  return response.data;
};

// Get all tenants with pagination
export const getTenants = async (page = 1, limit = 10) => {
  const response = await axios.get(`/tenants?page=${page}&limit=${limit}`);
  return response.data;
};

// Get single tenant details
export const getTenant = async (tenantId) => {
  const response = await axios.get(`/tenants/${tenantId}`);
  return response.data;
};

// Update tenant status
export const updateTenantStatus = async (tenantId, status) => {
  const response = await axios.patch(`/tenants/${tenantId}/status`, { status });
  return response.data;
};

// Search tenants (optional - for future enhancement)
export const searchTenants = async (query, page = 1, limit = 10) => {
  const response = await axios.get(`/tenants/search?q=${query}&page=${page}&limit=${limit}`);
  return response.data;
};
