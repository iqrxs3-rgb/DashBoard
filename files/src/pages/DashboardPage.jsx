
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const servers = useAuthStore((state) => state.servers)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // If user has servers, redirect to first admin server
    if (servers.length > 0) {
      const adminServer = servers.find(s => s.isAdmin)
      if (adminServer) {
        navigate(`/dashboard/${adminServer.id}/overview`)
      }
    }
  }, [servers, navigate])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome to Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Manage your Discord bot servers efficiently
        </p>
      </div>

      {servers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Servers Yet</h2>
            <p className="text-gray-400">
              You don't have admin access to any servers with this bot.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card title="Your Servers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servers.map((server) => (
                <div
                  key={server.id}
                  onClick={() => {
                    if (server.isAdmin) {
                      navigate(`/dashboard/${server.id}/overview`)
                    }
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    server.isAdmin
                      ? 'bg-discord-lighter border-discord-bg cursor-pointer hover:border-discord-blurple'
                      : 'bg-gray-700/30 border-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {server.icon && (
                      <img
                        src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=256`}
                        alt={server.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{server.name}</h3>
                      <p className="text-sm text-gray-400">
                        {server.isAdmin ? 'Admin' : 'No admin access'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Getting Started">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-discord-blurple font-bold mt-0.5">1</span>
                <span>Select a server from the list above to get started</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-discord-blurple font-bold mt-0.5">2</span>
                <span>Configure commands and settings for your bot</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-discord-blurple font-bold mt-0.5">3</span>
                <span>Monitor activity through logs and statistics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-discord-blurple font-bold mt-0.5">4</span>
                <span>Manage roles and permissions for your team</span>
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}