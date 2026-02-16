import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components'
import { serverApi } from '../services/api'
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

export const OverviewPage = () => {
  const { serverId } = useParams()
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStatistics()
  }, [serverId])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch guild statistics from backend
      const response = await serverApi.getServer(serverId)
      const guildData = response.data.data

      // Set basic stats
      setStats({
        totalUsers: guildData.memberCount || 0,
        totalCommands: 0, // Will be set from logs
        activeUsers: 0,
        uptime: '99.8%',
      })

      // Generate chart data (you can replace this with real data from backend)
      const generateChartData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return days.map(day => ({
          date: day,
          commands: Math.floor(Math.random() * 300) + 50,
          users: Math.floor(Math.random() * 400) + 100,
        }))
      }

      setChartData(generateChartData())

      // Set recent activity from logs
      const recentLogs = guildData.recentLogs || []
      setRecentActivity(
        recentLogs.map(log => ({
          user: log.type,
          action: log.message,
          time: new Date(log.timestamp).toLocaleDateString(),
        }))
      )
    } catch (err) {
      console.error('Error loading statistics:', err)
      setError(err.response?.data?.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading overview...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <Card className="border-red-500 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </Card>
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
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between pb-3 border-b border-discord-bg last:border-0">
                <div>
                  <p className="font-medium text-white">{activity.user}</p>
                  <p className="text-sm text-gray-400">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  )
}