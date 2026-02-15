export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const getDiscordAvatarUrl = (userId, avatar) => {
  if (!userId || !avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=256`
}

export const getDiscordServerIcon = (serverId, icon) => {
  if (!serverId || !icon) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  return `https://cdn.discordapp.com/icons/${serverId}/${icon}.png?size=256`
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}