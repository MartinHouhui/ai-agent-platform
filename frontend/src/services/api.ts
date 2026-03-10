import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const chatAPI = {
  send: (message: string) => api.post('/api/chat', { message })
}

export const wizardAPI = {
  start: (userId: string) => api.post('/api/wizard/start', { userId }),
  getProgress: (sessionId: string) => api.get(`/api/wizard/${sessionId}`),
}

export const skillsAPI = {
  list: () => api.get('/api/skills'),
}

export const adaptersAPI = {
  list: () => api.get('/api/adapters'),
}

export default api
