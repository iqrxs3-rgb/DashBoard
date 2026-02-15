import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, token, isAuthenticated, logout } = useAuthStore()

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  return {
    user,
    token,
    isAuthenticated: isAuthenticated(),
    logout: handleLogout,
  }
}