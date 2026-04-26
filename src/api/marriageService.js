import axios from './axios';

// Admin API - Create marriage
export const createMarriage = async (data) => {
  const response = await axios.post('/admin/marriages/create', data);
  return response.data;
};

// Admin API - Get all marriages
export const getAllMarriages = async (params) => {
  const response = await axios.get('/admin/marriages', { params });
  return response.data;
};

// Admin API - Get marriage by ID
export const getMarriageById = async (id) => {
  const response = await axios.get(`/admin/marriages/${id}`);
  return response.data;
};

// Admin API - Update marriage
export const updateMarriage = async (id, data) => {
  const response = await axios.put(`/admin/marriages/${id}`, data);
  return response.data;
};

// Admin API - Generate PDF
export const generatePDF = async (id) => {
  const response = await axios.get(`/admin/marriages/${id}/pdf`);
  return response.data;
};

// Public API - Search marriage
export const searchMarriage = async (params) => {
  const response = await axios.get('/public/marriages/search', { params });
  return response.data;
};
