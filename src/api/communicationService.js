import axiosInstance from './axios';

const BASE = '/community/communication';

// ─── Announcements ────────────────────────────────────────────────────────────

export const createAnnouncement = (data) =>
    axiosInstance.post(BASE, data).then(r => r.data);

export const getAnnouncements = (params) =>
    axiosInstance.get(BASE, { params }).then(r => r.data);

export const getAnnouncementById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data);

export const updateAnnouncement = (id, data) =>
    axiosInstance.put(`${BASE}/${id}`, data).then(r => r.data);

export const publishAnnouncement = (id) =>
    axiosInstance.put(`${BASE}/${id}/publish`).then(r => r.data);

export const deleteAnnouncement = (id) =>
    axiosInstance.delete(`${BASE}/${id}`).then(r => r.data);

// ─── Published ────────────────────────────────────────────────────────────────

export const getPublishedAnnouncements = (params) =>
    axiosInstance.get(`${BASE}/published`, { params }).then(r => r.data);

// ─── Templates ────────────────────────────────────────────────────────────────

export const createTemplate = (data) =>
    axiosInstance.post(`${BASE}/templates`, data).then(r => r.data);

export const getTemplates = (params) =>
    axiosInstance.get(`${BASE}/templates`, { params }).then(r => r.data);

export const getTemplatesByModule = (module) =>
    axiosInstance.get(`${BASE}/templates`, { params: { module, limit: 100 } }).then(r => r.data);

export const getTemplateById = (id) =>
    axiosInstance.get(`${BASE}/templates/${id}`).then(r => r.data);

export const updateTemplate = (id, data) =>
    axiosInstance.put(`${BASE}/templates/${id}`, data).then(r => r.data);

export const deleteTemplate = (id) =>
    axiosInstance.delete(`${BASE}/templates/${id}`).then(r => r.data);

// ─── Settings ─────────────────────────────────────────────────────────────────

export const getCommSettings = () =>
    axiosInstance.get(`${BASE}/settings`).then(r => r.data);

export const updateCommSettings = (data) =>
    axiosInstance.put(`${BASE}/settings`, data).then(r => r.data);
