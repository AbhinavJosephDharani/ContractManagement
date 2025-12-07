import React, { useEffect, useState } from 'react'
import ServiceRequestForm from './ServiceRequestForm'

function BackendHealth() {
  const [status, setStatus] = useState({ ok: false, message: 'unknown' })
  async function check() {
    const base = import.meta.env.VITE_API_BASE
    if (!base) {
      setStatus({ ok: false, message: 'VITE_API_BASE not set (using localStorage)' })
      return
    }
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/health`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setStatus({ ok: data.status === 'ok' && data.storage === true, message: data.status })
    } catch (err) {
      setStatus({ ok: false, message: String(err) })
    }
  }

  useEffect(() => { check() }, [])

  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{padding:'6px 10px',borderRadius:18,background: status.ok ? '#ecfdf5' : '#fff5f5',color: status.ok ? '#065f46' : '#991b1b',border: '1px solid rgba(0,0,0,0.04)'}}>
        Backend: {status.ok ? 'Connected' : 'Disconnected'}
      </div>
      <button onClick={check} style={{padding:'6px 10px',borderRadius:6}}>Check</button>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <header className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:20}}>
        <h1>Anna Johnson — Home Cleaning Service</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <a href="/admin" style={{padding:'8px 16px',borderRadius:6,border:'1px solid #ccc',background:'white',cursor:'pointer',textDecoration:'none',color:'#2c3e50',fontWeight:600,fontSize:'14px'}}>
            Admin Panel
          </a>
          <BackendHealth />
        </div>
      </header>
      <main className="container">
        <ServiceRequestForm />
      </main>
    </div>
  )
}
