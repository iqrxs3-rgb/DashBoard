import { create } from 'zustand'

const STORAGE_KEY = 'discord_dashboard_auth'
const REFRESH_TOKEN_KEY = 'discord_dashboard_refresh'
const USER_KEY = 'discord_dashboard_user'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(STORAGE_KEY) || null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  servers: [],
  selectedServer: null,
  isLoading: false,
  error: null,

  // Set user data
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
    set({ user })
  },

  // Set access token
  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    set({ token })
  },

  // Set refresh token
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
    set({ refreshToken })
  },

  // Set both tokens at once (useful after login)
  setTokens: (token, refreshToken) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }

    set({ token, refreshToken })
  },

  // Set servers
  setServers: (servers) => set({ servers }),

  // Select a server
  setSelectedServer: (serverId) => set({ selectedServer: serverId }),

  // Set loading state
  setIsLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Logout - clear all data
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({
      user: null,
      token: null,
      refreshToken: null,
      servers: [],
      selectedServer: null,
      error: null,
    })
  },

  // Check if authenticated
  isAuthenticated: () => !!get().token,

  // Initialize from localStorage (call on app start)
  initialize: () => {
    const token = localStorage.getItem(STORAGE_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)

    set({
      token: token || null,
      refreshToken: refreshToken || null,
      user: userStr ? JSON.parse(userStr) : null,
    })
  },
}))

// ==========================================
// UI Store (للـ UI State)
// ==========================================

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: localStorage.getItem('dashboard_theme') || 'dark',
  notifications: [],

  // Toggle sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Set theme
  setTheme: (theme) => {
    localStorage.setItem('dashboard_theme', theme)
    set({ theme })
  },

  // Add notification
  addNotification: (notification) => {
    const id = Date.now()
    const notif = { id, ...notification }
    
    set((state) => ({
      notifications: [...state.notifications, notif]
    }))

    // Auto remove after 5 seconds if no duration specified
    const duration = notification.duration || 5000
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }, duration)

    return id
  },

  // Remove notification
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Clear all notifications
  clearNotifications: () => set({ notifications: [] }),

  // Initialize from localStorage
  initialize: () => {
    const theme = localStorage.getItem('dashboard_theme') || 'dark'
    set({ theme })
  },
}))