import axiosInstance from './axios';


// Dashboard
export const getDeathDashboard = () =>
    axiosInstance.get('/community/death/dashboard').then(r => r.data);

// CRUD
export const getDeathRecords = (params) =>
    axiosInstance.get('/community/death', { params }).then(r => r.data);

export const getDeathById = (id) =>
    axiosInstance.get(`/community/death/${id}`).then(r => r.data);

export const createDeathRecord = (data) =>
    axiosInstance.post('/community/death', data).then(r => r.data);

export const updateDeathRecord = (id, data) =>
    axiosInstance.put(`/community/death/${id}`, data).then(r => r.data);

export const deleteDeathRecord = (id) =>
    axiosInstance.delete(`/community/death/${id}`).then(r => r.data);

export const markCertificateGenerated = (id) =>
    axiosInstance.put(`/community/death/${id}/certificate`).then(r => r.data);

export const generatePDF = (id) =>
    axiosInstance.get(`/community/death/${id}/pdf`).then(r => r.data);

// Reports
export const getDeathReports = (params) =>
    axiosInstance.get('/community/death/reports', { params }).then(r => r.data);

// Search members for react-select AsyncSelect
export const searchMembersForSelect = (search) =>
    axiosInstance
        .get('/member/all', { params: { search, limit: 10, page: 1 } })
        .then(r =>
            (r.data.members || []).map(m => ({
                value: m._id,
                label: `${m.full_name} (${m.contact_number || m.whatsapp || ''})`,
                member: m,
            }))
        );
