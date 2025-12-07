const fs = require('fs')
const path = require('path')

// Use a writable tmp path for serverless environments (Vercel)
const tmpDir = path.join('/tmp', 'contract-management-backend')
const dataPath = path.join(tmpDir, 'data.json')

function readData() {
  try {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]))
    const raw = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}

function writeData(arr) {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  fs.writeFileSync(dataPath, JSON.stringify(arr, null, 2))
}

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    const items = readData()
    return res.status(200).json(items.slice(0, 100))
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const items = readData()
    const id = Date.now()
    const record = {
      id,
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
    items.unshift(record)
    try {
      writeData(items)
      return res.status(201).json(record)
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
