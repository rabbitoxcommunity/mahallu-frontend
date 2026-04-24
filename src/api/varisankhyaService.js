import axios from './axios';

// Generate monthly varisankhya dues for all active houses
export const generateMonthlyDues = async (month, year) => {
  const response = await axios.post('/finance/varisankhya/generate', {
    month,
    year
  });
  return response.data;
};

// Get monthly varisankhya list
export const getMonthlyVarisankhya = async (month, year, page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams({ month, year, page, limit });
  if (search) params.append('search', search);

  const response = await axios.get(`/finance/varisankhya?${params}`);
  return response.data;
};

// Mark payment for a varisankhya record
export const markPayment = async (id, paymentData) => {
  const response = await axios.put(`/finance/varisankhya/pay/${id}`, paymentData);
  return response.data;
};

// Get defaulters list
export const getDefaulters = async (year, page = 1, limit = 20) => {
  const params = new URLSearchParams({ page, limit });
  if (year) params.append('year', year);

  const response = await axios.get(`/finance/varisankhya/defaulters?${params}`);
  return response.data;
};

// Get house payment history
export const getHousePaymentHistory = async (houseId, page = 1, limit = 20, year = '') => {
  const params = new URLSearchParams({ page, limit });
  if (year) params.append('year', year);

  const response = await axios.get(`/finance/varisankhya/house/${houseId}?${params}`);
  return response.data;
};

// Get payment history (all payments across houses)
export const getPaymentHistory = async (page = 1, limit = 20, search = '', from_date = '', to_date = '', date_filter = '', year='') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (from_date) params.append('from_date', from_date);
  if (to_date) params.append('to_date', to_date);
  if (date_filter) params.append('date_filter', date_filter);
  if (year) params.append('year', year);

  const response = await axios.get(`/finance/varisankhya/payment-history?${params}`);
  return response.data;
};

// Get defaulter history for a specific house
export const getDefaulterHistory = async (houseId, page = 1, limit = 20, year = '') => {
  const params = new URLSearchParams({ page, limit });
  if (year) params.append('year', year);

  const response = await axios.get(`/finance/varisankhya/defaulter/${houseId}?${params}`);
  return response.data;
};
