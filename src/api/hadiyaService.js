import axios from './axios';

// Hadiya Collection APIs
export const createHadiyaCollection = async (data) => {
  const response = await axios.post('/finance/hadiya/create', data);
  return response.data;
};

export const getHadiyaCollections = async (params = {}) => {
  const response = await axios.get('/finance/hadiya', { params });
  return response.data;
};

export const getHadiyaCollectionById = async (id) => {
  const response = await axios.get(`/finance/hadiya/${id}`);
  return response.data;
};

export const updateHadiyaCollection = async (id, data) => {
  const response = await axios.put(`/finance/hadiya/${id}`, data);
  return response.data;
};

export const deleteHadiyaCollection = async (id) => {
  const response = await axios.delete(`/finance/hadiya/${id}`);
  return response.data;
};

export const getHadiyaSummary = async (params = {}) => {
  const response = await axios.get('/finance/hadiya/summary', { params });
  return response.data;
};

// House Search API
export const searchHouses = async (params = {}) => {
  const response = await axios.get('/house/search', { params });
  return response.data;
};
