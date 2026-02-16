import express from 'express'
import { authenticate } from '../middlewares/auth.js'
import {
  verifyAdminCredentials,
  banIP,
  deleteServerFromDatabase,
  getAllServersAdmin,
  getAllUsersAdmin,
  banUserGlobally,
  getDatabaseStats,
  clearAllLogs,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require authentication
router.use(authenticate)

/**
 * Admin Authentication
 */
router.post('/verify-credentials', verifyAdminCredentials)

/**
 * Dashboard Statistics
 */
router.get('/stats', getDatabaseStats)

/**
 * Server Management
 */
router.get('/servers', getAllServersAdmin)
router.delete('/servers/:guildId', deleteServerFromDatabase)

/**
 * User Management
 */
router.get('/users', getAllUsersAdmin)
router.post('/users/:userId/ban', banUserGlobally)

/**
 * IP Management
 */
router.post('/ban-ip', banIP)

/**
 * Logs Management
 */
router.delete('/logs/clear-all', clearAllLogs)

export default router