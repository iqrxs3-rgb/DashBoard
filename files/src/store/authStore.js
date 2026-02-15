import { create } from 'zustand'

const STORAGE_KEY = 'discord_dashboard_auth'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(STORAGE_KEY) || null,
  servers: [],
  selectedServer: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    set({ token })
  },

  setServers: (servers) => set({ servers }),

  setSelectedServer: (serverId) => set({ selectedServer: serverId }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ 
      user: null, 
      token: null, 
      servers: [],
      selectedServer: null
    })
  },

  isAuthenticated: () => !!get().token,
}))

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}))