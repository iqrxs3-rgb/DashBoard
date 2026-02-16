// utils/adminCredentials.js
// These are the credentials you set - change them to your own!

export const ADMIN_CREDENTIALS = {
  // Format: username: hashed_password
  // Use strong passwords!
  // Generate hashes: npm install bcryptjs
  // const bcrypt = require('bcryptjs')
  // bcrypt.hashSync('your_password', 10)
   
  admin: '$2a$10$d033e22ae348aeb5660fc2140aec35850c4da997', // Change this!
  superadmin: '1f8f16e26c8ca70223e5b462b8a471c867beff43', // Change this!
}

// List of admin user IDs who have access (Discord IDs)
export const ADMIN_DISCORD_IDS = [
  '1094664981305372852', // Your Discord ID
  //  // Another admin's Discord ID
]

// Master API key for API-based admin operations
export const MASTER_API_KEY = 'djeofjeofjeqfggfrefh97f4y59fh479fynf9u74wutn945ty34unrt97u342ty3487tr34vrf6834f34hu2jf8f6r4fy4g'

// IP-based admin access (optional)
export const ALLOWED_ADMIN_IPS = [
  '127.0.0.1', // localhost
  '150.228.105.1', // your IP
]