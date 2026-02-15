import express from 'express'
import {
  getUserGuilds,
  getGuildById,
  updateGuildSettings,
  addGuildAdmin,
  removeGuildAdmin,
  getGuildStats,
} from '../controllers/guildController.js'
import { authenticateToken, isGuildAdmin, isGuildOwner } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /guilds
 * Get all guilds for authenticated user
 * Headers: Authorization: Bearer <token>
 */
router.get('/', authenticateToken, getUserGuilds)

/**
 * GET /guilds/:guildId
 * Get specific guild details
 * Headers: Authorization: Bearer <token>
 */
router.get('/:guildId', authenticateToken, isGuildAdmin, getGuildById)

/**
 * PUT /guilds/:guildId
 * Update guild settings
 * Headers: Authorization: Bearer <token>
 * Body: { prefix, description, settings }
 */
router.put('/:guildId', authenticateToken, isGuildAdmin, updateGuildSettings)

/**
 * GET /guilds/:guildId/stats
 * Get guild statistics
 * Headers: Authorization: Bearer <token>
 */
router.get('/:guildId/stats', authenticateToken, isGuildAdmin, getGuildStats)

/**
 * POST /guilds/:guildId/admins
 * Add admin to guild
 * Headers: Authorization: Bearer <token>
 * Body: { userId }
 */
router.post('/:guildId/admins', authenticateToken, isGuildOwner, addGuildAdmin)

/**
 * DELETE /guilds/:guildId/admins/:userId
 * Remove admin from guild
 * Headers: Authorization: Bearer <token>
 */
router.delete('/:guildId/admins/:userId', authenticateToken, isGuildOwner, removeGuildAdmin)

export default router