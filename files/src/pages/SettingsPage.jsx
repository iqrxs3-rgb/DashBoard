import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Input, Toggle } from '../components'
import { serverApi } from '../services/api'
import { Save } from 'lucide-react'

const mockServerSettings = {
  prefix: '!',
  autoModeration: true,
  welcomeMessage: true,
  logsEnabled: true,
  announcements: false,
  welcomeChannel: '#general',
  description: 'My awesome Discord bot',
}

export const SettingsPage = () => {
  const { serverId } = useParams()
  const [settings, setSettings] = useState(mockServerSettings)
  const [originalSettings, setOriginalSettings] = useState(mockServerSettings)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [serverId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In real scenario: const response = await serverApi.getServer(serverId)
      // setSettings(response.data)
      // setOriginalSettings(response.data)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings))
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // await serverApi.updateServer(serverId, settings)
      setOriginalSettings(settings)
      setHasChanges(false)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to their original values?')) {
      setSettings(originalSettings)
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            disabled={!hasChanges || loading}
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Save Settings
          </Button>
        </div>
      </div>

      <Card title="Bot Configuration">
        <div className="space-y-6">
          <Input
            label="Command Prefix"
            placeholder="e.g., !"
            value={settings.prefix}
            onChange={(e) => handleChange('prefix', e.target.value)}
            maxLength={5}
          />

          <Input
            label="Server Description"
            placeholder="Describe your bot's purpose"
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <Input
            label="Welcome Channel"
            placeholder="e.g., #general"
            value={settings.welcomeChannel}
            onChange={(e) => handleChange('welcomeChannel', e.target.value)}
          />
        </div>
      </Card>

      <Card title="Features">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-discord-bg">
            <div>
              <p className="font-medium text-white">Auto Moderation</p>
              <p className="text-sm text-gray-400">Automatically moderate harmful content</p>
            </div>
            <Toggle
              checked={settings.autoModeration}
              onChange={(value) => handleChange('autoModeration', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-discord-bg">
            <div>
              <p className="font-medium text-white">Welcome Messages</p>
              <p className="text-sm text-gray-400">Send welcome messages to new members</p>
            </div>
            <Toggle
              checked={settings.welcomeMessage}
              onChange={(value) => handleChange('welcomeMessage', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-discord-bg">
            <div>
              <p className="font-medium text-white">Enable Logging</p>
              <p className="text-sm text-gray-400">Log all bot activities</p>
            </div>
            <Toggle
              checked={settings.logsEnabled}
              onChange={(value) => handleChange('logsEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">Announcements</p>
              <p className="text-sm text-gray-400">Enable announcement features</p>
            </div>
            <Toggle
              checked={settings.announcements}
              onChange={(value) => handleChange('announcements', value)}
            />
          </div>
        </div>
      </Card>

      <Card title="Danger Zone" className="border-discord-danger">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            These actions are irreversible. Please be careful.
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="danger" disabled={loading}>
              Delete All Logs
            </Button>
            <Button variant="danger" disabled={loading}>
              Reset All Settings
            </Button>
          </div>
        </div>
      </Card>

      {hasChanges && (
        <div className="bg-discord-warning/20 border border-discord-warning rounded-lg p-4">
          <p className="text-discord-warning text-sm">
            You have unsaved changes. Click "Save Settings" to apply them.
          </p>
        </div>
      )}
    </div>
  )
}