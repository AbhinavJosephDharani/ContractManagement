const { MongoClient, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function verifyToken(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return null
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return null
  }
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const user = verifyToken(req, res)
  if (!user) return

  const { billId, name, number, expiry, cvv } = req.body || {}
  if (!billId || !name || !number || !expiry || !cvv) {
    return res.status(400).json({ error: 'All credit card fields required' })
  }

  let client
  try {
    client = new MongoClient(mongoUri, { maxPoolSize: 1, tls: true, retryWrites: true })
    await client.connect()
    const db = client.db('contract_management')
    const ccCollection = db.collection('credit_card_info')
    const billsCollection = db.collection('bills')

    // Save credit card info (demo only)
    const ccInfo = {
      billId: new ObjectId(billId),
      userId: user.userId,
      name,
      number,
      expiry,
      cvv,
      createdAt: new Date().toISOString()
    }
    await ccCollection.insertOne(ccInfo)

    // Mark bill as paid
    await billsCollection.updateOne(
      { _id: new ObjectId(billId) },
      { $set: { status: 'paid', paidAt: new Date().toISOString() } }
    )

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error saving credit card info:', err)
    return res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
