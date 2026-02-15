import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  username: String,
  type: {
    type: String,
    enum: ['command', 'moderation', 'error', 'system', 'config'],
    default: 'system',
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error'],
    default: 'info',
  },
  action: String,
  targetId: String,
  targetName: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

// TTL index: automatically delete logs after 90 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

export default mongoose.model('Log', logSchema)