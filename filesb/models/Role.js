import mongoose from 'mongoose'

const permissionSchema = new mongoose.Schema({
  manage_commands: Boolean,
  manage_roles: Boolean,
  manage_settings: Boolean,
  view_logs: Boolean,
  ban_users: Boolean,
  kick_users: Boolean,
}, { _id: false })

const roleSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true,
  },
  roleId: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    required: true,
  },
  permissions: {
    type: permissionSchema,
    default: () => ({
      manage_commands: false,
      manage_roles: false,
      manage_settings: false,
      view_logs: false,
      ban_users: false,
      kick_users: false,
    }),
  },
  updatedBy: String,
  updatedByName: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Ensure one role entry per guild
roleSchema.index({ guildId: 1, roleId: 1 }, { unique: true })

roleSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Role', roleSchema)