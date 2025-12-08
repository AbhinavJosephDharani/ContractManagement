const { MongoClient, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed')
  }

  // Auth: Expect Bearer token in Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token' })
    return
  }
  const token = authHeader.split(' ')[1]

  try {
    jwt.verify(token, JWT_SECRET)
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' })
    return
  }

  const { requestId } = req.query
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required' })
  }

  let client
  try {
    client = new MongoClient(mongoUri, { maxPoolSize: 1, tls: true, retryWrites: true })
    await client.connect()
    const db = client.db('contract_management')
    const billsCollection = db.collection('bills')
    const bills = await billsCollection.find({ requestId: new ObjectId(requestId) }).sort({ createdAt: -1 }).toArray()
    res.status(200).json(bills)
  } catch (err) {
    console.error('MongoDB error:', err)
    res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
