const fs = require('fs')
const path = require('path')

// Use same /tmp storage used by other handlers
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

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'id required' })
  const items = readData()
  const found = items.find(it => String(it.id) === String(id))
  if (!found) return res.status(404).json({ error: 'Not found' })
  res.json(found)
}
