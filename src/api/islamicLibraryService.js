import axios from './axios';

const BACKEND = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5005';

// pdf_file is now a full R2 URL; older records may still hold a bare local
// filename from before the R2 migration, so keep resolving those too.
export const getPdfUrl = (pdfFile) => {
  if (!pdfFile) return null;
  return /^https?:\/\//i.test(pdfFile) ? pdfFile : `${BACKEND}/uploads/islamic/${pdfFile}`;
};

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
