// bot.js or main bot file
import { Client, GatewayIntentBits } from 'discord.js'
import Guild from './models/Guild.js'
import Log from './models/Log.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
})

// When bot joins or a guild is updated
client.on('guildCreate', async (guild) => {
  try {
    await Guild.findOneAndUpdate(
      { guildId: guild.id },
      {
        guildId: guild.id,
        guildName: guild.name,
        guildIcon: guild.icon,
        ownerId: guild.ownerId,
        ownerName: guild.owner?.user?.username || 'Unknown',
        memberCount: guild.memberCount,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )
    console.log(`Bot joined guild: ${guild.name}`)
  } catch (err) {
    console.error('Error creating/updating guild:', err)
  }
})

// Update member count when member joins
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = await Guild.findOneAndUpdate(
      { guildId: member.guild.id },
      {
        memberCount: member.guild.memberCount,
        $inc: { 'stats.totalUsers': 1 },
      },
      { new: true }
    )
  } catch (err) {
    console.error('Error updating member count:', err)
  }
})

// Track messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  try {
    // Update guild statistics
    await Guild.findOneAndUpdate(
      { guildId: message.guildId },
      {
        $inc: { 'stats.totalMessages': 1 },
        lastMessageAt: new Date(),
      }
    )

    // Create log entry if logging is enabled
    const guild = await Guild.findOne({ guildId: message.guildId })
    if (guild?.settings?.logsEnabled) {
      await Log.create({
        guildId: message.guildId,
        userId: message.author.id,
        username: message.author.username,
        type: 'message',
        message: `Message sent in #${message.channel.name || 'dm'}`,
        severity: 'info',
        action: 'MESSAGE_SENT',
        timestamp: new Date(),
      })
    }
  } catch (err) {
    console.error('Error tracking message:', err)
  }
})

// Track command usage (for slash commands)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  try {
    // Update command statistics
    const guild = await Guild.findOneAndUpdate(
      { guildId: interaction.guildId },
      {
        $inc: { 'stats.totalCommands': 1 },
        lastCommandAt: new Date(),
      },
      { new: true }
    )

    // Create log entry
    if (guild?.settings?.logsEnabled) {
      await Log.create({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        username: interaction.user.username,
        type: 'command',
        message: `Used command /${interaction.commandName}`,
        severity: 'info',
        action: 'COMMAND_USED',
        targetId: interaction.commandId,
        timestamp: new Date(),
      })
    }
  } catch (err) {
    console.error('Error tracking command:', err)
  }
})

// Update daily statistics (run this once per day)
async function updateDailyStats() {
  try {
    const guilds = await Guild.find()

    for (const guild of guilds) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingDailyStats = guild.dailyStats.find(
        stat => stat.date.getTime() === today.getTime()
      )

      if (existingDailyStats) {
        // Update existing daily stats
        existingDailyStats.commands = guild.stats.totalCommands
        existingDailyStats.messages = guild.stats.totalMessages
        existingDailyStats.users = guild.stats.totalUsers
      } else {
        // Add new daily stats entry
        guild.dailyStats.push({
          date: today,
          commands: guild.stats.totalCommands,
          messages: guild.stats.totalMessages,
          users: guild.stats.totalUsers,
        })
      }

      await guild.save()
    }

    console.log('Daily statistics updated')
  } catch (err) {
    console.error('Error updating daily stats:', err)
  }
}

// Schedule daily stats update (at midnight)
setInterval(() => {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)

  const timeUntilMidnight = nextMidnight - now
  setTimeout(updateDailyStats, timeUntilMidnight)
}, 86400000) // 24 hours

client.login(process.env.DISCORD_BOT_TOKEN)