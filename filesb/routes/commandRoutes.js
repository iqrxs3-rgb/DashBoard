import express from 'express'
import {
  getGuildCommands,
  getCommandById,
  createCommand,
  updateCommand,
  deleteCommand,
  bulkUpdateCommands,
} from '../controllers/commandController.js'
import { authenticateToken, isGuildAdmin } from '../middlewares/auth.js'

const router = express.Router({ mergeParams: true })

/**
 * GET /guilds/:guildId/commands
 * Get all commands for a guild
 * Headers: Authorization: Bearer <token>
 * Query: { enabled, search }
 */
router.get('/', authenticateToken, isGuildAdmin, getGuildCommands)

/**
 * POST /guilds/:guildId/commands
 * Create new command
 * Headers: Authorization: Bearer <token>
 * Body: { name, description, enabled }
 */
router.post('/', authenticateToken, isGuildAdmin, createCommand)

/**
 * GET /guilds/:guildId/commands/:commandId
 * Get specific command
 * Headers: Authorization: Bearer <token>
 */
router.get('/:commandId', authenticateToken, isGuildAdmin, getCommandById)

/**
 * PUT /guilds/:guildId/commands/:commandId
 * Update command
 * Headers: Authorization: Bearer <token>
 * Body: { description, enabled }
 */
router.put('/:commandId', authenticateToken, isGuildAdmin, updateCommand)

/**
 * DELETE /guilds/:guildId/commands/:commandId
 * Delete command
 * Headers: Authorization: Bearer <token>
 */
router.delete('/:commandId', authenticateToken, isGuildAdmin, deleteCommand)

/**
 * POST /guilds/:guildId/commands/bulk-update
 * Bulk update commands
 * Headers: Authorization: Bearer <token>
 * Body: { commandIds, enabled }
 */
router.post('/bulk-update', authenticateToken, isGuildAdmin, bulkUpdateCommands)

export default router