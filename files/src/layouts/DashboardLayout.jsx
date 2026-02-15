import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar, Sidebar } from '../components'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/authStore'

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const { serverId } = useParams()
  const servers = useAuthStore((state) => state.servers)
  const selectedServer = useAuthStore((state) => state.selectedServer)
  const setSelectedServer = useAuthStore((state) => state.setSelectedServer)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  useEffect(() => {
    // If no server is selected but we have a serverId in the URL, select it
    if (serverId && serverId !== selectedServer) {
      setSelectedServer(serverId)
    }
  }, [serverId, selectedServer, setSelectedServer])

  return (
    <div className="h-screen flex flex-col bg-discord-bg">
      <Navbar servers={servers} />

      <div className="flex flex-1 overflow-hidden">
        {serverId && <Sidebar />}

        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            serverId && sidebarOpen ? '' : ''
          }`}
        >
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}