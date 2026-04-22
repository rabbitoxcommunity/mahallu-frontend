import axios from './axios';

// Get all expenses
export const getExpenses = async (params) => {
  const response = await axios.get('/finance/expense', { params });
  return response.data;
};

// Get single expense
export const getExpenseById = async (id) => {
  const response = await axios.get(`/finance/expense/${id}`);
  return response.data;
};

// Create expense
export const createExpense = async (data) => {
  const response = await axios.post('/finance/expense', data);
  return response.data;
};

// Update expense
export const updateExpense = async (id, data) => {
  const response = await axios.put(`/finance/expense/${id}`, data);
  return response.data;
};

// Delete expense
export const deleteExpense = async (id) => {
  const response = await axios.delete(`/finance/expense/${id}`);
  return response.data;
};

// Get expense summary
export const getExpenseSummary = async () => {
  const response = await axios.get('/finance/expense/summary');
  return response.data;
};
