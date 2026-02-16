import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Button } from '../components'
import { Trash2, AlertTriangle, Volume2, Ban } from 'lucide-react'

const mockModerations = [
  {
    id: '1',
    type: 'warn',
    username: 'BadUser123',
    reason: 'Spamming in chat',
    issuer: 'Admin User',
    date: '2024-01-10',
    active: true,
  },
  {
    id: '2',
    type: 'mute',
    username: 'ToxicUser',
    reason: 'Offensive language',
    issuer: 'Moderator',
    date: '2024-01-09',
    duration: '24 hours',
    active: true,
  },
  {
    id: '3',
    type: 'ban',
    username: 'HackerBot',
    reason: 'Unauthorized bot activity',
    issuer: 'Admin User',
    date: '2024-01-08',
    active: true,
  },
  {
    id: '4',
    type: 'warn',
    username: 'ImprovedUser',
    reason: 'Spamming emojis',
    issuer: 'Moderator',
    date: '2024-01-05',
    active: false,
  },
]

export const ModerationPage = () => {
  const { serverId } = useParams()
  const [moderations, setModerations] = useState(mockModerations)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredModerations = moderations.filter(mod => {
    const matchesType = filterType === 'all' || mod.type === filterType
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && mod.active) || 
      (filterStatus === 'expired' && !mod.active)

    return matchesType && matchesStatus
  })

  const stats = {
    totalWarns: moderations.filter(m => m.type === 'warn').length,
    totalMutes: moderations.filter(m => m.type === 'mute').length,
    totalBans: moderations.filter(m => m.type === 'ban').length,
    activeModerations: moderations.filter(m => m.active).length,
  }

  const getModerationIcon = (type) => {
    switch(type) {
      case 'warn': return <AlertTriangle size={16} />
      case 'mute': return <Volume2 size={16} />
      case 'ban': return <Ban size={16} />
      default: return null
    }
  }

  const getModerationColor = (type) => {
    switch(type) {
      case 'warn': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'mute': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'ban': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-700/20 text-gray-300 border-gray-700/30'
    }
  }

  const handleRemoveModeration = (modId) => {
    if (window.confirm('Remove this moderation action?')) {
      setModerations(moderations.filter(m => m.id !== modId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Moderation</h1>
        <Button variant="primary">Issue Warning</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
          <div>
            <p className="text-gray-400 text-sm">Total Warnings</p>
            <p className="text-3xl font-bold text-yellow-300 mt-2">{stats.totalWarns}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <div>
            <p className="text-gray-400 text-sm">Total Mutes</p>
            <p className="text-3xl font-bold text-blue-300 mt-2">{stats.totalMutes}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <div>
            <p className="text-gray-400 text-sm">Total Bans</p>
            <p className="text-3xl font-bold text-red-300 mt-2">{stats.totalBans}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <div>
            <p className="text-gray-400 text-sm">Active Moderations</p>
            <p className="text-3xl font-bold text-purple-300 mt-2">{stats.activeModerations}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-discord-darker border border-discord-bg rounded px-3 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="warn">Warnings</option>
              <option value="mute">Mutes</option>
              <option value="ban">Bans</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-discord-darker border border-discord-bg rounded px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Moderation List */}
      <Card title={`Moderation Actions (${filteredModerations.length})`} noPadding>
        <div className="divide-y divide-discord-bg max-h-[500px] overflow-y-auto">
          {filteredModerations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No moderation actions found
            </div>
          ) : (
            filteredModerations.map(mod => (
              <div
                key={mod.id}
                className="px-6 py-4 hover:bg-discord-darker/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getModerationColor(mod.type)}`}>
                      {getModerationIcon(mod.type)}
                      {mod.type.charAt(0).toUpperCase() + mod.type.slice(1)}
                    </div>

                    <div>
                      <p className="font-medium text-white">{mod.username}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        by {mod.issuer} · {mod.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      mod.active
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-700/20 text-gray-400'
                    }`}>
                      {mod.active ? 'Active' : 'Expired'}
                    </span>
                    <button
                      onClick={() => handleRemoveModeration(mod.id)}
                      className="p-2 hover:bg-discord-lighter rounded transition-colors text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-300 ml-0">
                  <span className="text-gray-400">Reason:</span> {mod.reason}
                </p>

                {mod.duration && (
                  <p className="text-sm text-gray-400 mt-2">
                    Duration: {mod.duration}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}