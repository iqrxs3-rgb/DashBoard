import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import { Button, Card, Input, Modal, Table } from '../components'
const response = await commandApi.getCommands(guildId)
const mockCommands = [
  { id: 1, name: 'help', description: 'Show help information', enabled: true },
  { id: 2, name: 'ban', description: 'Ban a user from the server', enabled: true },
  { id: 3, name: 'kick', description: 'Kick a user from the server', enabled: false },
  { id: 4, name: 'warn', description: 'Warn a user', enabled: true },
  { id: 5, name: 'mute', description: 'Mute a user temporarily', enabled: true },
]

export const CommandsPage = () => {
  const { serverId } = useParams()
  const [commands, setCommands] = useState(mockCommands)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', enabled: true })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCommands()
  }, [serverId])

  const loadCommands = async () => {
    try {
      setLoading(true)
      // In real scenario: const response = await commandApi.getCommands(serverId)
      // setCommands(response.data)
    } catch (error) {
      console.error('Error loading commands:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Command name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.name.length > 32) newErrors.name = 'Command name must be 32 characters or less'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenModal = (command = null) => {
    if (command) {
      setEditingCommand(command)
      setFormData(command)
    } else {
      setEditingCommand(null)
      setFormData({ name: '', description: '', enabled: true })
    }
    setErrors({})
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCommand(null)
    setFormData({ name: '', description: '', enabled: true })
    setErrors({})
  }

  const handleSaveCommand = async () => {
    if (!validateForm()) return

    try {
      if (editingCommand) {
        // await commandApi.updateCommand(serverId, editingCommand.id, formData)
        setCommands(commands.map(cmd => cmd.id === editingCommand.id ? { ...editingCommand, ...formData } : cmd))
      } else {
        // await commandApi.createCommand(serverId, formData)
        setCommands([...commands, { id: Date.now(), ...formData }])
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving command:', error)
    }
  }

  const handleDeleteCommand = async (commandId) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      try {
        // await commandApi.deleteCommand(serverId, commandId)
        setCommands(commands.filter(cmd => cmd.id !== commandId))
      } catch (error) {
        console.error('Error deleting command:', error)
      }
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'enabled',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          value ? 'bg-discord-success/20 text-discord-success' : 'bg-gray-600/20 text-gray-400'
        }`}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-2 text-discord-blurple hover:bg-discord-lighter rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteCommand(value)}
            className="p-2 text-discord-danger hover:bg-discord-lighter rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Commands</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Command
        </Button>
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={commands}
          isLoading={loading}
          emptyMessage="No commands yet. Create your first command!"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCommand ? 'Edit Command' : 'Create Command'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Command Name"
            placeholder="e.g., help, ban, kick"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            disabled={editingCommand ? true : false}
          />

          <Input
            label="Description"
            placeholder="Describe what this command does"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
          />

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-300 cursor-pointer">
              Enable this command
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSaveCommand}
            >
              {editingCommand ? 'Update Command' : 'Create Command'}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}