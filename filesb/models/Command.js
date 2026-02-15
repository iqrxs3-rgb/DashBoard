import mongoose from 'mongoose'

const commandSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 32,
    lowercase: true,
    match: /^[a-z0-9_-]+$/,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1024,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdByName: String,
  updatedBy: String,
  updatedByName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create compound index for guild and command name (ensure uniqueness per guild)
commandSchema.index({ guildId: 1, name: 1 }, { unique: true })

commandSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Command', commandSchema)