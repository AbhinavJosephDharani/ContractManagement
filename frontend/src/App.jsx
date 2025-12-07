import React, { useEffect, useState } from 'react'
import ServiceRequestForm from './ServiceRequestForm'
import AdminDashboard from './AdminDashboard'
import LoginPage from './LoginPage'

function BackendHealth() {
  const [status, setStatus] = useState({ ok: false, message: 'unknown' })

  async function check() {
    const base = import.meta.env.VITE_API_BASE
    if (!base) {
      setStatus({ ok: false, message: 'VITE_API_BASE not set' })
      return
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/health`)
      const data = await res.json()
      setStatus({
        ok: data.status === 'ok' && data.storage === true,
        message: data.status
      })
    } catch (err) {
      setStatus({ ok: false, message: String(err) })
    }
  }

  useEffect(() => {
    check()
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{
        padding:'6px 10px',
        borderRadius:18,
        background: status.ok ? '#ecfdf5' : '#fff5f5',
        color: status.ok ? '#065f46' : '#991b1b'
      }}>
        Backend: {status.ok ? 'Connected' : 'Disconnected'}
      </div>
      <button onClick={check}>Check</button>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('submit')
  const [adminToken, setAdminToken] = useState(null)

  console.log("VITE_API_BASE:", import.meta.env.VITE_API_BASE)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) setAdminToken(token)
  }, [])

  function handleLoginSuccess(token) {
    setAdminToken(token)
    setPage('admin')
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
    setPage('submit')
  }

  return (
    <div className="app">
      <header className="header" style={{display:'flex', justifyContent:'space-between'}}>
        <h1>Anna Johnson — Home Cleaning Service</h1>
        <div style={{display:'flex', gap:12}}>
          <button onClick={() => setPage('submit')}>Submit Request</button>
          {!adminToken && <button onClick={() => setPage('login')}>Admin Login</button>}
          {adminToken && <button onClick={() => setPage('admin')}>Admin Panel</button>}
          <BackendHealth />
        </div>
      </header>

      <main className="container">
        {page === 'submit' && <ServiceRequestForm />}
        {page === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
        {page === 'admin' && adminToken && (
          <AdminDashboard token={adminToken} onLogout={handleLogout} />
        )}
      </main>
    </div>
  )
}
