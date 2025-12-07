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

module.exports = function handler(req, res) {
  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'id required' })
  const items = readData()
  const found = items.find(it => String(it.id) === String(id))
  if (!found) return res.status(404).json({ error: 'Not found' })
  res.json(found)
}
