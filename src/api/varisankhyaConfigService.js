import axios from './axios';

// Get all varisankhya configs
export const getConfigs = async () => {
  const response = await axios.get('/settings/varisankhya-config');
  return response.data;
};

// Get config by category
export const getConfigByCategory = async (category) => {
  const response = await axios.get(`/settings/varisankhya-config/${category}`);
  return response.data;
};

// Create or update config
export const createOrUpdateConfig = async (data) => {
  const response = await axios.post('/settings/varisankhya-config', data);
  return response.data;
};

// Update config
export const updateConfig = async (id, data) => {
  const response = await axios.put(`/settings/varisankhya-config/${id}`, data);
  return response.data;
};

// Delete config
export const deleteConfig = async (id) => {
  const response = await axios.delete(`/settings/varisankhya-config/${id}`);
  return response.data;
};
