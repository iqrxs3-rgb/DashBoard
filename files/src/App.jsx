import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'

// Pages
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OverviewPage } from './pages/OverviewPage'
import { CommandsPage } from './pages/CommandsPage'
import { RolesPage } from './pages/RolesPage'
import { LogsPage } from './pages/LogsPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    // Check if user is authenticated on app load
    if (token) {
      // Optionally fetch user data
      // You can add this later
    }
  }, [token])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path=":serverId/overview" element={<OverviewPage />} />
          <Route path=":serverId/commands" element={<CommandsPage />} />
          <Route path=":serverId/roles" element={<RolesPage />} />
          <Route path=":serverId/logs" element={<LogsPage />} />
          <Route path=":serverId/statistics" element={<StatisticsPage />} />
          <Route path=":serverId/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App