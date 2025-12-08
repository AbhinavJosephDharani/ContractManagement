// Vercel serverless function: GET /api/user/requests
// Returns authenticated user's service requests and quotes


const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@cluster0.gwciiyr.mongodb.net/?appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Auth: Expect Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token' });
    return;
  }
  const token = authHeader.split(' ')[1];

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    if (!userId) throw new Error('No userId in token');
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  let client;
  try {
    const options = {
      maxPoolSize: 1,
      tls: true,
      retryWrites: true
    };
    client = new MongoClient(mongoUri, options);
    await client.connect();
    const db = client.db('contract_management');
    const collection = db.collection('requests');

    // Find requests for this user
    const items = await collection.find({ userId: userId }).sort({ createdAt: -1 }).limit(100).toArray();
    res.status(200).json(items);
  } catch (err) {
    console.error('User requests error:', err);
    res.status(500).json({ error: 'Failed to fetch user requests' });
  } finally {
    if (client) await client.close();
  }
};
