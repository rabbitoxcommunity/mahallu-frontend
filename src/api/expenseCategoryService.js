import axios from './axios';

// Get all expense categories
export const getExpenseCategories = async (params) => {
  const response = await axios.get('/settings/expense-categories', { params });
  return response.data;
};

// Get single expense category
export const getExpenseCategoryById = async (id) => {
  const response = await axios.get(`/settings/expense-categories/${id}`);
  return response.data;
};

// Create expense category
export const createExpenseCategory = async (data) => {
  const response = await axios.post('/settings/expense-categories', data);
  return response.data;
};

// Update expense category
export const updateExpenseCategory = async (id, data) => {
  const response = await axios.put(`/settings/expense-categories/${id}`, data);
  return response.data;
};

// Delete expense category
export const deleteExpenseCategory = async (id) => {
  const response = await axios.delete(`/settings/expense-categories/${id}`);
  return response.data;
};
