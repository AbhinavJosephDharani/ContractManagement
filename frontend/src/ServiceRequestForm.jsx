import React, { useState, useEffect } from 'react'

export default function ServiceRequestForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    email: '',
    cleaningType: 'basic',
    rooms: 1,
    preferredDate: '',
    preferredTime: '',
    budget: '',
    notes: ''
  })
  const [photos, setPhotos] = useState([])
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('serviceRequests')
      if (raw) setSaved(JSON.parse(raw))
    } catch (e) {
      console.warn('Failed to load saved requests', e)
    }
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      setMessage('You can upload up to 5 photos only.')
      return
    }
    setPhotos(files)
    setMessage('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, photos: photos.map(f => f.name) }
    console.log('Service Request submitted:', payload)

    // persist to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('serviceRequests') || '[]')
      const record = { id: Date.now(), createdAt: new Date().toISOString(), ...payload }
      const next = [record, ...existing]
      localStorage.setItem('serviceRequests', JSON.stringify(next))
      setSaved(next)
      setMessage('Service request saved locally (in browser). Ready to connect to backend.')
    } catch (err) {
      console.error('Failed to save request', err)
      setMessage('Failed to save locally — see console for details.')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Service Request Submission</h2>

      <div className="row">
        <label>First name</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} required />
      </div>

      <div className="row">
        <label>Last name</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} required />
      </div>

      <div className="row">
        <label>Service address</label>
        <input name="address" value={form.address} onChange={handleChange} required />
      </div>

      <div className="row">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Type of cleaning</label>
        <select name="cleaningType" value={form.cleaningType} onChange={handleChange}>
          <option value="basic">Basic</option>
          <option value="deep">Deep cleaning</option>
          <option value="move-out">Move-out</option>
        </select>
      </div>

      <div className="row">
        <label>Number of rooms</label>
        <input name="rooms" type="number" min="1" value={form.rooms} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Preferred date</label>
        <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Preferred time</label>
        <input name="preferredTime" type="time" value={form.preferredTime} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Proposed budget</label>
        <input name="budget" type="number" min="0" value={form.budget} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Optional notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} />
      </div>

      <div className="row">
        <label>Upload photos (up to 5)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} />
        {photos.length > 0 && (
          <div className="photos">
            {photos.map((p, i) => (
              <div key={i} className="photo-item">{p.name}</div>
            ))}
          </div>
        )}
      </div>

      <div className="actions">
        <button type="submit">Submit Request</button>
      </div>

      {message && <p className="message">{message}</p>}
      {saved.length > 0 && (
        <section style={{marginTop:20}}>
          <h3>Saved Requests (local)</h3>
          <div style={{display:'grid',gap:8}}>
            {saved.map(r => (
              <div key={r.id} style={{padding:10,background:'#fbfbfd',border:'1px solid #eee',borderRadius:6}}>
                <strong>{r.firstName} {r.lastName}</strong> — {r.cleaningType} — {r.rooms} rooms
                <div style={{fontSize:12,color:'#666'}}>{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10}}>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(saved, null, 2)); setMessage('Saved requests copied to clipboard') }}>Copy JSON</button>
            <button type="button" style={{marginLeft:8}} onClick={() => { localStorage.removeItem('serviceRequests'); setSaved([]); setMessage('Cleared saved requests') }}>Clear</button>
          </div>
        </section>
      )}
    </form>
  )
}
