import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components'
import { statisticsApi } from '../services/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Users, MessageSquare, Zap, TrendingUp } from 'lucide-react'

const mockChartData = [
  { date: 'Mon', commands: 120, users: 240 },
  { date: 'Tue', commands: 150, users: 180 },
  { date: 'Wed', commands: 200, users: 250 },
  { date: 'Thu', commands: 180, users: 290 },
  { date: 'Fri', commands: 220, users: 320 },
  { date: 'Sat', commands: 250, users: 280 },
  { date: 'Sun', commands: 210, users: 300 },
]

export const OverviewPage = () => {
  const { serverId } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [serverId])

  const loadStatistics = async () => {
    try {
      // In real scenario, fetch from API
      // const response = await statisticsApi.getStatistics(serverId)
      // setStats(response.data)

      // Mock data for demo
      setStats({
        totalUsers: 1234,
        totalCommands: 5678,
        activeUsers: 456,
        uptime: '99.8%',
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading overview...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.totalUsers || 0}
            </p>
          </div>
          <Users className="text-discord-blurple" size={28} />
        </Card>

        <Card className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Commands</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.totalCommands || 0}
            </p>
          </div>
          <Zap className="text-discord-warning" size={28} />
        </Card>

        <Card className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Users</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.activeUsers || 0}
            </p>
          </div>
          <TrendingUp className="text-discord-success" size={28} />
        </Card>

        <Card className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Uptime</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.uptime || '0%'}
            </p>
          </div>
          <MessageSquare className="text-discord-danger" size={28} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Commands Usage" noPadding className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404450" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2f33',
                  border: '1px solid #40444b',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="commands"
                stroke="#7289da"
                strokeWidth={2}
                dot={{ fill: '#7289da', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="User Activity" noPadding className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404450" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2f33',
                  border: '1px solid #40444b',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="users" fill="#43b581" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Recent Activity">
        <div className="space-y-3">
          {[
            { user: 'John#1234', action: 'Used command /help', time: '5 min ago' },
            { user: 'Jane#5678', action: 'Joined the server', time: '12 min ago' },
            { user: 'Bot#0000', action: 'Sent notification', time: '23 min ago' },
            { user: 'Admin#9999', action: 'Updated settings', time: '1 hour ago' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between pb-3 border-b border-discord-bg last:border-0">
              <div>
                <p className="font-medium text-white">{activity.user}</p>
                <p className="text-sm text-gray-400">{activity.action}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}