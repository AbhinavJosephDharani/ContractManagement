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

  const { firstName, lastName, email, password, confirmPassword } = req.body || {}

  // Validate input
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
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

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Create new user (in production, hash password with bcrypt)
    const user = {
      firstName,
      lastName,
      email,
      password, // TODO: hash this with bcrypt in production
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await usersCollection.insertOne(user)

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.status(201).json({
      token,
      firstName,
      lastName,
      email,
      userId: result.insertedId
    })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
