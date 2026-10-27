import api from './api';

export const getDashboard = (district) =>
  api.get('/dashboard', { params: district ? { district } : {} }).then((r) => r.data);

export const getAgriculturalData = (params) => api.get('/agriculture', { params }).then((r) => r.data);
export const getFilterOptions = () => api.get('/agriculture/filters').then((r) => r.data);
export const getByDistrict = (district) => api.get(`/agriculture/district/${district}`).then((r) => r.data);

export const getRainfallAnalytics = (params) => api.get('/analytics/rainfall', { params }).then((r) => r.data);
export const getCropAnalytics = (params) => api.get('/analytics/crop', { params }).then((r) => r.data);
export const getSoilAnalytics = (params) => api.get('/analytics/soil', { params }).then((r) => r.data);

export const getWaterResourceSummary = (district) =>
  api.get('/water-resources/summary', { params: { district } }).then((r) => r.data);
export const getWaterResources = (params) => api.get('/water-resources', { params }).then((r) => r.data);

export const detectLocation = (payload) => api.post('/location', payload).then((r) => r.data);
export const getLocationInsights = (district) => api.get(`/location/insights/${district}`).then((r) => r.data);

export const askAI = (question) => api.post('/ai/ask', { question }).then((r) => r.data);

export const runSimulation = (payload) => api.post('/simulation', payload).then((r) => r.data);
export const getScenarioHistory = () => api.get('/history').then((r) => r.data);

export const getAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data);
export const getUsers = () => api.get('/admin/users').then((r) => r.data);
export const getUploadHistory = () => api.get('/admin/uploads').then((r) => r.data);
export const uploadDataset = (formData) =>
  api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const importDataset = (uploadId) => api.post('/admin/import', { uploadId }).then((r) => r.data);
