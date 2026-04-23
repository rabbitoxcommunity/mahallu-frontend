import axios from './axios';

// Get all expenses
export const getExpenses = async (params) => {
  const response = await axios.get('/finance/expense', { params });
  return response.data;
};

// Get single expense
export const getExpenseById = async (id) => {
  const response = await axios.get(`/finance/expense/${id}`);
  return response.data;
};

// Create expense
export const createExpense = async (data) => {
  const formData = new FormData();

  // Append all fields to FormData
  Object.keys(data).forEach(key => {
    if (key === 'bill_file' && data[key]) {
      // Handle FileList (from file input)
      if (data[key] instanceof FileList && data[key].length > 0) {
        formData.append('bill_file', data[key][0]);
      } else if (data[key] instanceof File) {
        formData.append('bill_file', data[key]);
      }
    } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      formData.append(key, data[key]);
    }
  });

  const response = await axios.post('/finance/expense', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update expense
export const updateExpense = async (id, data) => {
  const formData = new FormData();

  // Append all fields to FormData
  Object.keys(data).forEach(key => {
    if (key === 'bill_file' && data[key]) {
      // Handle FileList (from file input)
      if (data[key] instanceof FileList && data[key].length > 0) {
        formData.append('bill_file', data[key][0]);
      } else if (data[key] instanceof File) {
        formData.append('bill_file', data[key]);
      }
    } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      formData.append(key, data[key]);
    }
  });

  const response = await axios.put(`/finance/expense/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete expense
export const deleteExpense = async (id) => {
  const response = await axios.delete(`/finance/expense/${id}`);
  return response.data;
};

// Get expense summary
export const getExpenseSummary = async () => {
  const response = await axios.get('/finance/expense/summary');
  return response.data;
};
