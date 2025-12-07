const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const ADMIN_EMAIL = 'anna@cleaning.local'
const ADMIN_PASSWORD = 'admin123' // In production, hash this with bcrypt

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'POST') {
    const { email, password } = req.body || {}

    // Validate credentials (in production, query from DB and compare bcrypt hash)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        const token = jwt.sign(
          { email, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' }
        )
        return res.status(200).json({ token, email })
      } catch (err) {
        return res.status(500).json({ error: 'Failed to generate token' })
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.status(405).end('Method Not Allowed')
}
