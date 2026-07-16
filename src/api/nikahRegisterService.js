import axios from './axios';

// Admin API - Generate a Nikah Register PDF from the entered details.
// Returns the PDF as a blob (nothing is persisted server-side).
export const generateRegister = async (data) => {
  const response = await axios.post('/admin/nikah-register/generate', data, { responseType: 'blob' });
  return response.data;
};
