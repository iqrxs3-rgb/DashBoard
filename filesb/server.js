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
import adminRoutes from './routes/adminRoutes.js'// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001

// ============================================
// MIDDLEWARE
// ============================================

 // Add CORS middleware BEFORE your routes
app.use(cors({
  origin: [
    'https://beirut.up.railway.app',
    'http://beirut.up.railway.app' // for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('/auth/callback', cors()); // Explicitly allow preflight for this route
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
    environment: process.env.NODE_ENV || 'production',
  })
})

// Auth routes
app.use('/auth', authRoutes)

// Guild routes
app.use('/guilds', guildRoutes)

// Command routes (nested under guilds)
app.use('/api/guilds/:guildId/commands', commandRoutes)

// Role routes (nested under guilds)
app.use('/api/guilds/:guildId/roles', roleRoutes)

// Log routes (nested under guilds)
app.use('/api/guilds/:guildId/logs', logRoutes)
  
app.use('/api/admin', adminRoutes)
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
║  🚀 Server running on: https://beirut.up.railway.app}    ║
║  📦 Database: Connected                           ║
║  🔌 CORS Origin: ${process.env.FRONTEND_URL || 'https://beirut.up.railway.app'}  ║
║  ⚙️  Environment: ${process.env.NODE_ENV || 'production'}                  ║
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