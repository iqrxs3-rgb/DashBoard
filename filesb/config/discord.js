import OAuth2 from 'discord-oauth2'

const oauth = new OAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/callback`,
})

export default oauth