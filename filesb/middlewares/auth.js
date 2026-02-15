import { verifyToken, errorResponse } from '../utils/helpers.js'
import User from '../models/User.js'

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json(errorResponse('Access token required', 401))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json(errorResponse('Invalid or expired token', 401))
    }

    // Fetch user from database
    const user = await User.findOne({ discordId: decoded.userId })
    if (!user) {
      return res.status(401).json(errorResponse('User not found', 401))
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json(errorResponse('Authentication failed', 401))
  }
}

/**
 * Check if user is admin of a specific guild
 */
export const isGuildAdmin = (req, res, next) => {
  try {
    const { guildId } = req.params
    if (!guildId) {
      return res.status(400).json(errorResponse('Guild ID is required', 400))
    }

    const guild = req.user.guilds.find(g => g.guildId === guildId)
    if (!guild || !guild.isAdmin) {
      return res.status(403).json(errorResponse('Insufficient permissions. Admin access required', 403))
    }

    req.guildId = guildId
    next()
  } catch (error) {
    console.error('Admin check error:', error)
    return res.status(403).json(errorResponse('Permission check failed', 403))
  }
}

/**
 * Check if user owns the guild
 */
export const isGuildOwner = (req, res, next) => {
  try {
    const { guildId } = req.params
    if (!guildId) {
      return res.status(400).json(errorResponse('Guild ID is required', 400))
    }

    const guild = req.user.guilds.find(g => g.guildId === guildId && g.isAdmin)
    if (!guild) {
      return res.status(403).json(errorResponse('Only guild owner can perform this action', 403))
    }

    req.guildId = guildId
    next()
  } catch (error) {
    console.error('Owner check error:', error)
    return res.status(403).json(errorResponse('Permission check failed', 403))
  }
}