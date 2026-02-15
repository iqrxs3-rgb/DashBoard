import { Link, useParams } from 'react-router-dom'
import {
  BarChart3,
  Command,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react'
import { useUIStore } from '../store/authStore'

const menuItems = [
  { icon: BarChart3, label: 'Overview', path: 'overview' },
  { icon: Command, label: 'Commands', path: 'commands' },
  { icon: Shield, label: 'Roles', path: 'roles' },
  { icon: FileText, label: 'Logs', path: 'logs' },
  { icon: TrendingUp, label: 'Statistics', path: 'statistics' },
  { icon: Settings, label: 'Settings', path: 'settings' },
]

export const Sidebar = ({ isOpen, onClose }) => {
  const { serverId } = useParams()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  if (!serverId) return null

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar()
    }
  }

  return (
    <>
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      <div
        className={`fixed md:static left-0 top-0 h-full w-64 bg-discord-darker border-r border-discord-bg z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-discord-bg md:hidden">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button
            onClick={() => toggleSidebar()}
            className="p-2 hover:bg-discord-lighter rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = window.location.pathname.includes(item.path)
            return (
              <Link
                key={item.path}
                to={`/dashboard/${serverId}/${item.path}`}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-discord-blurple text-white'
                    : 'text-gray-300 hover:bg-discord-lighter'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}