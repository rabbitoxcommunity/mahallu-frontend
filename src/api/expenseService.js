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

// Fetch a receipt as a blob for inline viewing (no Content-Disposition:
// attachment, unlike the R2 URL, so images/PDFs render instead of downloading)
export const viewReceipt = async (id) => {
  const response = await axios.get(`/finance/expense/${id}/receipt/view`, { responseType: 'blob' });
  return response.data;
};

// ============ Due Based Expense ============

export const getDueExpenses = async (params) => {
  const response = await axios.get('/finance/due-expense', { params });
  return response.data;
};

export const createDueExpense = async (data) => {
  const response = await axios.post('/finance/due-expense/create', data);
  return response.data;
};

export const updateDueExpense = async (id, data) => {
  const response = await axios.put(`/finance/due-expense/${id}`, data);
  return response.data;
};

export const deleteDueExpense = async (id) => {
  const response = await axios.delete(`/finance/due-expense/${id}`);
  return response.data;
};

export const markDueExpensePayment = async (entryId, data) => {
  const response = await axios.put(`/finance/due-expense/pay/${entryId}`, data);
  return response.data;
};

export const getDueExpenseTemplateEntries = async (templateId) => {
  const response = await axios.get(`/finance/due-expense/${templateId}/entries`);
  return response.data;
};

export const getDueExpenseSummary = async (params) => {
  const response = await axios.get('/finance/due-expense/summary', { params });
  return response.data;
};
