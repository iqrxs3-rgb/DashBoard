import OAuth2 from 'discord-oauth2'

const oauth = new OAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `${process.env.FRONTEND_URL || 'https://beirut.up.railway.app'}/callback`,
})

export default oauth