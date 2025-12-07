import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoginPage from './LoginPage'
import AdminDashboard from './AdminDashboard'
import './AdminPage.css'

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('adminToken')
    if (token) {
      setAdminToken(token)
    }
    setLoading(false)
  }, [])

  function handleLoginSuccess(token) {
    setAdminToken(token)
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
  }

  if (loading) {
    return <div className="admin-page"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      {!adminToken && (
        <header className="admin-page-header">
          <Link to="/" style={{color:'#3498db',textDecoration:'none',fontWeight:600}}>← Back to Home</Link>
        </header>
      )}
      {!adminToken ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard token={adminToken} onLogout={handleLogout} />
      )}
    </div>
  )
}
