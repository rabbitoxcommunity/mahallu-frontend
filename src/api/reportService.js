import axios from './axios';

// Summary
export const getSummary = async () => {
  const response = await axios.get('/finance/reports/summary');
  return response.data;
};

// Financial Statement
export const getStatement = async (params) => {
  const response = await axios.get('/finance/reports/statement', { params });
  return response.data;
};

// Trends
export const getTrends = async (params) => {
  const response = await axios.get('/finance/reports/trends', { params });
  return response.data;
};

// Export
export const exportReport = async (params) => {
  const response = await axios.get('/finance/reports/export', { params });
  return response.data;
};
