import Role from '../models/Role.js'
import Log from '../models/Log.js'
import { successResponse, errorResponse, createLog } from '../utils/helpers.js'

const defaultPermissions = {
  manage_commands: false,
  manage_roles: false,
  manage_settings: false,
  view_logs: false,
  ban_users: false,
  kick_users: false,
}

/**
 * Get all roles and permissions for a guild
 */
export const getGuildRoles = async (req, res) => {
  try {
    const { guildId } = req.params

    const roles = await Role.find({ guildId }).lean()

    // If no roles exist, return default structure
    if (roles.length === 0) {
      return res.status(200).json(
        successResponse(
          [
            {
              id: 'admin',
              name: 'Administrator',
              roleId: 'admin',
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
              id: 'moderator',
              name: 'Moderator',
              roleId: 'moderator',
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
              id: 'member',
              name: 'Member',
              roleId: 'member',
              permissions: defaultPermissions,
            },
          ],
          'Roles retrieved'
        )
      )
    }

    return res.status(200).json(
      successResponse(
        roles.map(role => ({
          id: role._id,
          name: role.roleName,
          roleId: role.roleId,
          permissions: role.permissions,
        })),
        'Roles retrieved'
      )
    )
  } catch (error) {
    console.error('Get roles error:', error)
    return res.status(500).json(errorResponse('Failed to get roles'))
  }
}

/**
 * Update role permissions
 */
export const updateRolePermissions = async (req, res) => {
  try {
    const { guildId, roleId } = req.params
    const { permissions } = req.body

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json(errorResponse('Valid permissions object required', 400))
    }

    // Validate permission keys
    const validKeys = Object.keys(defaultPermissions)
    const providedKeys = Object.keys(permissions)

    for (const key of providedKeys) {
      if (!validKeys.includes(key)) {
        return res.status(400).json(errorResponse(`Invalid permission: ${key}`, 400))
      }
    }

    let role = await Role.findOne({ guildId, roleId })

    if (!role) {
      // Create new role if it doesn't exist
      role = new Role({
        guildId,
        roleId,
        roleName: roleId.charAt(0).toUpperCase() + roleId.slice(1),
        permissions: { ...defaultPermissions, ...permissions },
        updatedBy: req.user.discordId,
        updatedByName: req.user.username,
      })
    } else {
      // Update existing role
      role.permissions = { ...defaultPermissions, ...permissions }
      role.updatedBy = req.user.discordId
      role.updatedByName = req.user.username
    }

    await role.save()

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'config',
      `Role "${role.roleName}" permissions updated`,
      'UPDATE_ROLE_PERMISSIONS',
      roleId,
      role.roleName,
      permissions
    )

    return res.status(200).json(
      successResponse(
        {
          id: role._id,
          name: role.roleName,
          roleId: role.roleId,
          permissions: role.permissions,
        },
        'Role permissions updated'
      )
    )
  } catch (error) {
    console.error('Update role error:', error)
    return res.status(500).json(errorResponse('Failed to update role'))
  }
}

/**
 * Update multiple role permissions at once
 */
export const updateMultipleRoles = async (req, res) => {
  try {
    const { guildId } = req.params
    const { roles } = req.body

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json(errorResponse('Roles array required', 400))
    }

    const updatedRoles = []

    for (const roleData of roles) {
      const { roleId, roleName, permissions } = roleData

      if (!roleId) {
        return res.status(400).json(errorResponse('Role ID required', 400))
      }

      // Validate permissions
      const validKeys = Object.keys(defaultPermissions)
      if (permissions) {
        for (const key of Object.keys(permissions)) {
          if (!validKeys.includes(key)) {
            return res.status(400).json(errorResponse(`Invalid permission: ${key}`, 400))
          }
        }
      }

      let role = await Role.findOne({ guildId, roleId })

      if (!role) {
        role = new Role({
          guildId,
          roleId,
          roleName: roleName || roleId.charAt(0).toUpperCase() + roleId.slice(1),
          permissions: { ...defaultPermissions, ...permissions },
          updatedBy: req.user.discordId,
          updatedByName: req.user.username,
        })
      } else {
        role.permissions = { ...role.permissions, ...permissions }
        role.updatedBy = req.user.discordId
        role.updatedByName = req.user.username
      }

      await role.save()
      updatedRoles.push({
        id: role._id,
        name: role.roleName,
        roleId: role.roleId,
        permissions: role.permissions,
      })
    }

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'config',
      `${updatedRoles.length} role(s) permissions updated`,
      'UPDATE_MULTIPLE_ROLES'
    )

    return res.status(200).json(successResponse(updatedRoles, 'Roles updated successfully'))
  } catch (error) {
    console.error('Update multiple roles error:', error)
    return res.status(500).json(errorResponse('Failed to update roles'))
  }
}

/**
 * Get role by roleId
 */
export const getRoleById = async (req, res) => {
  try {
    const { guildId, roleId } = req.params

    const role = await Role.findOne({ guildId, roleId }).lean()

    if (!role) {
      // Return default role structure if not found
      return res.status(200).json(
        successResponse(
          {
            id: null,
            name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
            roleId,
            permissions: defaultPermissions,
          },
          'Role retrieved'
        )
      )
    }

    return res.status(200).json(
      successResponse(
        {
          id: role._id,
          name: role.roleName,
          roleId: role.roleId,
          permissions: role.permissions,
        },
        'Role retrieved'
      )
    )
  } catch (error) {
    console.error('Get role error:', error)
    return res.status(500).json(errorResponse('Failed to get role'))
  }
}