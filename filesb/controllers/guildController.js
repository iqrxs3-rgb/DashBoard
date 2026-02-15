import Guild from '../models/Guild.js'
import Command from '../models/Command.js'
import Role from '../models/Role.js'
import Log from '../models/Log.js'
import { successResponse, errorResponse, sanitizeGuild, createLog } from '../utils/helpers.js'

/**
 * Get all guilds for authenticated user
 */
export const getUserGuilds = async (req, res) => {
  try {
    const guilds = req.user.guilds
      .filter(g => g.isAdmin)
      .map(g => ({
        id: g.guildId,
        name: g.guildName,
        icon: g.guildIcon,
        isAdmin: g.isAdmin,
      }))

    return res.status(200).json(successResponse(guilds, 'User guilds retrieved'))
  } catch (error) {
    console.error('Get user guilds error:', error)
    return res.status(500).json(errorResponse('Failed to get guilds'))
  }
}

/**
 * Get specific guild details
 */
export const getGuildById = async (req, res) => {
  try {
    const { guildId } = req.params

    const guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Guild not found', 404))
    }

    return res.status(200).json(
      successResponse(
        {
          id: guild.guildId,
          name: guild.guildName,
          icon: guild.guildIcon,
          ownerId: guild.ownerId,
          ownerName: guild.ownerName,
          memberCount: guild.memberCount,
          prefix: guild.prefix,
          description: guild.description,
          settings: guild.settings,
        },
        'Guild retrieved'
      )
    )
  } catch (error) {
    console.error('Get guild error:', error)
    return res.status(500).json(errorResponse('Failed to get guild'))
  }
}

/**
 * Update guild settings
 */
export const updateGuildSettings = async (req, res) => {
  try {
    const { guildId } = req.params
    const { prefix, description, settings } = req.body

    // Validate prefix
    if (prefix && (prefix.length > 5 || prefix.length < 1)) {
      return res.status(400).json(errorResponse('Prefix must be 1-5 characters', 400))
    }

    let guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Guild not found', 404))
    }

    // Update fields if provided
    if (prefix) guild.prefix = prefix
    if (description) guild.description = description
    if (settings) {
      guild.settings = { ...guild.settings, ...settings }
    }

    await guild.save()

    // Log the change
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'config',
      `Guild settings updated`,
      'UPDATE_SETTINGS',
      guildId,
      guild.guildName,
      { prefix, settings }
    )

    return res.status(200).json(successResponse(guild, 'Guild settings updated'))
  } catch (error) {
    console.error('Update guild error:', error)
    return res.status(500).json(errorResponse('Failed to update guild'))
  }
}

/**
 * Add admin to guild
 */
export const addGuildAdmin = async (req, res) => {
  try {
    const { guildId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json(errorResponse('User ID required', 400))
    }

    const guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Guild not found', 404))
    }

    if (!guild.admins.includes(userId)) {
      guild.admins.push(userId)
      await guild.save()

      await createLog(
        Log,
        guildId,
        req.user.discordId,
        req.user.username,
        'config',
        `User added as admin`,
        'ADD_ADMIN',
        userId,
        null
      )
    }

    return res.status(200).json(successResponse(guild, 'Admin added'))
  } catch (error) {
    console.error('Add admin error:', error)
    return res.status(500).json(errorResponse('Failed to add admin'))
  }
}

/**
 * Remove admin from guild
 */
export const removeGuildAdmin = async (req, res) => {
  try {
    const { guildId, userId } = req.params

    const guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Guild not found', 404))
    }

    guild.admins = guild.admins.filter(id => id !== userId)
    await guild.save()

    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'config',
      `User removed from admins`,
      'REMOVE_ADMIN',
      userId,
      null
    )

    return res.status(200).json(successResponse(guild, 'Admin removed'))
  } catch (error) {
    console.error('Remove admin error:', error)
    return res.status(500).json(errorResponse('Failed to remove admin'))
  }
}

/**
 * Get guild statistics
 */
export const getGuildStats = async (req, res) => {
  try {
    const { guildId } = req.params

    const guild = await Guild.findOne({ guildId })
    if (!guild) {
      return res.status(404).json(errorResponse('Guild not found', 404))
    }

    const commandCount = await Command.countDocuments({ guildId })
    const logCount = await Log.countDocuments({ guildId })
    const recentLogs = await Log.find({ guildId }).sort({ timestamp: -1 }).limit(7).lean()

    return res.status(200).json(
      successResponse(
        {
          guildId,
          guildName: guild.guildName,
          commandCount,
          logCount,
          memberCount: guild.memberCount,
          prefix: guild.prefix,
          recentLogs: recentLogs.map(log => ({
            id: log._id,
            timestamp: log.timestamp,
            type: log.type,
            message: log.message,
            severity: log.severity,
          })),
        },
        'Guild stats retrieved'
      )
    )
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json(errorResponse('Failed to get guild stats'))
  }
}