import axios from './axios';

// ── Admin APIs ────────────────────────────────────────────────────────────────
export const fetchPortalSettings  = ()       => axios.get('/portal/admin/settings');
export const updatePortalSettings = (data)   => axios.put('/portal/admin/settings', data);
