import express from 'express'
import {
  getAuthUrl,
  handleCallback,
  getUser,
  getUserGuilds,
  logout,
  refreshAccessToken,
} from '../controllers/authController.js'
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
 */
router.post('/callback', handleCallback)

/**
 * GET /auth/user
 * Get current authenticated user
 * Requires: Authorization header with Bearer token
 */
router.get('/user', authenticateToken, getUser)

/**
 * GET /auth/guilds
 * Get user's guilds
 * Requires: Authorization header with Bearer token
 */
router.get('/guilds', authenticateToken, getUserGuilds)

/**
 * POST /auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', refreshAccessToken)

/**
 * POST /auth/logout
 * Logout user
 * Requires: Authorization header with Bearer token
 */
router.post('/logout', authenticateToken, logout)

export default router