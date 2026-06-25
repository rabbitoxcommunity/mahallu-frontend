import axiosInstance from './axios';

// Dashboard
export const getWelfareDashboard = () =>
  axiosInstance.get('/community/welfare/dashboard').then(r => r.data);

// Reports
export const getWelfareReports = (params) =>
  axiosInstance.get('/community/welfare/reports', { params }).then(r => r.data);

// Beneficiaries
export const getWelfareBeneficiaries = (params) =>
  axiosInstance.get('/community/welfare/beneficiaries', { params }).then(r => r.data);

export const getFamilyWelfareHistory = (id) =>
  axiosInstance.get(`/community/welfare/family/${id}`).then(r => r.data);

// Programs
export const getWelfarePrograms = (params) =>
  axiosInstance.get('/community/welfare/programs', { params }).then(r => r.data);

export const createWelfareProgram = (data) =>
  axiosInstance.post('/community/welfare/programs', data).then(r => r.data);

export const updateWelfareProgram = (id, data) =>
  axiosInstance.put(`/community/welfare/programs/${id}`, data).then(r => r.data);

export const deleteWelfareProgram = (id) =>
  axiosInstance.delete(`/community/welfare/programs/${id}`).then(r => r.data);

// Distributions
export const getWelfareDistributions = (params) =>
  axiosInstance.get('/community/welfare/distributions', { params }).then(r => r.data);

export const createWelfareDistribution = (data) =>
  axiosInstance.post('/community/welfare/distributions', data).then(r => r.data);

export const updateWelfareDistribution = (id, data) =>
  axiosInstance.put(`/community/welfare/distributions/${id}`, data).then(r => r.data);

export const deleteWelfareDistribution = (id) =>
  axiosInstance.delete(`/community/welfare/distributions/${id}`).then(r => r.data);

// Helper – search houses for react-select async dropdown
export const searchHousesForSelect = (search) =>
  axiosInstance.get('/house', { params: { search, limit: 20, page: 1 } }).then(r =>
    (r.data.houses || []).map(h => ({
      value: h._id,
      label: `${h.house_code} – ${h.householder_name}`,
      house: h
    }))
  );
