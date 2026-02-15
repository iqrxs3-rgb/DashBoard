import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB, disconnectDB } from './config/database.js'
import { globalErrorHandler, notFoundHandler, catchAsync } from './middlewares/errorHandler.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import guildRoutes from './routes/guildRoutes.js'
import commandRoutes from './routes/commandRoutes.js'
import roleRoutes from './routes/roleRoutes.js'
import logRoutes from './routes/logRoutes.js'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://beirut.up.railway.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Request logging
app.use(morgan('combined'))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Guild routes
app.use('/api/guilds', guildRoutes)

// Command routes (nested under guilds)
app.use('/api/guilds/:guildId/commands', commandRoutes)

// Role routes (nested under guilds)
app.use('/api/guilds/:guildId/roles', roleRoutes)

// Log routes (nested under guilds)
app.use('/api/guilds/:guildId/logs', logRoutes)

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(globalErrorHandler)

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║  Discord Bot Dashboard Backend                     ║
╠════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}    ║
║  📦 Database: Connected                           ║
║  🔌 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}  ║
║  ⚙️  Environment: ${process.env.NODE_ENV || 'development'}                  ║
╚════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await disconnectDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await disconnectDB()
  process.exit(0)
})

// Start the server
startServer()

export default app