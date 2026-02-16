import express from 'express'
import {
  getAuthUrl,
  handleCallback,
  refreshAccessToken,
  logout,
  getUser
} from '../controllers/authController.js'
import { authLimiter } from '../middlewares/rateLimiter.js'
import { authenticateToken } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /auth/url
 * Get Discord OAuth authorization URL
 */
router.get('/url', getAuthUrl)

/**
 * POST /auth/callback
 * Handle Discord OAuth callback
 * Body: { code }
 */
router.post('/callback', authLimiter, handleCallback)

/**
 * GET /auth/user
 * Get current authenticated user
 * Headers: Authorization: Bearer <token>
 */
router.get('/user', authenticateToken, getUser)

/**
 * POST /auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', refreshAccessToken)

/**
 * POST /auth/logout
 * Logout and invalidate tokens
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, logout)

export default router