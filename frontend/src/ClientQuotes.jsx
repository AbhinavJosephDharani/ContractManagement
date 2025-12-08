import React, { useState, useEffect } from 'react'

export default function ClientQuotes({ userToken }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiBase = import.meta.env.VITE_API_BASE

  useEffect(() => {
    fetchUserRequests()
  }, [])

  async function fetchUserRequests() {
    setLoading(true)
    setError('')
    try {
      if (!apiBase) {
        setError('Backend API not configured')
        return
      }
      const res = await fetch(`${apiBase}/api/user/requests`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(`Failed to load requests: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="quotes-container"><p>Loading requests...</p></div>
  if (error) return <div className="quotes-container"><p style={{color:'red'}}>{error}</p></div>

  return (
    <div className="quotes-container">
      <h2>My Service Requests & Quotes</h2>
      {requests.length === 0 ? (
        <p>No service requests yet.</p>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req._id}>
              <strong>{req.cleaningType}</strong> — {req.status} — {req.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
