const { MongoClient, ObjectId } = require('mongodb')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'id required' })

  let client
  try {
    client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db('contract_management')
    const collection = db.collection('requests')

    let filter
    try {
      filter = { _id: new ObjectId(id) }
    } catch (e) {
      filter = { _id: id }
    }

    const found = await collection.findOne(filter)
    if (!found) return res.status(404).json({ error: 'Not found' })
    res.json(found)
  } catch (err) {
    console.error('MongoDB error:', err)
    return res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}
