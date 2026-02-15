import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { Button } from '../components'

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '1467241829492850794'
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'https://backendbe.up.railway.app/auth/discord/callback'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const setServers = useAuthStore((state) => state.setServers)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }

    const code = searchParams.get('code')
    if (code) {
      handleCallback(code)
    }
  }, [searchParams, isAuthenticated, navigate])

  const handleCallback = async (code) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authApi.login(code)
      const { token, user, servers } = response.data

      setToken(token)
      setUser(user)
      setServers(servers || [])

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordLogin = () => {
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize')
    discordAuthUrl.searchParams.append('client_id', DISCORD_CLIENT_ID)
    discordAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    discordAuthUrl.searchParams.append('response_type', 'code')
    discordAuthUrl.searchParams.append('scope', 'identify email guilds')

    window.location.href = discordAuthUrl.toString()
  }

  return (
    <div className="min-h-screen bg-discord-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-discord-lighter rounded-lg border border-discord-bg p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-discord-blurple rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">D</span>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Bot Dashboard
            </h1>
            <p className="text-gray-400 text-center">
              Manage your Discord bot with ease
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-discord-danger/20 border border-discord-danger rounded-lg">
              <p className="text-discord-danger text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-gray-400 mt-4">Logging in...</p>
            </div>
          ) : (
            <Button
              onClick={handleDiscordLogin}
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.3671C18.7812 3.584 17.0832 3 15.2869 3C12.7395 3 10.5815 4.0051 9.12 5.6145C7.6585 7.2239 6.89 9.2671 6.89 11.5408V15.2871C6.89 17.5608 7.6585 19.604 9.12 21.2134C10.5815 22.8228 12.7395 23.8279 15.2869 23.8279C17.0832 23.8279 18.7812 23.2439 20.317 22.4609V4.3671ZM19 18.6529C17.5384 19.7578 15.5098 20.5409 13.3519 20.5409C11.7156 20.5409 10.1791 20.0259 9.12 19.1208C8.0609 18.2158 7.5315 16.9509 7.5315 15.3415V11.5408C7.5315 9.9314 8.0609 8.6665 9.12 7.7614C10.1791 6.8564 11.7156 6.3414 13.3519 6.3414C15.5098 6.3414 17.5384 7.1245 19 8.2294V18.6529Z" />
              </svg>
              Continue with Discord
            </Button>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            We use Discord OAuth to verify your identity and manage your servers
          </p>
        </div>
      </div>
    </div>
  )
}