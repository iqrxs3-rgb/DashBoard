import mongoose from 'mongoose'

const guildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  guildName: {
    type: String,
    required: true,
  },
  guildIcon: String,
  ownerId: {
    type: String,
    required: true,
  },
  ownerName: String,
  memberCount: Number,
  prefix: {
    type: String,
    default: '!',
    maxlength: 5,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  settings: {
    autoModeration: {
      type: Boolean,
      default: false,
    },
    welcomeMessage: {
      type: Boolean,
      default: false,
    },
    logsEnabled: {
      type: Boolean,
      default: true,
    },
    announcements: {
      type: Boolean,
      default: false,
    },
    welcomeChannel: {
      type: String,
      default: 'general',
    },
  },
  admins: [String], // Discord user IDs
  moderators: [String], // Discord user IDs
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

guildSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Guild', guildSchema)