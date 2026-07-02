const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api').replace(/\/api\/?$/, '');

// Certificate pdf_url values are now full R2 URLs (https://...), but older
// records generated before the R2 migration still have relative local paths
// (e.g. /certificates/CERT-001.pdf) served by the backend's static middleware.
export const resolveCertUrl = (pdfUrl) => {
  if (!pdfUrl) return null;
  return /^https?:\/\//i.test(pdfUrl) ? pdfUrl : `${API_ORIGIN}${pdfUrl}`;
};
