const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // Auth: Expect Bearer token in Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'admin') throw new Error('Not admin')
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' })
    return
  }

  // Connect to MongoDB and compute real analytics
  const { MongoClient, ObjectId } = require('mongodb')
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0'
  let client
  try {
    client = new MongoClient(mongoUri, { maxPoolSize: 1, tls: true, retryWrites: true })
    await client.connect()
    const db = client.db('contract_management')
    const users = db.collection('users')
    const requests = db.collection('requests')
    const quotes = db.collection('quotes')
    const bills = db.collection('bills')

    // 1. Frequent clients
    const frequentClients = await requests.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', count: 1, name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, email: '$user.email' } }
    ]).toArray()

    // 2. Uncommitted clients
    const uncommittedClients = await requests.aggregate([
      { $group: { _id: '$userId', total: { $sum: 1 }, completed: { $sum: { $cond: [ { $eq: ['$status', 'completed'] }, 1, 0 ] } } } },
      { $match: { total: { $gte: 3 }, completed: 0 } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', total: 1, name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, email: '$user.email' } }
    ]).toArray()

    // 3. This month's accepted quotes
    const now = new Date(), month = now.getMonth(), year = now.getFullYear()
    const monthStart = new Date(year, month, 1)
    const nextMonth = new Date(year, month + 1, 1)
    const acceptedQuotes = await quotes.find({ status: 'accepted', createdAt: { $gte: monthStart.toISOString(), $lt: nextMonth.toISOString() } }).toArray()

    // 4. Prospective clients
    const prospectiveClients = await users.aggregate([
      { $lookup: { from: 'requests', localField: '_id', foreignField: 'userId', as: 'reqs' } },
      { $match: { 'reqs.0': { $exists: false } } },
      { $project: { userId: '$_id', name: { $concat: ['$firstName', ' ', '$lastName'] }, email: 1 } }
    ]).toArray()

    // 5. Largest job
    const largestJob = await requests.find().sort({ rooms: -1 }).limit(1).toArray()

    // 6. Overdue bills (older than 1 week, unpaid)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const overdueBills = await bills.find({ status: 'unpaid', createdAt: { $lt: weekAgo } }).toArray()

    // 7. Bad clients (never paid any overdue bill)
    const badClients = await bills.aggregate([
      { $match: { status: 'unpaid', createdAt: { $lt: weekAgo } } },
      { $group: { _id: '$userId' } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, email: '$user.email' } }
    ]).toArray()

    // 8. Good clients (always paid bills within 24h)
    const goodClients = await bills.aggregate([
      { $match: { status: 'paid' } },
      { $addFields: { paidAt: { $toDate: '$paidAt' }, createdAt: { $toDate: '$createdAt' } } },
      { $project: { userId: 1, paidWithin24h: { $lte: [ { $subtract: ['$paidAt', '$createdAt'] }, 24 * 60 * 60 * 1000 ] } } },
      { $match: { paidWithin24h: true } },
      { $group: { _id: '$userId' } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }, email: '$user.email' } }
    ]).toArray()

    res.status(200).json({
      frequentClients,
      uncommittedClients,
      acceptedQuotes,
      prospectiveClients,
      largestJob,
      overdueBills,
      badClients,
      goodClients
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: String(err) })
  } finally {
    if (client) await client.close()
  }
}