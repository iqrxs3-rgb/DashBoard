import oauth from '../config/discord.js'
import User from '../models/User.js'
import Guild from '../models/Guild.js'
import { generateToken, successResponse, errorResponse, sanitizeUser, sanitizeGuild } from '../utils/helpers.js'

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

    // Filter guilds where bot is present and check admin permissions
    const botGuilds = userGuilds
      .filter(guild => {
        // Check if guild exists in our database (bot is in guild)
        return (guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20
      })
      .map(guild => ({
        guildId: guild.id,
        guildName: guild.name,
        guildIcon: guild.icon,
        isAdmin: (guild.permissions & 0x8) === 0x8, // Administrator permission
      }))

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
        })
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
      isAdmin: g.isAdmin,
    }))

    return res.status(200).json(successResponse(guilds, 'Guilds retrieved'))
  } catch (error) {
    console.error('Get user guilds error:', error)
    return res.status(500).json(errorResponse('Failed to get guilds'))
  }
}

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    // In a real app, you might invalidate the refresh token
    return res.status(200).json(successResponse(null, 'Logged out successfully'))
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json(errorResponse('Logout failed'))
  }
}

/**
 * Refresh access token
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const user = req.user

    // Check if refresh token is expired
    if (!user.refreshToken || !user.tokenExpiry || user.tokenExpiry < new Date()) {
      return res.status(401).json(errorResponse('Refresh token expired. Please login again.', 401))
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
    const jwtToken = generateToken(user.discordId)

    return res.status(200).json(successResponse({ token: jwtToken }, 'Token refreshed'))
  } catch (error) {
    console.error('Token refresh error:', error)
    return res.status(401).json(errorResponse('Failed to refresh token'))
  }
}