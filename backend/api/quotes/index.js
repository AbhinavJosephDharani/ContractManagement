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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // Verify token for GET and POST
  if (req.method !== 'OPTIONS') {
    const user = verifyToken(req, res)
    if (!user) return
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
    const quotesCollection = db.collection('quotes')
    const requestsCollection = db.collection('requests')

    if (req.method === 'GET') {
      // Get all quotes, optionally filtered by requestId
      const { requestId } = req.query
      const query = requestId ? { requestId: new ObjectId(requestId) } : {}
      const items = await quotesCollection.find(query).sort({ createdAt: -1 }).limit(100).toArray()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const { requestId, status, rejectionReason, price, scheduledDate, scheduledTime, note } = body

      if (!requestId) {
        return res.status(400).json({ error: 'requestId is required' })
      }

      let requestIdObj
      try {
        requestIdObj = new ObjectId(requestId)
      } catch (e) {
        return res.status(400).json({ error: 'Invalid requestId format' })
      }

      // Create quote record
      const quoteRecord = {
        requestId: requestIdObj,
        status: status || 'quoted', // 'quoted' or 'rejected'
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (status === 'rejected') {
        quoteRecord.rejectionReason = rejectionReason || 'No reason provided'
      } else if (status === 'quoted') {
        quoteRecord.price = price ? parseFloat(price) : null
        quoteRecord.scheduledDate = scheduledDate || null
        quoteRecord.scheduledTime = scheduledTime || null
        quoteRecord.note = note || null
      }

      // Insert quote
      const quoteResult = await quotesCollection.insertOne(quoteRecord)
      const insertedQuote = { _id: quoteResult.insertedId, ...quoteRecord }

      // Update request status
      await requestsCollection.updateOne(
        { _id: requestIdObj },
        { $set: { status: status || 'quoted', updatedAt: new Date().toISOString() } }
      )

      return res.status(201).json(insertedQuote)
    }

    res.setHeader('Allow', 'GET, POST')
    res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('MongoDB error:', err)
    return res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
