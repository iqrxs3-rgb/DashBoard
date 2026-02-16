import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Card, Button, Input } from '../components'
import { Lock, Server, Users, AlertTriangle, Trash2, Ban, Database } from 'lucide-react'

const AdminLoginPage = ({ onAdminLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          apiKey: apiKey || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      onAdminLogin(data.data)
    } catch (err) {
      setError('Connection error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-discord-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex items-center justify-center mb-6">
            <Lock className="text-red-500" size={40} />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-center text-sm mb-6">
            Restricted access - Only authorized admins
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <Input
                type="text"
                placeholder="Admin username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <Input
                type="password"
                placeholder="Admin password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Or API Key</label>
              <Input
                type="password"
                placeholder="Master API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Login to Admin Panel'}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Unauthorized access attempts are logged
          </p>
        </Card>
      </div>
    </div>
  )
}

export const AdminPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLevel, setAdminLevel] = useState(null)
  const [stats, setStats] = useState(null)
  const [servers, setServers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showBanIPForm, setShowBanIPForm] = useState(false)
  const [banIpData, setBanIpData] = useState({ ip: '', reason: '' })

  const handleAdminLogin = async (adminData) => {
    setIsAdmin(true)
    setAdminLevel(adminData.adminLevel)
    await loadAdminData()
  }

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, serversRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/servers'),
        fetch('/api/admin/users'),
      ])

      const statsData = await statsRes.json()
      const serversData = await serversRes.json()
      const usersData = await usersRes.json()

      setStats(statsData.data)
      setServers(serversData.data.servers)
      setUsers(usersData.data.users)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteServer = async (guildId, serverName) => {
    try {
      const response = await fetch(`/api/admin/servers/${guildId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: 'DELETE_SERVER_CONFIRM' }),
      })

      if (response.ok) {
        setServers(servers.filter(s => s.id !== guildId))
        setShowDeleteConfirm(null)
        alert(`Server "${serverName}" deleted!`)
      } else {
        alert('Failed to delete server')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error deleting server')
    }
  }

  const handleBanIP = async () => {
    try {
      const response = await fetch('/api/admin/ban-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: banIpData.ip,
          reason: banIpData.reason,
          duration: 'permanent',
        }),
      })

      if (response.ok) {
        alert(`IP ${banIpData.ip} banned!`)
        setBanIpData({ ip: '', reason: '' })
        setShowBanIPForm(false)
      }
    } catch (error) {
      console.error('Ban IP error:', error)
    }
  }

  if (!isAdmin) {
    return <AdminLoginPage onAdminLogin={handleAdminLogin} />
  }

  return (
    <div className="min-h-screen bg-discord-bg p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Lock className="text-red-500" size={40} />
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-2">
              Level: <span className="text-yellow-400 font-semibold uppercase">{adminLevel}</span>
            </p>
          </div>
          <Button variant="danger" onClick={() => setIsAdmin(false)}>
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-discord-bg">
          {['dashboard', 'servers', 'users', 'tools'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedTab === tab
                  ? 'text-discord-blurple border-b-2 border-discord-blurple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-blue-500/10 border-blue-500/30">
                <p className="text-gray-400 text-sm">Total Servers</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">
                  {stats?.database?.servers || 0}
                </p>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">
                  {stats?.database?.users || 0}
                </p>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {stats?.database?.logs || 0}
                </p>
              </Card>

              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <p className="text-gray-400 text-sm">Total Commands</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">
                  {stats?.database?.totalCommands || 0}
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Servers Tab */}
        {selectedTab === 'servers' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Server size={28} />
              Server Management ({servers.length})
            </h2>

            <Card noPadding>
              <div className="divide-y divide-discord-bg max-h-[600px] overflow-y-auto">
                {servers.map(server => (
                  <div
                    key={server.id}
                    className="px-6 py-4 hover:bg-discord-darker/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{server.name}</p>
                      <p className="text-sm text-gray-400">
                        {server.memberCount} members • {server.commandCount} commands
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm(server.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <Card className="border-red-500/50 bg-red-500/10">
                <p className="text-red-400 font-semibold mb-4">
                  ⚠️ Are you sure? This will delete all server data!
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    onClick={() => {
                      const server = servers.find(s => s.id === showDeleteConfirm)
                      handleDeleteServer(showDeleteConfirm, server?.name)
                    }}
                  >
                    Delete Permanently
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users size={28} />
              User Management ({users.length})
            </h2>

            <Card noPadding>
              <div className="divide-y divide-discord-bg max-h-[600px] overflow-y-auto">
                {users.map(userData => (
                  <div
                    key={userData.id}
                    className="px-6 py-4 hover:bg-discord-darker/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{userData.username}</p>
                      <p className="text-sm text-gray-400">
                        {userData.email} • {userData.serverCount} servers
                      </p>
                    </div>

                    <button className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400">
                      <Ban size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tools Tab */}
        {selectedTab === 'tools' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database size={28} />
              Admin Tools
            </h2>

            {/* Ban IP */}
            <Card className="border-orange-500/30 bg-orange-500/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Ban size={20} className="text-orange-400" />
                Ban IP Address
              </h3>

              {showBanIPForm ? (
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="IP address (e.g., 192.168.1.1)"
                    value={banIpData.ip}
                    onChange={(e) => setBanIpData({ ...banIpData, ip: e.target.value })}
                  />
                  <Input
                    type="text"
                    placeholder="Reason for ban"
                    value={banIpData.reason}
                    onChange={(e) => setBanIpData({ ...banIpData, reason: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={handleBanIP}>
                      Ban IP
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowBanIPForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setShowBanIPForm(true)}
                >
                  Ban an IP
                </Button>
              )}
            </Card>

            {/* Clear Logs */}
            <Card className="border-red-500/30 bg-red-500/10">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                Clear All Logs
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                ⚠️ This action cannot be undone. All system logs will be deleted.
              </p>
              <Button variant="danger">
                Clear All Logs (Requires Confirmation)
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}