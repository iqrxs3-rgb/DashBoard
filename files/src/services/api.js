import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
  getAuthUrl: () => api.get('/auth/url'),
  login: (code) => api.post('/auth/callback', { code }),
  getUser: () => api.get('/auth/user'),
  getCurrentUser: () => api.get('/auth/user'), // Alias for backward compatibility
  getGuilds: () => api.get('/auth/guilds'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
}

// Backward compatibility - serverApi is the same as guildApi
export const serverApi = {
  getServers: () => api.get('/guilds'),
  getServer: (serverId) => api.get(`/guilds/${serverId}`),
  updateServer: (serverId, data) => api.put(`/guilds/${serverId}`, data),
}

export const guildApi = {
  getGuilds: () => api.get('/guilds'),
  getGuild: (guildId) => api.get(`/guilds/${guildId}`),
  updateGuild: (guildId, data) => api.put(`/guilds/${guildId}`, data),
}

export const commandApi = {
  getCommands: (guildId, params) => api.get(`/api/guilds/${guildId}/commands`, { params }),
  createCommand: (guildId, data) => api.post(`/api/guilds/${guildId}/commands`, data),
  updateCommand: (guildId, commandId, data) => api.put(`/api/guilds/${guildId}/commands/${commandId}`, data),
  deleteCommand: (guildId, commandId) => api.delete(`/api/guilds/${guildId}/commands/${commandId}`),
}

export const roleApi = {
  getRoles: (guildId) => api.get(`/api/guilds/${guildId}/roles`),
  createRole: (guildId, data) => api.post(`/api/guilds/${guildId}/roles`, data),
  updateRole: (guildId, roleId, data) => api.put(`/api/guilds/${guildId}/roles/${roleId}`, data),
  deleteRole: (guildId, roleId) => api.delete(`/api/guilds/${guildId}/roles/${roleId}`),
}

export const logApi = {
  getLogs: (guildId, params) => api.get(`/api/guilds/${guildId}/logs`, { params }),
  getLogById: (guildId, logId) => api.get(`/api/guilds/${guildId}/logs/${logId}`),
}

export const statisticsApi = {
  getStatistics: (guildId) => api.get(`/api/guilds/${guildId}/statistics`),
}

export default api