import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = 'https://backendbe.up.railway.app/'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
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
  
  getServers: () => apiClient.get('/servers'),
  getServer: (serverId) => apiClient.get(`/servers/${serverId}`),
  updateServer: (serverId, data) => apiClient.patch(`/servers/${serverId}`, data),
}

export const commandApi = {
  getCommands: (serverId) => apiClient.get(`/servers/${serverId}/commands`),
  createCommand: (serverId, data) => apiClient.post(`/servers/${serverId}/commands`, data),
  updateCommand: (serverId, commandId, data) => apiClient.patch(`/servers/${serverId}/commands/${commandId}`, data),
  deleteCommand: (serverId, commandId) => apiClient.delete(`/servers/${serverId}/commands/${commandId}`),
}

export const roleApi = {
  getRoles: (serverId) => apiClient.get(`/servers/${serverId}/roles`),
  updateRoles: (serverId, data) => apiClient.patch(`/servers/${serverId}/roles`, data),
}

export const logApi = {
  getLogs: (serverId, params) => apiClient.get(`/servers/${serverId}/logs`, { params }),
}

export const statisticsApi = {
  getStatistics: (serverId) => apiClient.get(`/servers/${serverId}/statistics`),
}

export default apiClient