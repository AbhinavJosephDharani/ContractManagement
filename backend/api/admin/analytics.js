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

  // Return dummy data for analytics
  return res.status(200).json({
    frequentClients: [
      { userId: 'u1', count: 5, name: 'Alice Smith', email: 'alice@example.com' },
      { userId: 'u2', count: 3, name: 'Bob Jones', email: 'bob@example.com' }
    ],
    uncommittedClients: [
      { userId: 'u3', total: 4, name: 'Charlie Brown', email: 'charlie@example.com' }
    ],
    acceptedQuotes: [
      { _id: 'q1', price: 250, createdAt: '2025-12-01T10:00:00Z', status: 'accepted' }
    ],
    prospectiveClients: [
      { userId: 'u4', name: 'Dana White', email: 'dana@example.com' }
    ],
    largestJob: [
      { _id: 'r1', rooms: 8, address: '123 Main St', status: 'completed' }
    ],
    overdueBills: [
      { _id: 'b1', amount: 500, dueDate: '2025-11-25', clientEmail: 'alice@example.com', requestId: 'r1' }
    ],
    badClients: [
      { userId: 'u5', name: 'Eve Adams', email: 'eve@example.com' }
    ],
    goodClients: [
      { userId: 'u1', name: 'Alice Smith', email: 'alice@example.com' }
    ]
  })
}