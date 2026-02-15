import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components'
import { statisticsApi } from '../services/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const weeklyData = [
  { day: 'Mon', commands: 120, messages: 240 },
  { day: 'Tue', commands: 150, messages: 180 },
  { day: 'Wed', commands: 200, messages: 250 },
  { day: 'Thu', commands: 180, messages: 290 },
  { day: 'Fri', commands: 220, messages: 320 },
  { day: 'Sat', commands: 250, messages: 280 },
  { day: 'Sun', commands: 210, messages: 300 },
]

const commandsData = [
  { name: '/help', value: 450 },
  { name: '/stats', value: 320 },
  { name: '/ban', value: 180 },
  { name: '/kick', value: 210 },
  { name: '/warn', value: 280 },
]

const COLORS = ['#7289da', '#43b581', '#faa61a', '#f04747', '#5865f2']

export const StatisticsPage = () => {
  const { serverId } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [serverId])

  const loadStatistics = async () => {
    try {
      // In real scenario: const response = await statisticsApi.getStatistics(serverId)
      // setStats(response.data)
      setStats({
        totalCommands: 1890,
        totalMessages: 5620,
        uniqueUsers: 234,
        averageCommandsPerDay: 270,
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
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-gray-400 text-sm font-medium">Total Commands Executed</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.totalCommands || 0}</p>
        </Card>

        <Card>
          <p className="text-gray-400 text-sm font-medium">Total Messages</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.totalMessages || 0}</p>
        </Card>

        <Card>
          <p className="text-gray-400 text-sm font-medium">Unique Users</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.uniqueUsers || 0}</p>
        </Card>

        <Card>
          <p className="text-gray-400 text-sm font-medium">Avg Commands/Day</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.averageCommandsPerDay || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Command Usage" noPadding className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404450" />
              <XAxis dataKey="day" stroke="#999" />
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
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#43b581"
                strokeWidth={2}
                dot={{ fill: '#43b581', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Commands" noPadding className="p-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commandsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404450" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2f33',
                  border: '1px solid #40444b',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#7289da" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Command Distribution" noPadding className="p-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={commandsData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {commandsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#2c2f33',
                border: '1px solid #40444b',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}