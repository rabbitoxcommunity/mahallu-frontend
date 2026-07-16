import axios from './axios';

// Admin API - Create marriage NOC
export const createNoc = async (data) => {
  const response = await axios.post('/admin/marriage-noc/create', data);
  return response.data;
};

// Admin API - Get all marriage NOCs
export const getAllNocs = async (params) => {
  const response = await axios.get('/admin/marriage-noc', { params });
  return response.data;
};

// Admin API - Get marriage NOC by ID
export const getNocById = async (id) => {
  const response = await axios.get(`/admin/marriage-noc/${id}`);
  return response.data;
};

// Admin API - Update marriage NOC
export const updateNoc = async (id, data) => {
  const response = await axios.put(`/admin/marriage-noc/${id}`, data);
  return response.data;
};

// Admin API - Generate PDF
export const generatePDF = async (id) => {
  const response = await axios.get(`/admin/marriage-noc/${id}/pdf`);
  return response.data;
};

// Admin API - Fetch PDF as a blob for inline viewing/printing
export const viewPDF = async (id) => {
  const response = await axios.get(`/admin/marriage-noc/${id}/pdf/view`, { responseType: 'blob' });
  return response.data;
};
