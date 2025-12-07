const fs = require('fs')
const path = require('path')

module.exports = function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // basic health check: write/read a JSON file in the writable temp directory
  // Vercel serverless functions can write to /tmp during execution
  const tmpDir = path.join('/tmp', 'contract-management-backend')
  const dataPath = path.join(tmpDir, 'data.json')
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([]))
    }
    const raw = fs.readFileSync(dataPath, 'utf8')
    JSON.parse(raw)
    res.status(200).json({ status: 'ok', storage: true, path: dataPath })
  } catch (err) {
    res.status(500).json({ status: 'error', storage: false, message: String(err), path: dataPath })
  }
}
