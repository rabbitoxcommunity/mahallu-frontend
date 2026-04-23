import axios from './axios';

// Dashboard Summary
export const getDashboardSummary = async () => {
  const response = await axios.get('/finance/reports/dashboard');
  return response.data;
};

// Monthly Report
export const getMonthlyReport = async (params) => {
  const response = await axios.get('/finance/reports/monthly', { params });
  return response.data;
};

// Income Report
export const getIncomeReport = async (params) => {
  const response = await axios.get('/finance/reports/income', { params });
  return response.data;
};

// Expense Report
export const getExpenseReport = async (params) => {
  const response = await axios.get('/finance/reports/expense', { params });
  return response.data;
};

// Varisankhya Report
export const getVarisankhyaReport = async (params) => {
  const response = await axios.get('/finance/reports/varisankhya', { params });
  return response.data;
};
