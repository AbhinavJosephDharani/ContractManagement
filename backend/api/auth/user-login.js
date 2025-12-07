const { MongoClient } = require('mongodb')
const jwt = require('jsonwebtoken')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  let client
  try {
    const options = {
      maxPoolSize: 1,
      tls: true,
      retryWrites: true
    }
    client = new MongoClient(mongoUri, options)
    await client.connect()
    const db = client.db('contract_management')
    const usersCollection = db.collection('users')

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(200).json({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      userId: user._id
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
