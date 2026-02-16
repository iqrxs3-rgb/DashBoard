import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Button, Input } from '../components'
import { Search, Trash2, Shield, AlertCircle } from 'lucide-react'

const mockMembers = [
  { id: '1', username: 'Admin User', avatar: 'avatar1.png', joinedAt: '2023-01-15', role: 'Admin', status: 'online' },
  { id: '2', username: 'Moderator', avatar: 'avatar2.png', joinedAt: '2023-02-20', role: 'Moderator', status: 'online' },
  { id: '3', username: 'Regular User', avatar: 'avatar3.png', joinedAt: '2023-03-10', role: 'Member', status: 'offline' },
  { id: '4', username: 'New Member', avatar: 'avatar4.png', joinedAt: '2024-01-05', role: 'Member', status: 'online' },
  { id: '5', username: 'Active User', avatar: 'avatar5.png', joinedAt: '2023-06-12', role: 'Member', status: 'online' },
]

export const MembersPage = () => {
  const { serverId } = useParams()
  const [members, setMembers] = useState(mockMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const roles = ['all', ...new Set(members.map(m => m.role))]
  const statuses = ['all', 'online', 'offline']

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(members.filter(m => m.id !== memberId))
    }
  }

  const handlePromoteToMod = (memberId) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, role: 'Moderator' } : m
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Members</h1>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{members.length}</p>
          <p className="text-gray-400 text-sm">Total Members</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-discord-darker border border-discord-bg rounded px-3 py-2 text-white"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-discord-darker border border-discord-bg rounded px-3 py-2 text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Members List */}
      <Card title={`Members (${filteredMembers.length})`} noPadding>
        <div className="divide-y divide-discord-bg max-h-[600px] overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No members found matching your filters
            </div>
          ) : (
            filteredMembers.map(member => (
              <div
                key={member.id}
                className="px-6 py-4 hover:bg-discord-darker/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center text-white font-bold">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                      member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-white">{member.username}</p>
                    <p className="text-sm text-gray-400">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.role === 'Admin'
                        ? 'bg-purple-500/20 text-purple-300'
                        : member.role === 'Moderator'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-gray-700/20 text-gray-300'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {member.role !== 'Admin' && (
                    <button
                      onClick={() => handlePromoteToMod(member.id)}
                      className="p-2 hover:bg-discord-lighter rounded transition-colors text-gray-400 hover:text-yellow-400"
                      title="Promote to Moderator"
                    >
                      <Shield size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 hover:bg-discord-lighter rounded transition-colors text-gray-400 hover:text-red-400"
                    title="Remove member"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-gray-400 text-sm">Online Members</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {members.filter(m => m.status === 'online').length}
          </p>
        </Card>

        <Card>
          <p className="text-gray-400 text-sm">Moderators</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {members.filter(m => m.role === 'Moderator').length}
          </p>
        </Card>

        <Card>
          <p className="text-gray-400 text-sm">New Members (7d)</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {members.filter(m => {
              const joinDate = new Date(m.joinedAt)
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              return joinDate > sevenDaysAgo
            }).length}
          </p>
        </Card>
      </div>

      {/* Info */}
      <Card className="bg-blue-500/5 border-blue-500/30 flex items-start gap-3">
        <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-medium text-white">Bulk Actions Coming Soon</p>
          <p className="text-sm text-gray-400 mt-1">
            Soon you'll be able to perform bulk actions like bulk ban, bulk kick, and bulk role assignment.
          </p>
        </div>
      </Card>
    </div>
  )
}