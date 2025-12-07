const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3')

const app = express()
app.use(cors())
app.use(express.json())

const DB_PATH = path.join(__dirname, 'data.sqlite')
const db = new sqlite3.Database(DB_PATH)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      cleaningType TEXT,
      rooms INTEGER,
      preferredDate TEXT,
      preferredTime TEXT,
      budget REAL,
      notes TEXT,
      photos TEXT,
      createdAt TEXT
    )
  `)
})

app.post('/requests', (req, res) => {
  const body = req.body || {}
  const photos = Array.isArray(body.photos) ? JSON.stringify(body.photos) : null
  const createdAt = new Date().toISOString()
  const stmt = db.prepare(`INSERT INTO requests (
    firstName,lastName,address,phone,email,cleaningType,rooms,preferredDate,preferredTime,budget,notes,photos,createdAt
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  stmt.run(
    body.firstName || null,
    body.lastName || null,
    body.address || null,
    body.phone || null,
    body.email || null,
    body.cleaningType || null,
    body.rooms || null,
    body.preferredDate || null,
    body.preferredTime || null,
    body.budget || null,
    body.notes || null,
    photos,
    createdAt,
    function (err) {
      if (err) return res.status(500).json({ error: String(err) })
      const id = this.lastID
      db.get('SELECT * FROM requests WHERE id = ?', [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: String(err2) })
        if (row && row.photos) row.photos = JSON.parse(row.photos)
        res.status(201).json(row)
      })
    }
  )
  stmt.finalize()
})

app.get('/requests', (req, res) => {
  db.all('SELECT * FROM requests ORDER BY id DESC LIMIT 100', (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) })
    rows = rows.map(r => ({ ...r, photos: r.photos ? JSON.parse(r.photos) : [] }))
    res.json(rows)
  })
})

app.get('/requests/:id', (req, res) => {
  db.get('SELECT * FROM requests WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: String(err) })
    if (!row) return res.status(404).json({ error: 'Not found' })
    row.photos = row.photos ? JSON.parse(row.photos) : []
    res.json(row)
  })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`))
