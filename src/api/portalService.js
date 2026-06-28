import axios from './axios';

// Resolve tenant slug from localStorage or URL param
export const getTenantSlug = () =>
  localStorage.getItem('portal_tenant') ||
  new URLSearchParams(window.location.search).get('t') ||
  '';

const q = (extra = {}) => {
  const slug = getTenantSlug();
  return { params: { t: slug, ...extra } };
};

// ── Public APIs ───────────────────────────────────────────────────────────────
export const fetchTenantInfo           = ()              => axios.get('/portal/tenant-info', q());
export const fetchAnnouncements        = (params = {})   => axios.get('/portal/announcements', q(params));
export const fetchAnnouncementCategories = ()            => axios.get('/portal/announcement-categories', q());
export const fetchPublicResults        = ()              => axios.get('/portal/results', q());
export const searchBloodDonors         = (blood_group)   => axios.get('/portal/blood-donors', q({ blood_group }));
export const searchMarriageCertificates = (query)        => axios.get('/portal/marriage-certificates/search', q({ q: query }));
export const fetchMarriageCertificate  = (cert_no)       => axios.get(`/portal/marriage-certificate/${cert_no}`, { ...q(), responseType: 'blob' });

// ── Admin APIs ────────────────────────────────────────────────────────────────
export const fetchPortalSettings  = ()       => axios.get('/portal/admin/settings');
export const updatePortalSettings = (data)   => axios.put('/portal/admin/settings', data);
