import oauth from '../config/discord.js'
import User from '../models/User.js'
import Guild from '../models/Guild.js'
import { generateToken, successResponse, errorResponse, sanitizeUser } from '../utils/helpers.js'
   /**
 * أضف هذا الكود في authController.js
 * في آخر الملف قبل export
 */
    const jwtToken = generateToken(user.discordId)

import jwt from 'jsonwebtoken'

/**
 * Refresh Access Token
 * POST /auth/refresh
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        statusCode: 401
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret'
    )

    // Get user
    const user = await User.findById(decoded.userId)

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        statusCode: 401
      })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '15m' }
    )

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newAccessToken,
        expiresIn: 900 
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        statusCode: 401
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      statusCode: 401
    })
  }
}

/**
 * Logout
 * POST /auth/logout
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user?.userId // من token middleware

    if (userId) {
      // حذف refresh token من DB
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 }
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
}
/**
 * Get Discord OAuth authorization URL
 */
export const getAuthUrl = (req, res) => {
  try {
    const authUrl = oauth.authorizeURL({
      client_id: process.env.DISCORD_CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${process.env.FRONTEND_URL || 'https://beirut.up.railway.app'}/callback`,
      scope: ['identify', 'email', 'guilds'],
    })

    return res.status(200).json(successResponse({ authUrl }, 'Auth URL generated'))
  } catch (error) {
    console.error('Auth URL error:', error)
    return res.status(500).json(errorResponse('Failed to generate auth URL'))
  }
}

/**
 * Handle Discord OAuth callback
 */
export const handleCallback = async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json(errorResponse('Authorization code required', 400))
    }

    // Exchange code for access token
    const token = await oauth.tokenRequest({
      code,
      scope: ['identify', 'email', 'guilds'],
      grantType: 'authorization_code',
    })

    // Get user info
    const userInfo = await oauth.getUser(token.access_token)
    const userGuilds = await oauth.getUserGuilds(token.access_token)

    console.log('User Discord ID:', userInfo.id)
    console.log('User Guilds:', userGuilds.map(g => ({
      id: g.id,
      name: g.name,
      ownerId: g.owner ? '(Owner)' : '',
      permissions: g.permissions,
    })))

    // Filter guilds - include if user is owner OR has admin/manage guild permissions
    const botGuilds = userGuilds
      .filter(guild => {
        // User is owner of guild
        const isOwner = guild.owner === true
        // User has Administrator permission (0x8)
        const hasAdminPerm = (guild.permissions & 0x8) === 0x8
        // User has Manage Guild permission (0x20)
        const hasManageGuild = (guild.permissions & 0x20) === 0x20

        return isOwner || hasAdminPerm || hasManageGuild
      })
      .map(guild => ({
        guildId: guild.id,
        guildName: guild.name,
        guildIcon: guild.icon,
        isOwner: guild.owner === true,
        isAdmin: (guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20,
      }))

    console.log('Filtered Guilds (accessible):', botGuilds)

    // Find or create user
    let user = await User.findOne({ discordId: userInfo.id })

    if (user) {
      // Update existing user
      user.username = userInfo.username
      user.avatar = userInfo.avatar
      user.email = userInfo.email
      user.accessToken = token.access_token
      user.refreshToken = token.refresh_token
      user.tokenExpiry = new Date(Date.now() + token.expires_in * 1000)
      user.guilds = botGuilds
    } else {
      // Create new user
      user = new User({
        discordId: userInfo.id,
        username: userInfo.username,
        avatar: userInfo.avatar,
        email: userInfo.email,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpiry: new Date(Date.now() + token.expires_in * 1000),
        guilds: botGuilds,
      })
    }

    await user.save()

    // Ensure guilds exist in database
    for (const guild of botGuilds) {
      const existingGuild = await Guild.findOne({ guildId: guild.guildId })
      if (!existingGuild) {
        await Guild.create({
          guildId: guild.guildId,
          guildName: guild.guildName,
          guildIcon: guild.guildIcon,
          ownerId: userInfo.id,
          ownerName: userInfo.username,
          memberCount: 0,
          prefix: '!',
          description: `${guild.guildName} Bot Settings`,
          settings: {
            autoModeration: false,
            welcomeMessage: false,
            logsEnabled: true,
            announcements: false,
            welcomeChannel: 'general',
          },
          stats: {
            totalCommands: 0,
            totalMessages: 0,
            totalUsers: 0,
            activeUsers: 0,
          },
        })
      } else {
        // Update existing guild with latest info
        existingGuild.guildName = guild.guildName
        existingGuild.guildIcon = guild.guildIcon
        await existingGuild.save()
      }
    }

    // Generate JWT token
    const jwtToken = generateToken(user.discordId)

    return res.status(200).json(
      successResponse(
        {
          token: jwtToken,
          user: sanitizeUser(user),
          servers: botGuilds.map(g => ({
            id: g.guildId,
            name: g.guildName,
            icon: g.guildIcon,
            isOwner: g.isOwner,
            isAdmin: g.isAdmin,
          })),
        },
        'Authentication successful'
      )
    )
  } catch (error) {
    console.error('Callback error:', error)
    return res.status(500).json(errorResponse('Authentication failed. Please try again.'))
  }
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json(successResponse(sanitizeUser(req.user), 'User retrieved'))
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json(errorResponse('Failed to get user info'))
  }
}

/**
 * Get user guilds
 */
export const getUserGuilds = async (req, res) => {
  try {
    const guilds = req.user.guilds.map(g => ({
      id: g.guildId,
      name: g.guildName,
      icon: g.guildIcon,
      isOwner: g.isOwner,
      isAdmin: g.isAdmin,
    }))

    return res.status(200).json(successResponse(guilds, 'Guilds retrieved'))
  } catch (error) {
    console.error('Get user guilds error:', error)
    return res.status(500).json(errorResponse('Failed to get guilds'))
  }
}



 

    // Refresh the token
    const token = await oauth.tokenRequest({
      refresh_token: user.refreshToken,
      grantType: 'refresh_token',
    })

    // Update user token info
    user.accessToken = token.access_token
    if (token.refresh_token) {
      user.refreshToken = token.refresh_token
    }
    user.tokenExpiry = new Date(Date.now() + token.expires_in * 1000)
    await user.save()

    // Generate new JWT token
