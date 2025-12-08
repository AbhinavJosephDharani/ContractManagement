
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoginPage from './LoginPage'
import AdminDashboard from './AdminDashboard'
import './AdminPage.css'

function AnalysisModal({ open, onClose, analytics, loading, error }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 400, maxWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
        <h2>Admin Analytics</h2>
        <button onClick={onClose} style={{ position: 'absolute', right: 24, top: 24, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        {loading ? <p>Loading analytics...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
          <div>
            {analytics ? (
              <>
                <h3>Most Frequent Clients</h3>
                <ul>
                  {analytics.frequentClients?.length ? analytics.frequentClients.map((c, i) => (
                    <li key={i}>{c.email} ({c.count} requests)</li>
                  )) : <li>None</li>}
                </ul>
                <h3>Overdue Bills</h3>
                <ul>
                  {analytics.overdueBills?.length ? analytics.overdueBills.map((b, i) => (
                    <li key={i}>Request: {b.requestId}, Client: {b.clientEmail}, Amount: ${b.amount}, Due: {new Date(b.dueDate).toLocaleDateString()}</li>
                  )) : <li>None</li>}
                </ul>
                <h3>Unpaid Bills</h3>
                <ul>
                  {analytics.unpaidBills?.length ? analytics.unpaidBills.map((b, i) => (
                    <li key={i}>Request: {b.requestId}, Client: {b.clientEmail}, Amount: ${b.amount}, Due: {new Date(b.dueDate).toLocaleDateString()}</li>
                  )) : <li>None</li>}
                </ul>
                <h3>Most Requested Cleaning Types</h3>
                <ul>
                  {analytics.cleaningTypeCounts?.length ? analytics.cleaningTypeCounts.map((t, i) => (
                    <li key={i}>{t.cleaningType}: {t.count} requests</li>
                  )) : <li>None</li>}
                </ul>
                <h3>Revenue (Paid Bills)</h3>
                <p>${analytics.revenue?.toFixed(2) || '0.00'}</p>
              </>
            ) : <p>No analytics data.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

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

  async function handleShowAnalysis() {
    setShowAnalysis(true)
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const apiBase = import.meta.env.VITE_API_BASE
      const res = await fetch(`${apiBase}/api/admin/analytics`, {
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      setAnalyticsError('Failed to load analytics: ' + err.message)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-page"><p>Loading...</p></div>
  }

  return (
    <div className="admin-page">
      <AnalysisModal
        open={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        analytics={analytics}
        loading={analyticsLoading}
        error={analyticsError}
      />
      {!adminToken && (
        <header className="admin-page-header">
          <Link to="/" style={{color:'#3498db',textDecoration:'none',fontWeight:600}}>← Back to Home</Link>
        </header>
      )}
      {!adminToken ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0 0 0' }}>
            <button onClick={handleShowAnalysis} style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginRight: 12 }}>Analysis</button>
          </div>
          <AdminDashboard token={adminToken} onLogout={handleLogout} />
        </>
      )}
    </div>
  )
}
