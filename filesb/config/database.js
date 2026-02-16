import mongoose from 'mongoose'

// Store multiple connections - one per server
const serverConnections = new Map()

export const connectDB = async () => {
  try {
    // Main connection for authentication, users, etc
    const mainConn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-bot-main'
    )
    console.log(`✅ MongoDB Main Database Connected: ${mainConn.connection.host}`)
    return mainConn
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Get or create a connection for a specific server
 * @param {string} guildId - Discord guild/server ID
 * @param {string} guildName - Discord guild/server name
 * @returns {mongoose.Connection} Server-specific database connection
 */
export const getServerConnection = async (guildId, guildName) => {
  try {
    // Return existing connection if already created
    if (serverConnections.has(guildId)) {
      return serverConnections.get(guildId)
    }

    // Create database name from server name (lowercase, replace spaces with underscores)
    const dbName = `discord-bot-${guildName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}-${guildId}`

    // Create new connection for this server
    const serverConn = mongoose.createConnection(
      process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`,
      {
        dbName: dbName,
      }
    )

    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      serverConn.once('connected', resolve)
      serverConn.once('error', reject)
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    })

    console.log(`✅ Server Database Created: ${dbName}`)

    // Store the connection for future use
    serverConnections.set(guildId, serverConn)

    return serverConn
  } catch (error) {
    console.error(`❌ Error connecting to server database: ${error.message}`)
    throw error
  }
}

/**
 * Close a specific server connection
 * @param {string} guildId - Discord guild/server ID
 */
export const closeServerConnection = async (guildId) => {
  try {
    if (serverConnections.has(guildId)) {
      const conn = serverConnections.get(guildId)
      await conn.close()
      serverConnections.delete(guildId)
      console.log(`✅ Server Connection Closed: ${guildId}`)
    }
  } catch (error) {
    console.error(`❌ Error closing server connection: ${error.message}`)
  }
}

/**
 * Get all active server connections
 * @returns {Array} List of active server IDs
 */
export const getActiveServers = () => {
  return Array.from(serverConnections.keys())
}

/**
 * Disconnect all databases
 */
export const disconnectDB = async () => {
  try {
    // Close all server connections
    for (const [guildId, conn] of serverConnections.entries()) {
      await conn.close()
    }
    serverConnections.clear()

    // Close main connection
    await mongoose.disconnect()
    console.log('✅ All MongoDB Connections Closed')
  } catch (error) {
    console.error(`❌ Error disconnecting from MongoDB: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Create server-specific model
 * @param {string} guildId - Discord guild/server ID
 * @param {string} modelName - Name of the model (e.g., 'Guild', 'Log', 'Command')
 * @param {mongoose.Schema} schema - Mongoose schema
 * @returns {mongoose.Model} Server-specific model
 */
export const getServerModel = async (guildId, guildName, modelName, schema) => {
  try {
    const serverConn = await getServerConnection(guildId, guildName)
    return serverConn.model(modelName, schema)
  } catch (error) {
    console.error(`❌ Error creating server model: ${error.message}`)
    throw error
  }
}