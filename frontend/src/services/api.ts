import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

// 聊天 API
export const chatAPI = {
  send: (message: string, context?: any) =>
    api.post('/api/chat', { message, context }),
};

// 向导 API
export const wizardAPI = {
  start: (userId: string) =>
    api.post('/api/wizard/start', { userId }),

  getProgress: (sessionId: string) =>
    api.get(`/api/wizard/${sessionId}`),

  saveSystemInfo: (sessionId: string, data: any) =>
    api.post(`/api/wizard/${sessionId}/system-info`, data),

  saveAPIConfig: (sessionId: string, data: any) =>
    api.post(`/api/wizard/${sessionId}/api-config`, data),

  importAPI: (sessionId: string, data: any) =>
    api.post(`/api/wizard/${sessionId}/api-import`, data),

  analyzeAPI: (sessionId: string) =>
    api.post(`/api/wizard/${sessionId}/analyze`),

  selectFeatures: (sessionId: string, features: any[]) =>
    api.post(`/api/wizard/${sessionId}/features`, { features }),

  generateCode: (sessionId: string) =>
    api.post(`/api/wizard/${sessionId}/generate`),

  runTests: (sessionId: string) =>
    api.post(`/api/wizard/${sessionId}/test`),

  deploy: (sessionId: string) =>
    api.post(`/api/wizard/${sessionId}/deploy`),
};

// Skills API
export const skillsAPI = {
  list: () => api.get('/api/skills'),

  get: (id: string) => api.get(`/api/skills/${id}`),
};

// Adapters API
export const adaptersAPI = {
  list: () => api.get('/api/adapters'),

  get: (id: string) => api.get(`/api/adapters/${id}`),
};
