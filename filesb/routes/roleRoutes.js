import express from 'express'
import {
  getGuildRoles,
  getRoleById,
  updateRolePermissions,
  updateMultipleRoles,
} from '../controllers/roleController.js'
import { authenticateToken, isGuildAdmin } from '../middlewares/auth.js'
import { validateInput, validateRole } from '../utils/validators.js'

const router = express.Router({ mergeParams: true })

/**
 * GET /guilds/:guildId/roles
 * Get all roles and permissions for a guild
 * Headers: Authorization: Bearer <token>
 */
router.get('/', authenticateToken, isGuildAdmin, getGuildRoles)

/**
 * GET /guilds/:guildId/roles/:roleId
 * Get specific role
 * Headers: Authorization: Bearer <token>
 */
router.get('/:roleId', authenticateToken, isGuildAdmin, getRoleById)

/**
 * PUT /guilds/:guildId/roles/:roleId
 * Update role permissions
 * Headers: Authorization: Bearer <token>
 * Body: { permissions }
 */
router.put('/:roleId', authenticateToken, isGuildAdmin, validateInput(validateRole), updateRolePermissions)

/**
 * PUT /guilds/:guildId/roles
 * Update multiple roles
 * Headers: Authorization: Bearer <token>
 * Body: { roles: [{ roleId, roleName, permissions }] }
 */
router.put('/', authenticateToken, isGuildAdmin, validateInput(validateRole), updateMultipleRoles)

export default router