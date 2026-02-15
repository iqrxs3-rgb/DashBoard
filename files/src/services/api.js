import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = 'https://backendbe.up.railway.app/'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
export const authApi = {
     login: (code) => api.post('/auth/callback', { code }),
     getCurrentUser: () => api.get('/auth/me'),
     logout: () => api.post('/auth/logout'),
   }
export const serverApi = {
  
  getServers: () => api.get('/servers'),
  getServer: (serverId) => api.get(`/servers/${serverId}`),
  updateServer: (serverId, data) => api.patch(`/servers/${serverId}`, data),
}

export const commandApi = {
  getCommands: (serverId) => api.get(`/servers/${serverId}/commands`),
  createCommand: (serverId, data) => api.post(`/servers/${serverId}/commands`, data),
  updateCommand: (serverId, commandId, data) => api.patch(`/servers/${serverId}/commands/${commandId}`, data),
  deleteCommand: (serverId, commandId) => api.delete(`/servers/${serverId}/commands/${commandId}`),
}

export const roleApi = {
  getRoles: (serverId) => api.get(`/servers/${serverId}/roles`),
  updateRoles: (serverId, data) => api.patch(`/servers/${serverId}/roles`, data),
}

export const logApi = {
  getLogs: (serverId, params) => api.get(`/servers/${serverId}/logs`, { params }),
}

export const statisticsApi = {
  getStatistics: (serverId) => api.get(`/servers/${serverId}/statistics`),
}

export default api