import Guild from '../models/Guild.js'
import User from '../models/User.js'
import Log from '../models/Log.js'
import { successResponse, errorResponse } from '../utils/helpers.js'
import { ADMIN_DISCORD_IDS, MASTER_API_KEY } from '../utils/adminCredentials.js'
import bcrypt from 'bcryptjs'

/**
 * Verify admin credentials
 */
export const verifyAdminCredentials = async (req, res) => {
  try {
    const { username, password, apiKey } = req.body

    // Check if user is authenticated Discord admin
    const isDiscordAdmin = ADMIN_DISCORD_IDS.includes(req.user?.discordId)

    // Check API key
    const isValidApiKey = apiKey === MASTER_API_KEY

    // Check username/password
    let isValidCredentials = false
    if (username && password) {
      // In production, fetch from database
      // For now, verify against hashed credentials
      const hashedPassword = '$2a$10$YOUR_HASH' // Get from database
      isValidCredentials = await bcrypt.compare(password, hashedPassword)
    }

    if (!isDiscordAdmin && !isValidApiKey && !isValidCredentials) {
      return res.status(401).json(errorResponse('Invalid admin credentials', 401))
    }

    return res.status(200).json(
      successResponse(
        {
          adminLevel: isDiscordAdmin ? 'discord-admin' : 'credential-admin',
          permissions: ['ban-ip', 'delete-server', 'manage-users', 'view-logs', 'manage-database'],
        },
        'Admin access verified'
      )
    )
  } catch (error) {
    console.error('Admin verification error:', error)
    return res.status(500).json(errorResponse('Verification failed'))
  }
}

/**
 * Ban an IP address
 */
export const banIP = async (req, res) => {
  try {
    const { ipAddress, reason, duration } = req.body

    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    if (!ipAddress) {
      return res.status(400).json(errorResponse('IP address required', 400))
    }

    // TODO: Store banned IP in database
    // For now, just return success
    console.log(`⛔ IP Banned: ${ipAddress} - Reason: ${reason} - Duration: ${duration}`)

    return res.status(200).json(
      successResponse(
        {
          ipAddress,
          bannedAt: new Date(),
          reason,
          duration,
          status: 'active',
        },
        'IP address banned successfully'
      )
    )
  } catch (error) {
    console.error('Ban IP error:', error)
    return res.status(500).json(errorResponse('Failed to ban IP'))
  }
}

/**
 * Delete server and all its data from database
 */
export const deleteServerFromDatabase = async (req, res) => {
  try {
    const { guildId } = req.params
    const { confirmationCode } = req.body

    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    if (!guildId) {
      return res.status(400).json(errorResponse('Guild ID required', 400))
    }

    // Require confirmation code (safety measure)
    if (confirmationCode !== 'DELETE_SERVER_CONFIRM') {
      return res.status(400).json(errorResponse('Invalid confirmation code', 400))
    }

    // Get server info before deletion
    const guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Server not found', 404))
    }

    const serverName = guild.guildName

    // Delete all server data
    const deletedLogs = await Log.deleteMany({ guildId })
    const deletedGuild = await Guild.deleteOne({ guildId })

    // Log the action
    console.log(`🗑️ Server Deleted: ${serverName} (${guildId})`)
    console.log(`   Deleted logs: ${deletedLogs.deletedCount}`)

    return res.status(200).json(
      successResponse(
        {
          guildId,
          serverName,
          deletedLogsCount: deletedLogs.deletedCount,
          deletedAt: new Date(),
          status: 'deleted',
        },
        'Server deleted from database'
      )
    )
  } catch (error) {
    console.error('Delete server error:', error)
    return res.status(500).json(errorResponse('Failed to delete server'))
  }
}

/**
 * Get all servers
 */
