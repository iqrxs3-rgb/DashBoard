import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore, useUIStore } from '../store/authStore'
import { getDiscordAvatarUrl, getDiscordServerIcon } from '../utils/helpers'

export const Navbar = ({ servers = [] }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const selectedServer = useAuthStore((state) => state.selectedServer)
  const setSelectedServer = useAuthStore((state) => state.setSelectedServer)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSelectServer = (serverId) => {
    setSelectedServer(serverId)
    navigate(`/dashboard/${serverId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-discord-darker border-b border-discord-bg px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-discord-lighter rounded-lg transition-colors md:hidden"
          >
            <Menu size={20} />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 min-w-max">
            <div className="w-8 h-8 bg-discord-blurple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className="font-semibold text-white hidden sm:inline">Dashboard</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          {servers.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto flex-wrap justify-center">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => handleSelectServer(server.id)}
                  className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    selectedServer === server.id
                      ? 'bg-discord-blurple'
                      : server.isAdmin
                      ? 'bg-discord-lighter hover:bg-discord-bg'
                      : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  } ${!server.isAdmin && 'pointer-events-none'}`}
                  disabled={!server.isAdmin}
                >
                  <img
                    src={getDiscordServerIcon(server.id, server.icon)}
                    alt={server.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-white hidden sm:inline max-w-[150px] truncate">
                    {server.name}
                  </span>
                  {!server.isAdmin && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Requires admin
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-discord-lighter transition-colors"
              >
                <img
                  src={getDiscordAvatarUrl(user.id, user.avatar)}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-white hidden sm:inline">
                  {user.username}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-discord-darker border border-discord-lighter rounded-lg shadow-lg z-50">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-discord-lighter transition-colors rounded-t-lg"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-discord-danger hover:bg-discord-lighter transition-colors rounded-b-lg"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}