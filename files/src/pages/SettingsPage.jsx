import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Input, Toggle } from '../components'
import { serverApi } from '../services/api'
import { Save } from 'lucide-react'

export const SettingsPage = () => {
  const { serverId } = useParams()
  const [settings, setSettings] = useState(null)
  const [originalSettings, setOriginalSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [serverId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch guild settings from backend
      const response = await serverApi.getServer(serverId)
      const guildData = response.data.data
      
      const settingsData = {
        prefix: guildData.prefix || '!',
        description: guildData.description || '',
        welcomeChannel: guildData.settings?.welcomeChannel || 'general',
        autoModeration: guildData.settings?.autoModeration || false,
        welcomeMessage: guildData.settings?.welcomeMessage || false,
        logsEnabled: guildData.settings?.logsEnabled || true,
        announcements: guildData.settings?.announcements || false,
      }
      
      setSettings(settingsData)
      setOriginalSettings(settingsData)
    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err.response?.data?.message || 'Failed to load settings')
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
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      // Prepare data for backend
      const updateData = {
        prefix: settings.prefix,
        description: settings.description,
        settings: {
          autoModeration: settings.autoModeration,
          welcomeMessage: settings.welcomeMessage,
          logsEnabled: settings.logsEnabled,
          announcements: settings.announcements,
          welcomeChannel: settings.welcomeChannel,
        }
      }
      
      // Send to backend
      await serverApi.updateServer(serverId, updateData)
      
      setOriginalSettings(settings)
      setHasChanges(false)
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to their original values?')) {
      setSettings(originalSettings)
      setHasChanges(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    )
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
              disabled={saving}
            >
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            disabled={!hasChanges || saving}
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-500/10">
          <p className="text-green-400">✓ Settings saved successfully!</p>
        </Card>
      )}

      <Card title="Bot Configuration">
        <div className="space-y-6">
          <Input
            label="Command Prefix"
            placeholder="e.g., !"
            value={settings?.prefix || ''}
            onChange={(e) => handleChange('prefix', e.target.value)}
            maxLength={5}
          />

          <Input
            label="Server Description"
            placeholder="Describe your bot's purpose"
            value={settings?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <Input
            label="Welcome Channel"
            placeholder="e.g., #general"
            value={settings?.welcomeChannel || ''}
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
              checked={settings?.autoModeration || false}
              onChange={(value) => handleChange('autoModeration', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-discord-bg">
            <div>
              <p className="font-medium text-white">Welcome Messages</p>
              <p className="text-sm text-gray-400">Send welcome messages to new members</p>
            </div>
            <Toggle
              checked={settings?.welcomeMessage || false}
              onChange={(value) => handleChange('welcomeMessage', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-discord-bg">
            <div>
              <p className="font-medium text-white">Enable Logging</p>
              <p className="text-sm text-gray-400">Log all bot activities</p>
            </div>
            <Toggle
              checked={settings?.logsEnabled || false}
              onChange={(value) => handleChange('logsEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-white">Announcements</p>
              <p className="text-sm text-gray-400">Enable announcement features</p>
            </div>
            <Toggle
              checked={settings?.announcements || false}
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
            <Button variant="danger" disabled={saving}>
              Delete All Logs
            </Button>
            <Button variant="danger" disabled={saving}>
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