export const getAllServersAdmin = async (req, res) => {
  try {
    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    const servers = await Guild.find().select('guildId guildName memberCount stats createdAt').sort({ createdAt: -1 })

    return res.status(200).json(
      successResponse(
        {
          totalServers: servers.length,
          servers: servers.map(s => ({
            id: s.guildId,
            name: s.guildName,
            memberCount: s.memberCount,
            commandCount: s.stats?.totalCommands || 0,
            messageCount: s.stats?.totalMessages || 0,
            createdAt: s.createdAt,
          })),
        },
        'All servers retrieved'
      )
    )
  } catch (error) {
    console.error('Get all servers error:', error)
    return res.status(500).json(errorResponse('Failed to get servers'))
  }
}

/**
 * Get all users
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    const users = await User.find()
      .select('discordId username email createdAt guilds')
      .sort({ createdAt: -1 })

    return res.status(200).json(
      successResponse(
        {
          totalUsers: users.length,
          users: users.map(u => ({
            id: u.discordId,
            username: u.username,
            email: u.email,
            serverCount: u.guilds?.length || 0,
            createdAt: u.createdAt,
          })),
        },
        'All users retrieved'
      )
    )
  } catch (error) {
    console.error('Get all users error:', error)
    return res.status(500).json(errorResponse('Failed to get users'))
  }
}

/**
 * Ban a user globally
 */
export const banUserGlobally = async (req, res) => {
  try {
    const { userId, reason } = req.body

    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    if (!userId) {
      return res.status(400).json(errorResponse('User ID required', 400))
    }

    // TODO: Add banned status to User model
    const user = await User.findOneAndUpdate(
      { discordId: userId },
      { banned: true, banReason: reason, bannedAt: new Date() },
      { new: true }
    )

    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404))
    }

    console.log(`🚫 User Banned: ${user.username} (${userId}) - Reason: ${reason}`)

    return res.status(200).json(
      successResponse(
        {
          userId,
          username: user.username,
          banned: true,
          reason,
          bannedAt: new Date(),
        },
        'User banned globally'
      )
    )
  } catch (error) {
    console.error('Ban user error:', error)
    return res.status(500).json(errorResponse('Failed to ban user'))
  }
}

/**
 * Get database statistics
 */
export const getDatabaseStats = async (req, res) => {
  try {
    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    const [totalServers, totalUsers, totalLogs] = await Promise.all([
      Guild.countDocuments(),
      User.countDocuments(),
      Log.countDocuments(),
    ])

    const totalCommands = await Guild.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalCommands' } } },
    ])

    const totalMessages = await Guild.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.totalMessages' } } },
    ])

    return res.status(200).json(
      successResponse(
        {
          database: {
            servers: totalServers,
            users: totalUsers,
            logs: totalLogs,
            totalCommands: totalCommands[0]?.total || 0,
            totalMessages: totalMessages[0]?.total || 0,
          },
          timestamp: new Date(),
        },
        'Database statistics retrieved'
      )
    )
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json(errorResponse('Failed to get statistics'))
  }
}

/**
 * Clear all logs (dangerous!)
 */
export const clearAllLogs = async (req, res) => {
  try {
    const { confirmationCode } = req.body

    // Verify admin
    if (!ADMIN_DISCORD_IDS.includes(req.user?.discordId) && req.headers['x-api-key'] !== MASTER_API_KEY) {
      return res.status(401).json(errorResponse('Admin access required', 401))
    }

    // Require confirmation
    if (confirmationCode !== 'DELETE_ALL_LOGS_CONFIRM') {
      return res.status(400).json(errorResponse('Invalid confirmation code', 400))
    }

    const result = await Log.deleteMany({})

    console.log(`🗑️ All logs deleted: ${result.deletedCount} documents`)

    return res.status(200).json(
      successResponse(
        {
          deletedCount: result.deletedCount,
          clearedAt: new Date(),
        },
        'All logs cleared'
      )
    )
  } catch (error) {
    console.error('Clear logs error:', error)
    return res.status(500).json(errorResponse('Failed to clear logs'))
  }
}