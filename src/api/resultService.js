import api from './axios';

/* ─── Settings ─── */

export const getMadrasas = (params) => api.get('/results/settings/madrasas', { params }).then(r => r.data);
export const getMadrasasForSelect = () => api.get('/results/settings/madrasas/select').then(r => r.data);
export const createMadrasa = (data) => api.post('/results/settings/madrasas', data).then(r => r.data);
export const updateMadrasa = (id, data) => api.put(`/results/settings/madrasas/${id}`, data).then(r => r.data);
export const deleteMadrasa = (id) => api.delete(`/results/settings/madrasas/${id}`).then(r => r.data);

export const getClasses = (params) => api.get('/results/settings/classes', { params }).then(r => r.data);
export const createClass = (data) => api.post('/results/settings/classes', data).then(r => r.data);
export const updateClass = (id, data) => api.put(`/results/settings/classes/${id}`, data).then(r => r.data);
export const deleteClass = (id) => api.delete(`/results/settings/classes/${id}`).then(r => r.data);

export const getSubjects = (params) => api.get('/results/settings/subjects', { params }).then(r => r.data);
export const createSubject = (data) => api.post('/results/settings/subjects', data).then(r => r.data);
export const updateSubject = (id, data) => api.put(`/results/settings/subjects/${id}`, data).then(r => r.data);
export const deleteSubject = (id) => api.delete(`/results/settings/subjects/${id}`).then(r => r.data);

export const getAcademicYears = (params) => api.get('/results/settings/academic-years', { params }).then(r => r.data);
export const getAcademicYearsForSelect = () => api.get('/results/settings/academic-years/select').then(r => r.data);
export const createAcademicYear = (data) => api.post('/results/settings/academic-years', data).then(r => r.data);
export const updateAcademicYear = (id, data) => api.put(`/results/settings/academic-years/${id}`, data).then(r => r.data);
export const deleteAcademicYear = (id) => api.delete(`/results/settings/academic-years/${id}`).then(r => r.data);
export const lockAcademicYear = (id) => api.patch(`/results/settings/academic-years/${id}/lock`).then(r => r.data);

export const getResultTypes = (params) => api.get('/results/settings/result-types', { params }).then(r => r.data);
export const createResultType = (data) => api.post('/results/settings/result-types', data).then(r => r.data);
export const updateResultType = (id, data) => api.put(`/results/settings/result-types/${id}`, data).then(r => r.data);
export const deleteResultType = (id) => api.delete(`/results/settings/result-types/${id}`).then(r => r.data);

/* ─── Results ─── */

export const getResults = (params) => api.get('/results', { params }).then(r => r.data);
export const getResult = (id) => api.get(`/results/${id}`).then(r => r.data);
export const createResult = (data) => api.post('/results', data).then(r => r.data);
export const updateResult = (id, data) => api.put(`/results/${id}`, data).then(r => r.data);
export const publishResult = (id) => api.patch(`/results/${id}/publish`).then(r => r.data);
export const deleteResult = (id) => api.delete(`/results/${id}`).then(r => r.data);

export const searchMembers = (search) =>
    api.get('/results/members/search', { params: { search } }).then(r =>
        (r.data.members || []).map(m => ({ value: m._id, label: `${m.full_name}${m.whatsapp ? ' – ' + m.whatsapp : ''}`, member: m }))
    );

export const getSubjectsByClass = (class_id) =>
    api.get('/results/subjects/by-class', { params: { class_id } }).then(r => r.data);
