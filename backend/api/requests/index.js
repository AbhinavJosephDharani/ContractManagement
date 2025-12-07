const { MongoClient } = require('mongodb')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

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
    const collection = db.collection('requests')

    if (req.method === 'GET') {
      const items = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const record = {
        createdAt: new Date().toISOString(),
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        cleaningType: body.cleaningType || null,
        rooms: body.rooms || null,
        preferredDate: body.preferredDate || null,
        preferredTime: body.preferredTime || null,
        budget: body.budget || null,
        notes: body.notes || null,
        photos: Array.isArray(body.photos) ? body.photos : []
      }
      const result = await collection.insertOne(record)
      const inserted = { _id: result.insertedId, ...record }
      return res.status(201).json(inserted)
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
