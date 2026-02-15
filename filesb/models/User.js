import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: String,
  email: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  guilds: [
    {
      guildId: String,
      guildName: String,
      guildIcon: String,
      isAdmin: Boolean,
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('User', userSchema)