import axios from './axios';

// Get tenant info
export const getTenantInfo = async (tenant) => {
  const params = new URLSearchParams();
  if (tenant) params.append('tenant', tenant);

  const response = await axios.get(`/public/tenant?${params}`);
  return response.data;
};

// Search houses
export const searchHouses = async (query, tenant) => {
  const params = new URLSearchParams({ q: query });
  if (tenant) params.append('tenant', tenant);

  const response = await axios.get(`/public/houses/search?${params}`);
  return response.data;
};

// Get family details
export const getFamilyDetails = async (id, tenant) => {
  const params = new URLSearchParams();
  if (tenant) params.append('tenant', tenant);

  const response = await axios.get(`/public/family/${id}?${params}`);
  return response.data;
};

// Get varisankhya status
export const getVarisankhyaStatus = async (houseId, tenant) => {
  const params = new URLSearchParams();
  if (tenant) params.append('tenant', tenant);

  const response = await axios.get(`/public/varisankhya/${houseId}?${params}`);
  return response.data;
};
