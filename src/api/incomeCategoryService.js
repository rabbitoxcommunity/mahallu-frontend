import axios from './axios';

export const getIncomeCategories = async (params = {}) => {
  const response = await axios.get('/settings/income-categories', { params });
  return response.data;
};

export const getIncomeCategoryById = async (id) => {
  const response = await axios.get(`/settings/income-categories/${id}`);
  return response.data;
};

export const createIncomeCategory = async (data) => {
  const response = await axios.post('/settings/income-categories', data);
  return response.data;
};

export const updateIncomeCategory = async (id, data) => {
  const response = await axios.put(`/settings/income-categories/${id}`, data);
  return response.data;
};

export const deleteIncomeCategory = async (id) => {
  const response = await axios.delete(`/settings/income-categories/${id}`);
  return response.data;
};
