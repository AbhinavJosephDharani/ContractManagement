const fs = require('fs')
const path = require('path')

const dataPath = path.join(process.cwd(), 'backend', 'data.json')

function readData() {
  try {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]))
    const raw = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}

function writeData(arr) {
  fs.writeFileSync(dataPath, JSON.stringify(arr, null, 2))
}

module.exports = function handler(req, res) {
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
