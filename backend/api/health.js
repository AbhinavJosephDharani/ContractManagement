const fs = require('fs')
const path = require('path')

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // basic health check: can we read/write the data file
  const dataPath = path.join(process.cwd(), 'backend', 'data.json')
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([]))
    }
    const raw = fs.readFileSync(dataPath, 'utf8')
    JSON.parse(raw)
    res.status(200).json({ status: 'ok', storage: true })
  } catch (err) {
    res.status(500).json({ status: 'error', storage: false, error: String(err) })
  }
}
