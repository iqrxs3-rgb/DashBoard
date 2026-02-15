import express from 'express'
import {
  getGuildLogs,
  getLogById,
  clearGuildLogs,
  getLogStatistics,
} from '../controllers/logController.js'
import { authenticateToken, isGuildAdmin, isGuildOwner } from '../middlewares/auth.js'

const router = express.Router({ mergeParams: true })

/**
 * GET /guilds/:guildId/logs
 * Get logs for a guild with pagination and filtering
 * Headers: Authorization: Bearer <token>
 * Query: { type, severity, userId, page, limit, startDate, endDate }
 */
router.get('/', authenticateToken, isGuildAdmin, getGuildLogs)

/**
 * GET /guilds/:guildId/logs/stats
 * Get log statistics
 * Headers: Authorization: Bearer <token>
 * Query: { days }
 */
router.get('/stats', authenticateToken, isGuildAdmin, getLogStatistics)

/**
 * GET /guilds/:guildId/logs/:logId
 * Get specific log
 * Headers: Authorization: Bearer <token>
 */
router.get('/:logId', authenticateToken, isGuildAdmin, getLogById)

/**
 * DELETE /guilds/:guildId/logs
 * Clear all logs for a guild
 * Headers: Authorization: Bearer <token>
 */
router.delete('/', authenticateToken, isGuildOwner, clearGuildLogs)

export default router