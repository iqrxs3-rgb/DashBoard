import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components'
import { Users, Zap, MessageSquare, TrendingUp } from 'lucide-react'

export const DashboardHomePage = () => {
  const navigate = useNavigate()
  const servers = useAuthStore((state) => state.servers)
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    totalServers: 0,
    totalUsers: 0,
    totalCommands: 0,
    activeServers: 0,
  })

  useEffect(() => {
    // Calculate stats from servers
    setStats({
      totalServers: servers.length,
      totalUsers: servers.length * 100, // Placeholder
      totalCommands: servers.length * 500,
      activeServers: servers.filter(s => s.isAdmin || s.isOwner).length,
    })
  }, [servers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-400">
          Manage all your Discord servers from one place
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Servers</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalServers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Servers</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.activeServers}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Commands</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalCommands}</p>
            </div>
            <Zap className="text-purple-400" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
            </div>
            <MessageSquare className="text-pink-400" size={32} />
          </div>
        </Card>
      </div>

      {/* Your Servers */}
      <Card title="Your Servers">
        {servers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No servers available. Add the bot to a server to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <div
                key={server.id}
                onClick={() => navigate(`/dashboard/${server.id}/overview`)}
                className="p-4 bg-discord-lighter rounded-lg border border-discord-bg hover:border-discord-blurple transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {server.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=256`}
                      alt={server.name}
                      className="w-12 h-12 rounded-full group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-discord-blurple flex items-center justify-center text-white font-bold">
                      {server.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-discord-blurple transition-colors">
                      {server.name}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {server.isOwner && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                          Owner
                        </span>
                      )}
                      {server.isAdmin && (
                        <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <Card title="Quick Links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://discord.com/oauth2/authorize?client_id=1467241829492850794&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fbeirut.up.railway.app%2Fcallback&integration_type=0&scope=bot+identify+guilds+email"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-discord-lighter rounded-lg hover:bg-discord-bg transition-colors text-white font-medium"
          >
            📱 Add Bot to Server
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-discord-lighter rounded-lg hover:bg-discord-bg transition-colors text-white font-medium"
          >
            💬 Open Discord
          </a>
          <a
            href="#docs"
            className="p-4 bg-discord-lighter rounded-lg hover:bg-discord-bg transition-colors text-white font-medium"
          >
            📚 Documentation
          </a>
          <a
            href="#support"
            className="p-4 bg-discord-lighter rounded-lg hover:bg-discord-bg transition-colors text-white font-medium"
          >
            🆘 Support Server
          </a>
        </div>
      </Card>

      {/* Tips */}
      <Card title="💡 Tips & Tricks" className="border-blue-500/30 bg-blue-500/5">
        <ul className="space-y-2 text-gray-300">
          <li>✨ Use the settings page to customize your bot's behavior</li>
          <li>📊 Check statistics to see your server's activity</li>
          <li>🎯 Manage commands for each server separately</li>
          <li>📝 View logs to track all bot actions</li>
          <li>👥 Control who can use admin features with roles</li>
        </ul>
      </Card>
    </div>
  )
}