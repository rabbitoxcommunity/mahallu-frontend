import axios from './axios';

// Due Based Income APIs (template / subscription)
export const createDueIncome = async (data) => {
  const response = await axios.post('/finance/income/due/create', data);
  return response.data;
};

export const getDueIncome = async (params = {}) => {
  const response = await axios.get('/finance/income/due', { params });
  return response.data;
};

export const updateDueIncome = async (id, data) => {
  const response = await axios.put(`/finance/income/due/${id}`, data);
  return response.data;
};

export const deleteDueIncome = async (id) => {
  const response = await axios.delete(`/finance/income/due/${id}`);
  return response.data;
};

// id = entry._id (monthly entry, not template)
export const markDuePayment = async (id, data) => {
  const response = await axios.put(`/finance/income/due/pay/${id}`, data);
  return response.data;
};

// id = entry._id — payment receipts for one monthly entry
export const getDuePaymentHistory = async (id) => {
  const response = await axios.get(`/finance/income/due/history/${id}`);
  return response.data;
};

// id = template._id — all monthly entries across every month
export const getTemplateEntries = async (id) => {
  const response = await axios.get(`/finance/income/due/${id}/entries`);
  return response.data;
};

// Direct Income APIs
export const createDirectIncome = async (data) => {
  const response = await axios.post('/finance/income/direct/create', data);
  return response.data;
};

export const getDirectIncome = async (params = {}) => {
  const response = await axios.get('/finance/income/direct', { params });
  return response.data;
};

export const updateDirectIncome = async (id, data) => {
  const response = await axios.put(`/finance/income/direct/${id}`, data);
  return response.data;
};

export const deleteDirectIncome = async (id) => {
  const response = await axios.delete(`/finance/income/direct/${id}`);
  return response.data;
};

// Summary API
export const getIncomeSummary = async (params = {}) => {
  const response = await axios.get('/finance/income/summary', { params });
  return response.data;
};
