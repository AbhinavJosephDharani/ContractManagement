const { MongoClient } = require('mongodb')

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // health check: verify MongoDB connectivity
  let client
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000 })
    await client.connect()
    const db = client.db('contract_management')
    await db.admin().ping()
    res.status(200).json({ status: 'ok', storage: true, database: 'MongoDB' })
  } catch (err) {
    res.status(500).json({ status: 'error', storage: false, message: String(err) })
  } finally {
    if (client) await client.close()
  }
}
