import api from '@/lib/api';

// Menus
export async function fetchMenus(params?: any) {
  const resp = await api.get('/api/hostel/mess/menus', { params });
  return resp.data.menus || [];
}

export async function createMenu(payload: any) {
  const resp = await api.post('/api/hostel/mess/menus', payload);
  return resp.data.menu;
}

export async function updateMenu(id: string, payload: any) {
  const resp = await api.put(`/api/hostel/mess/menus/${id}`, payload);
  return resp.data.menu;
}

export async function deleteMenu(id: string) {
  const resp = await api.delete(`/api/hostel/mess/menus/${id}`);
  return resp.data;
}

// Residents
export async function fetchMessResidents() {
  const resp = await api.get('/api/hostel/mess/residents');
  return resp.data.residents || [];
}

export async function addMessResident(payload: any) {
  const resp = await api.post('/api/hostel/mess/residents', payload);
  return resp.data.resident;
}

export async function deleteResident(id: string) {
  const resp = await api.delete(`/api/hostel/mess/residents/${id}`);
  return resp.data;
}

// Feedback
export async function submitFeedback(payload: any) {
  const resp = await api.post('/api/hostel/mess/feedback', payload);
  return resp.data.feedback;
}

export async function fetchFeedback() {
  const resp = await api.get('/api/hostel/mess/feedback');
  return resp.data.feedback || [];
}

// Fees
export async function fetchMessFees() {
  const resp = await api.get('/api/hostel/mess/fees');
  return resp.data.fees || [];
}

export async function createMessFee(payload: any) {
  const resp = await api.post('/api/hostel/mess/fees', payload);
  return resp.data.fee;
}

export async function payMessFee(id: string, amount: number) {
  const resp = await api.post(`/api/hostel/mess/fees/${id}/pay`, { amount });
  return resp.data;
}

// Reports
export async function fetchDailyReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/daily', { params });
  return resp.data;
}

export async function fetchMonthlyRevenue(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/monthly', { params });
  return resp.data;
}

export async function fetchFeeCollectionReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/fees', { params });
  return resp.data;
}

export async function fetchFeedbackReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/feedback', { params });
  return resp.data;
}

export async function exportDailyReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/daily/export', { params, responseType: 'blob' });
  return resp.data;
}

export async function exportMonthlyRevenue(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/monthly/export', { params, responseType: 'blob' });
  return resp.data;
}

export async function exportFeeCollectionReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/fees/export', { params, responseType: 'blob' });
  return resp.data;
}

export async function exportFeedbackReport(params?: any) {
  const resp = await api.get('/api/hostel/mess/reports/feedback/export', { params, responseType: 'blob' });
  return resp.data;
}

export default {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  fetchMessResidents,
  addMessResident,
  deleteResident,
  submitFeedback,
  fetchFeedback,
  fetchMessFees,
  createMessFee,
  payMessFee,
  fetchDailyReport,
  fetchMonthlyRevenue,
  fetchFeeCollectionReport,
  fetchFeedbackReport,
  exportDailyReport,
  exportMonthlyRevenue,
  exportFeeCollectionReport,
  exportFeedbackReport,
};
