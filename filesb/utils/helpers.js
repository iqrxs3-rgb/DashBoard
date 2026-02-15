import jwt from 'jsonwebtoken'

/**
 * Generate JWT token
 */
export const generateToken = (userId, expiresIn = '24h') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn })
}

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Decode JWT without verification (for debugging)
 */
export const decodeToken = (token) => {
  return jwt.decode(token)
}

/**
 * Generate error response
 */
export const errorResponse = (message, statusCode = 400, details = null) => {
  return {
    success: false,
    error: message,
    statusCode,
    ...(details && { details }),
  }
}

/**
 * Generate success response
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    statusCode,
    data,
  }
}

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if user is admin of guild
 */
export const isGuildAdmin = (user, guildId) => {
  if (!user || !user.guilds) return false
  const guild = user.guilds.find(g => g.guildId === guildId)
  return guild && guild.isAdmin === true
}

/**
 * Format error message
 */
export const formatError = (error) => {
  if (error.message) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

/**
 * Sanitize guild object for frontend
 */
export const sanitizeGuild = (guild) => {
  return {
    id: guild.guildId,
    name: guild.guildName,
    icon: guild.guildIcon,
    ownerId: guild.ownerId,
    memberCount: guild.memberCount || 0,
  }
}

/**
 * Sanitize user object for frontend
 */
export const sanitizeUser = (user) => {
  return {
    id: user.discordId,
    username: user.username,
    avatar: user.avatar,
    email: user.email,
  }
}

/**
 * Sanitize command for frontend
 */
export const sanitizeCommand = (command) => {
  return {
    id: command._id,
    name: command.name,
    description: command.description,
    enabled: command.enabled,
    createdAt: command.createdAt,
    updatedAt: command.updatedAt,
  }
}

/**
 * Log action to database
 */
export const createLog = async (Log, guildId, userId, username, type, message, action, targetId = null, targetName = null, metadata = null) => {
  try {
    const log = new Log({
      guildId,
      userId,
      username,
      type,
      message,
      severity: type === 'error' ? 'error' : 'info',
      action,
      targetId,
      targetName,
      metadata,
    })
    await log.save()
    return log
  } catch (error) {
    console.error('Failed to create log:', error)
    return null
  }
}

/**
 * Validate command name
 */
export const isValidCommandName = (name) => {
  // Command names must be alphanumeric, hyphens, underscores, 1-32 characters
  return /^[a-z0-9_-]{1,32}$/.test(name)
}

/**
 * Validate guild prefix
 */
export const isValidPrefix = (prefix) => {
  return prefix && prefix.length <= 5 && prefix.length >= 1
}