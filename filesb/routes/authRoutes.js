import Log from '../models/Log.js'
import { successResponse, errorResponse } from '../utils/helpers.js';
const router = express.Router();
import oauth from '../config/discord.js';
import express from "express";
router.get("/discord", (req, res) => {
  res.send("Auth route working");
});

// POST /auth/callback - receives code from frontend
router.post("/callback", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "No code provided",
      statusCode: 400
    });
  }

  try {
    const user = await oauth.tokenRequest({
      code,
      scope: ['identify', 'email', 'guilds'],
      grantType: 'authorization_code',
    });

    const userInfo = await oauth.getUser(user.access_token);
    const guilds = await oauth.getUserGuilds(user.access_token);

    const adminGuilds = guilds.filter(g => (g.permissions & 0x8) === 0x8);

    return res.status(200).json({
      success: true,
      data: {
        token: user.access_token,
        user: {
          id: userInfo.id,
          username: userInfo.username,
          avatar: userInfo.avatar,
          email: userInfo.email,
        },
        servers: adminGuilds.map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          isAdmin: (g.permissions & 0x8) === 0x8,
        })),
      }
    });
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({
      success: false,
      error: "OAuth failed",
      statusCode: 500
    });
  }
});

// GET /auth/me - get current user
router.get("/me", async (req, res) => {
  try {
    // Verify token and return user info
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }
    
    // Verify token with Discord
    const userInfo = await oauth.getUser(token);
    
    return res.status(200).json({
      success: true,
      data: userInfo
    });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
// Export functions
export const getGuildLogs = async (req, res) => {
  try {
    const { guildId } = req.params
    const { type, severity, userId, page = 1, limit = 20, startDate, endDate } = req.query

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    let query = { guildId }

    // Filter by type
    if (type && ['command', 'moderation', 'error', 'system', 'config'].includes(type)) {
      query.type = type
    }

    // Filter by severity
    if (severity && ['info', 'warning', 'error'].includes(severity)) {
      query.severity = severity
    }

    // Filter by user
    if (userId) {
      query.userId = userId
    }

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) {
        query.timestamp.$gte = new Date(startDate)
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate)
      }
    }

    // Get total count
    const total = await Log.countDocuments(query)

    // Get logs
    const logs = await Log.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean()

    return res.status(200).json(
      successResponse(
        {
          logs: logs.map(log => ({
            id: log._id,
            timestamp: log.timestamp,
            userId: log.userId,
            username: log.username,
            type: log.type,
            message: log.message,
            severity: log.severity,
            action: log.action,
            targetId: log.targetId,
            targetName: log.targetName,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
        'Logs retrieved'
      )
    )
  } catch (error) {
    console.error('Get logs error:', error)
    return res.status(500).json(errorResponse('Failed to get logs'))
  }
}

export const getLogById = async (req, res) => {
  try {
    const { guildId, logId } = req.params

    const log = await Log.findOne({ _id: logId, guildId }).lean()
    if (!log) {
      return res.status(404).json(errorResponse('Log not found', 404))
    }

    return res.status(200).json(
      successResponse(
        {
          id: log._id,
          timestamp: log.timestamp,
          userId: log.userId,
          username: log.username,
          type: log.type,
          message: log.message,
          severity: log.severity,
          action: log.action,
          targetId: log.targetId,
          targetName: log.targetName,
          metadata: log.metadata,
        },
        'Log retrieved'
      )
    )
  } catch (error) {
    console.error('Get log error:', error)
    return res.status(500).json(errorResponse('Failed to get log'))
  }
}

export const clearGuildLogs = async (req, res) => {
  try {
    const { guildId } = req.params

    const result = await Log.deleteMany({ guildId })

    // Log the action
    const LogModel = (await import('../models/Log.js')).default
    const logEntry = new LogModel({
      guildId,
      userId: req.user.discordId,
      username: req.user.username,
      type: 'system',
      message: 'All logs cleared',
      severity: 'warning',
      action: 'CLEAR_LOGS',
    })
    await logEntry.save()

    return res.status(200).json(
      successResponse(
        { deletedCount: result.deletedCount },
        'All logs cleared'
      )
    )
  } catch (error) {
    console.error('Clear logs error:', error)
    return res.status(500).json(errorResponse('Failed to clear logs'))
  }
}

export const getLogStatistics = async (req, res) => {
  try {
    const { guildId } = req.params
    const { days = 7 } = req.query

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    // Get stats by type
    const statsByType = await Log.aggregate([
      {
        $match: {
          guildId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ])

    // Get stats by severity
    const statsBySeverity = await Log.aggregate([
      {
        $match: {
          guildId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ])

    // Get top users
    const topUsers = await Log.aggregate([
      {
        $match: {
          guildId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$username',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ])

    return res.status(200).json(
      successResponse(
        {
          period: { days: parseInt(days), startDate },
          byType: statsByType,
          bySeverity: statsBySeverity,
          topUsers,
        },
        'Log statistics retrieved'
      )
    ) 

  } catch (error) {
    console.error('Get log stats error:', error)
    return res.status(500).json(errorResponse('Failed to get log statistics'))
  }
}

export default router;