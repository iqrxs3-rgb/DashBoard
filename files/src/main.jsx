import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationCenter from './components/NotificationCenter'
import './index.css'

// Initialize stores
import { useAuthStore, useUIStore } from './store/authStore'

// Initialize auth and UI on app start
useAuthStore.getState().initialize()
useUIStore.getState().initialize()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <NotificationCenter />
    </ErrorBoundary>
  </React.StrictMode>
)