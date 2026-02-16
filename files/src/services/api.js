import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// استخدم environment variable أو URL محلي
const API_BASE_URL = process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'https://backendbe.up.railway.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request Interceptor - إضافة التوكن
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

// Response Interceptor - معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // إذا كان الخطأ 401 والطلب لم يُحاول مرة أخرى
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // محاولة تحديث التوكن
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { timeout: 5000 }
          )

          const newToken = response.data.data.token
          useAuthStore.getState().setToken(newToken)

          // إعادة محاولة الطلب الأصلي
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          // لا يوجد refresh token، تسجيل خروج
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } catch (refreshError) {
        // فشل تحديث التوكن
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // معالجة الأخطاء الأخرى
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data)
    }

    if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data)
    }

    return Promise.reject(error)
  }
)

// ==========================================
// API Endpoints
// ==========================================

export const authApi = {
  getAuthUrl: () => api.get('/auth/url'),
  login: (code) => api.post('/auth/callback', { code }),
  getCurrentUser: () => api.get('/auth/user'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
}

export const guildApi = {
  getGuilds: () => api.get('/guilds'),
  getGuild: (guildId) => api.get(`/guilds/${guildId}`),
  updateGuild: (guildId, data) => api.put(`/guilds/${guildId}`, data),
}

export const commandApi = {
  getCommands: (guildId, params) => 
    api.get(`/api/guilds/${guildId}/commands`, { params }),
  createCommand: (guildId, data) => 
    api.post(`/api/guilds/${guildId}/commands`, data),
  updateCommand: (guildId, commandId, data) => 
    api.put(`/api/guilds/${guildId}/commands/${commandId}`, data),
  deleteCommand: (guildId, commandId) => 
    api.delete(`/api/guilds/${guildId}/commands/${commandId}`),
}

export const roleApi = {
  getRoles: (guildId) => 
    api.get(`/api/guilds/${guildId}/roles`),
  createRole: (guildId, data) => 
    api.post(`/api/guilds/${guildId}/roles`, data),
  updateRole: (guildId, roleId, data) => 
    api.put(`/api/guilds/${guildId}/roles/${roleId}`, data),
  deleteRole: (guildId, roleId) => 
    api.delete(`/api/guilds/${guildId}/roles/${roleId}`),
}

export const logApi = {
  getLogs: (guildId, params) => 
    api.get(`/api/guilds/${guildId}/logs`, { params }),
  getLogById: (guildId, logId) => 
    api.get(`/api/guilds/${guildId}/logs/${logId}`),
}

export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  banUser: (userId, reason) => 
    api.post('/api/admin/ban-user', { userId, reason }),
}

export default api