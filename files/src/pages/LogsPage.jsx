import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Table } from '../components'
import { logApi } from '../services/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '../utils/helpers'

const mockLogs = [
  { id: 1, timestamp: new Date(Date.now() - 3600000), type: 'command', message: 'User executed /help', severity: 'info' },
  { id: 2, timestamp: new Date(Date.now() - 7200000), type: 'moderation', message: 'User warned', severity: 'warning' },
  { id: 3, timestamp: new Date(Date.now() - 10800000), type: 'error', message: 'Database connection failed', severity: 'error' },
  { id: 4, timestamp: new Date(Date.now() - 14400000), type: 'command', message: 'User executed /stats', severity: 'info' },
  { id: 5, timestamp: new Date(Date.now() - 18000000), type: 'moderation', message: 'User banned', severity: 'error' },
  { id: 6, timestamp: new Date(Date.now() - 21600000), type: 'system', message: 'Bot restarted', severity: 'info' },
  { id: 7, timestamp: new Date(Date.now() - 25200000), type: 'command', message: 'User executed /ping', severity: 'info' },
  { id: 8, timestamp: new Date(Date.now() - 28800000), type: 'moderation', message: 'User muted', severity: 'warning' },
]

export const LogsPage = () => {
  const { serverId } = useParams()
  const [logs, setLogs] = useState(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState(mockLogs)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterType, setFilterType] = useState('all')
  const itemsPerPage = 10

  useEffect(() => {
    loadLogs()
  }, [serverId])

  useEffect(() => {
    filterLogs()
  }, [logs, filterType])

  const loadLogs = async () => {
    try {
      setLoading(true)
      // In real scenario: const response = await logApi.getLogs(serverId)
      // setLogs(response.data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs
    if (filterType !== 'all') {
      filtered = logs.filter(log => log.type === filterType)
    }
    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIdx, endIdx)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-discord-danger'
      case 'warning':
        return 'text-discord-warning'
      case 'info':
      default:
        return 'text-discord-success'
    }
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => formatDate(value),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-discord-lighter text-white capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => (
        <span className={`font-semibold capitalize ${getSeverityColor(value)}`}>
          {value}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Activity Logs</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-300">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-discord-darker border border-discord-lighter rounded-lg text-white focus:outline-none focus:border-discord-blurple transition-colors"
          >
            <option value="all">All Types</option>
            <option value="command">Command</option>
            <option value="moderation">Moderation</option>
            <option value="error">Error</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="overflow-x-auto mb-6">
          <Table
            columns={columns}
            data={paginatedLogs}
            isLoading={loading}
            emptyMessage="No logs found"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-discord-bg">
          <div className="text-sm text-gray-400">
            Showing {startIdx + 1} to {Math.min(endIdx, filteredLogs.length)} of {filteredLogs.length} logs
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <div className="flex items-center gap-2 px-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded transition-colors ${
                    currentPage === page
                      ? 'bg-discord-blurple text-white'
                      : 'bg-discord-lighter text-gray-300 hover:bg-discord-bg'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}