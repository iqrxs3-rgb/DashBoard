import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Toggle } from '../components'
import { Save } from 'lucide-react'

const mockRoles = [
  {
    id: 1,
    name: 'Administrator',
    permissions: {
      manage_commands: true,
      manage_roles: true,
      manage_settings: true,
      view_logs: true,
      ban_users: true,
      kick_users: true,
    },
  },
  {
    id: 2,
    name: 'Moderator',
    permissions: {
      manage_commands: false,
      manage_roles: false,
      manage_settings: false,
      view_logs: true,
      ban_users: true,
      kick_users: true,
    },
  },
  {
    id: 3,
    name: 'Member',
    permissions: {
      manage_commands: false,
      manage_roles: false,
      manage_settings: false,
      view_logs: false,
      ban_users: false,
      kick_users: false,
    },
  },
]

const allPermissions = [
  { id: 'manage_commands', label: 'Manage Commands', description: 'Can create and edit commands' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Can manage role permissions' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Can change bot settings' },
  { id: 'view_logs', label: 'View Logs', description: 'Can view bot activity logs' },
  { id: 'ban_users', label: 'Ban Users', description: 'Can ban users from the server' },
  { id: 'kick_users', label: 'Kick Users', description: 'Can kick users from the server' },
]

export const RolesPage = () => {
  const { serverId } = useParams()
  const [roles, setRoles] = useState(mockRoles)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [serverId])

  const loadRoles = async () => {
    try {
      setLoading(true)
      // In real scenario: const response = await roleApi.getRoles(serverId)
      // setRoles(response.data)
    } catch (error) {
      console.error('Error loading roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (roleId, permissionId, value) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permissionId]: value,
          },
        }
      }
      return role
    }))
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      // await roleApi.updateRoles(serverId, { roles })
      setHasChanges(false)
      alert('Roles updated successfully!')
    } catch (error) {
      console.error('Error saving roles:', error)
      alert('Failed to save roles')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !roles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading roles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Role Permissions</h1>
        <Button
          variant="primary"
          disabled={!hasChanges || loading}
          onClick={handleSaveChanges}
          className="flex items-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {roles.map((role) => (
          <Card key={role.id} title={role.name} noPadding className="overflow-hidden">
            <div className="divide-y divide-discord-bg">
              {allPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-discord-darker/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{permission.label}</p>
                    <p className="text-sm text-gray-400">{permission.description}</p>
                  </div>
                  <Toggle
                    checked={role.permissions[permission.id] || false}
                    onChange={(value) => handlePermissionChange(role.id, permission.id, value)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {hasChanges && (
        <div className="bg-discord-warning/20 border border-discord-warning rounded-lg p-4">
          <p className="text-discord-warning text-sm">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}
    </div>
  )
}