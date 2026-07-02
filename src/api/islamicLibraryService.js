import axios from './axios';

const BACKEND = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5005';

export const getPdfUrl = (filename) =>
  filename ? `${BACKEND}/uploads/islamic/${filename}` : null;

const slug = () =>
  localStorage.getItem('portal_tenant') ||
  new URLSearchParams(window.location.search).get('t') || '';

// ── Admin — Surah ─────────────────────────────────────────────────────────────

export const listSurahs = (params = {}) =>
  axios.get('/islamic-library/surah', { params }).then((r) => r.data);

export const createSurah = (formData) =>
  axios.post('/islamic-library/surah', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const updateSurah = (id, formData) =>
  axios.put(`/islamic-library/surah/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteSurah = (id) =>
  axios.delete(`/islamic-library/surah/${id}`).then((r) => r.data);

// ── Admin — Dua ───────────────────────────────────────────────────────────────

export const listDuas = (params = {}) =>
  axios.get('/islamic-library/dua', { params }).then((r) => r.data);

export const createDua = (formData) =>
  axios.post('/islamic-library/dua', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const updateDua = (id, formData) =>
  axios.put(`/islamic-library/dua/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteDua = (id) =>
  axios.delete(`/islamic-library/dua/${id}`).then((r) => r.data);

// ── Public ────────────────────────────────────────────────────────────────────

export const getPublicSurahs = (params = {}) =>
  axios
    .get('/islamic-library/public/surahs', { params: { t: slug(), ...params } })
    .then((r) => r.data);

export const getPublicDuas = (params = {}) =>
  axios
    .get('/islamic-library/public/duas', { params: { t: slug(), ...params } })
    .then((r) => r.data);
