import Command from '../models/Command.js'
import Log from '../models/Log.js'
import { successResponse, errorResponse, sanitizeCommand, isValidCommandName, createLog } from '../utils/helpers.js'

/**
 * Get all commands for a guild
 */
export const getGuildCommands = async (req, res) => {
  try {
    const { guildId } = req.params
    const { enabled, search } = req.query

    let query = { guildId }

    // Filter by enabled status
    if (enabled !== undefined) {
      query.enabled = enabled === 'true'
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const commands = await Command.find(query).sort({ createdAt: -1 }).lean()

    return res.status(200).json(
      successResponse(
        commands.map(cmd => ({
          id: cmd._id,
          name: cmd.name,
          description: cmd.description,
          enabled: cmd.enabled,
          createdAt: cmd.createdAt,
          updatedAt: cmd.updatedAt,
        })),
        'Commands retrieved'
      )
    )
  } catch (error) {
    console.error('Get commands error:', error)
    return res.status(500).json(errorResponse('Failed to get commands'))
  }
}

/**
 * Get specific command
 */
export const getCommandById = async (req, res) => {
  try {
    const { guildId, commandId } = req.params

    const command = await Command.findOne({ _id: commandId, guildId }).lean()
    if (!command) {
      return res.status(404).json(errorResponse('Command not found', 404))
    }

    return res.status(200).json(successResponse(sanitizeCommand(command), 'Command retrieved'))
  } catch (error) {
    console.error('Get command error:', error)
    return res.status(500).json(errorResponse('Failed to get command'))
  }
}

/**
 * Create new command
 */
export const createCommand = async (req, res) => {
  try {
    const { guildId } = req.params
    const { name, description, enabled = true } = req.body

    // Validate input
    if (!name || !description) {
      return res.status(400).json(errorResponse('Name and description are required', 400))
    }

    if (!isValidCommandName(name)) {
      return res.status(400).json(errorResponse('Invalid command name. Use lowercase alphanumeric, hyphens, underscores only', 400))
    }

    if (description.length > 1024) {
      return res.status(400).json(errorResponse('Description must be 1024 characters or less', 400))
    }

    // Check if command already exists
    const existingCommand = await Command.findOne({ guildId, name })
    if (existingCommand) {
      return res.status(409).json(errorResponse('Command already exists in this guild', 409))
    }

    // Create command
    const command = new Command({
      guildId,
      name: name.toLowerCase(),
      description,
      enabled,
      createdBy: req.user.discordId,
      createdByName: req.user.username,
    })

    await command.save()

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'command',
      `Command "${name}" created`,
      'CREATE_COMMAND',
      command._id.toString(),
      name
    )

    return res.status(201).json(successResponse(sanitizeCommand(command), 'Command created successfully'))
  } catch (error) {
    console.error('Create command error:', error)
    return res.status(500).json(errorResponse('Failed to create command'))
  }
}

/**
 * Update command
 */
export const updateCommand = async (req, res) => {
  try {
    const { guildId, commandId } = req.params
    const { description, enabled, name } = req.body

    const command = await Command.findOne({ _id: commandId, guildId })
    if (!command) {
      return res.status(404).json(errorResponse('Command not found', 404))
    }

    // Update fields
    if (description) {
      if (description.length > 1024) {
        return res.status(400).json(errorResponse('Description must be 1024 characters or less', 400))
      }
      command.description = description
    }

    if (enabled !== undefined) {
      command.enabled = enabled
    }

    // Don't allow changing the command name
    if (name && name !== command.name) {
      return res.status(400).json(errorResponse('Cannot change command name after creation', 400))
    }

    command.updatedBy = req.user.discordId
    command.updatedByName = req.user.username

    await command.save()

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'command',
      `Command "${command.name}" updated`,
      'UPDATE_COMMAND',
      command._id.toString(),
      command.name
    )

    return res.status(200).json(successResponse(sanitizeCommand(command), 'Command updated successfully'))
  } catch (error) {
    console.error('Update command error:', error)
    return res.status(500).json(errorResponse('Failed to update command'))
  }
}

/**
 * Delete command
 */
export const deleteCommand = async (req, res) => {
  try {
    const { guildId, commandId } = req.params

    const command = await Command.findOne({ _id: commandId, guildId })
    if (!command) {
      return res.status(404).json(errorResponse('Command not found', 404))
    }

    const commandName = command.name

    await Command.deleteOne({ _id: commandId })

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'command',
      `Command "${commandName}" deleted`,
      'DELETE_COMMAND',
      commandId,
      commandName
    )

    return res.status(200).json(successResponse(null, 'Command deleted successfully'))
  } catch (error) {
    console.error('Delete command error:', error)
    return res.status(500).json(errorResponse('Failed to delete command'))
  }
}

/**
 * Bulk update commands (enable/disable)
 */
export const bulkUpdateCommands = async (req, res) => {
  try {
    const { guildId } = req.params
    const { commandIds, enabled } = req.body

    if (!Array.isArray(commandIds) || commandIds.length === 0) {
      return res.status(400).json(errorResponse('Command IDs array required', 400))
    }

    if (enabled === undefined) {
      return res.status(400).json(errorResponse('Enabled status required', 400))
    }

    const result = await Command.updateMany(
      { _id: { $in: commandIds }, guildId },
      { $set: { enabled, updatedBy: req.user.discordId } }
    )

    // Log the action
    await createLog(
      Log,
      guildId,
      req.user.discordId,
      req.user.username,
      'command',
      `${commandIds.length} command(s) ${enabled ? 'enabled' : 'disabled'}`,
      'BULK_UPDATE_COMMANDS'
    )

    return res.status(200).json(successResponse(result, 'Commands updated'))
  } catch (error) {
    console.error('Bulk update error:', error)
    return res.status(500).json(errorResponse('Failed to bulk update commands'))
  }
}