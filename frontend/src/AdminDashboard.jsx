import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'

export default function AdminDashboard({ token, onLogout }) {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    scheduledDate: '',
    scheduledTime: '',
    note: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const apiBase = import.meta.env.VITE_API_BASE

  // Load all service requests
  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    setError('')
    try {
      if (!apiBase) {
        setError('Backend API not configured')
        setLoading(false)
        return
      }
      const res = await fetch(`${apiBase}/api/requests`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      setError(`Failed to load requests: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectRequest(request) {
    setSelectedRequest(request)
    setQuoteForm({ price: '', scheduledDate: '', scheduledTime: '', note: '' })
  }

  function handleQuoteChange(e) {
    const { name, value } = e.target
    setQuoteForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleReject(requestId) {
    if (!window.confirm('Are you sure you want to reject this request?')) return
    
    setSubmitting(true)
    try {
      const res = await fetch(`${apiBase}/api/quotes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId,
          status: 'rejected',
          rejectionReason: prompt('Enter reason for rejection:') || 'No reason provided'
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      // Update local state
      setRequests(prev => prev.map(r => 
        r._id === requestId ? { ...r, status: 'rejected' } : r
      ))
      setSelectedRequest(null)
      alert('Request rejected')
    } catch (err) {
      alert(`Failed to reject request: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmitQuote(e) {
    e.preventDefault()
    if (!selectedRequest) return
    
    if (!quoteForm.price || !quoteForm.scheduledDate || !quoteForm.scheduledTime) {
      alert('Please fill in price, date, and time')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${apiBase}/api/quotes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedRequest._id,
          status: 'quoted',
          price: parseFloat(quoteForm.price),
          scheduledDate: quoteForm.scheduledDate,
          scheduledTime: quoteForm.scheduledTime,
          note: quoteForm.note
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      // Update local state
      setRequests(prev => prev.map(r => 
        r._id === selectedRequest._id ? { ...r, status: 'quoted' } : r
      ))
      setSelectedRequest(null)
      alert('Quote submitted successfully')
    } catch (err) {
      alert(`Failed to submit quote: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="admin-container"><p>Loading requests...</p></div>
  if (error) return <div className="admin-container"><p style={{ color: 'red' }}>{error}</p></div>

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard - Service Requests</h1>
          <Link to="/" style={{fontSize:'13px',color:'#3498db',textDecoration:'none'}}>← Back to Home</Link>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="admin-layout">
        {/* Requests List */}
        <div className="requests-list">
          <h2>Incoming Requests ({requests.length})</h2>
          <button className="refresh-btn" onClick={fetchRequests}>Refresh</button>
          
          {requests.length === 0 ? (
            <p>No service requests yet</p>
          ) : (
            <div className="requests">
              {requests.map(req => (
                <div
                  key={req._id}
                  className={`request-card ${selectedRequest?._id === req._id ? 'active' : ''} ${req.status || 'pending'}`}
                  onClick={() => handleSelectRequest(req)}
                >
                  <div className="request-header">
                    <strong>{req.firstName} {req.lastName}</strong>
                    <span className={`status-badge ${req.status || 'pending'}`}>
                      {req.status || 'pending'}
                    </span>
                  </div>
                  <p className="request-address">{req.address}</p>
                  <p className="request-type">{req.cleaningType} • {req.rooms} room{req.rooms !== 1 ? 's' : ''}</p>
                  <p className="request-date">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote Form */}
        <div className="quote-panel">
          {selectedRequest ? (
            <>
              <h2>Request Details</h2>
              <div className="request-details">
                <div className="detail-row">
                  <label>Name:</label>
                  <p>{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <p>{selectedRequest.email || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Phone:</label>
                  <p>{selectedRequest.phone || 'N/A'}</p>
                </div>
                <div className="detail-row">
                  <label>Address:</label>
                  <p>{selectedRequest.address}</p>
                </div>
                <div className="detail-row">
                  <label>Cleaning Type:</label>
                  <p>{selectedRequest.cleaningType}</p>
                </div>
                <div className="detail-row">
                  <label>Rooms:</label>
                  <p>{selectedRequest.rooms}</p>
                </div>
                <div className="detail-row">
                  <label>Preferred Date:</label>
                  <p>{selectedRequest.preferredDate || 'Not specified'}</p>
                </div>
                <div className="detail-row">
                  <label>Preferred Time:</label>
                  <p>{selectedRequest.preferredTime || 'Not specified'}</p>
                </div>
                <div className="detail-row">
                  <label>Budget:</label>
                  <p>${selectedRequest.budget || 'Not specified'}</p>
                </div>
                <div className="detail-row">
                  <label>Notes:</label>
                  <p>{selectedRequest.notes || 'None'}</p>
                </div>
              </div>

              {selectedRequest.status === 'accepted' ? (
                <div className="status-message">
                  <p>Status: <strong>Order Created</strong></p>
                  <button
                    onClick={async () => {
                      setSubmitting(true)
                      try {
                        const res = await fetch(`${apiBase}/api/quotes`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ requestId: selectedRequest._id, status: 'completed' })
                        })
                        if (!res.ok) throw new Error(`HTTP ${res.status}`)
                        await fetchRequests()
                        setSelectedRequest(null)
                        alert('Order marked as completed!')
                      } catch (err) {
                        alert(`Failed to mark as completed: ${err.message}`)
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    disabled={submitting}
                    className="btn-submit"
                  >
                    {submitting ? 'Completing...' : 'Mark as Completed'}
                  </button>
                </div>
              ) : (selectedRequest.status === 'rejected' || selectedRequest.status === 'quoted') ? (
                <div className="status-message">
                  <p>Status: <strong>{selectedRequest.status}</strong></p>
                  <p>Already processed</p>
                </div>
              ) : (
                <>
                  <h3>Submit Quote or Rejection</h3>
                  <form onSubmit={handleSubmitQuote} className="quote-form">
                    <div className="form-row">
                      <label>Adjusted Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={quoteForm.price}
                        onChange={handleQuoteChange}
                        step="0.01"
                        placeholder="e.g., 250.00"
                      />
                    </div>

                    <div className="form-row">
                      <label>Scheduled Date</label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={quoteForm.scheduledDate}
                        onChange={handleQuoteChange}
                      />
                    </div>

                    <div className="form-row">
                      <label>Scheduled Time</label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={quoteForm.scheduledTime}
                        onChange={handleQuoteChange}
                      />
                    </div>

                    <div className="form-row">
                      <label>Optional Note</label>
                      <textarea
                        name="note"
                        value={quoteForm.note}
                        onChange={handleQuoteChange}
                        placeholder="e.g., 'Extra charges for pet-friendly products'"
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-submit"
                      >
                        {submitting ? 'Submitting...' : 'Submit Quote'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(selectedRequest._id)}
                        disabled={submitting}
                        className="btn-reject"
                      >
                        {submitting ? 'Rejecting...' : 'Reject Request'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <p className="placeholder">Select a request to view details and submit a quote</p>
          )}
        </div>
      </div>
    </div>
  )
}
