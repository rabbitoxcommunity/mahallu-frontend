import axios from './axios';

// Admin API - Generate a general certificate PDF from the entered title/body.
// Returns the PDF as a blob (nothing is persisted server-side).
export const generateCertificate = async (data) => {
  const response = await axios.post('/admin/general-certificate/generate', data, { responseType: 'blob' });
  return response.data;
};
