const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return res.status(200).json({ valid: true, user: decoded })
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }

  res.status(405).end('Method Not Allowed')
}
