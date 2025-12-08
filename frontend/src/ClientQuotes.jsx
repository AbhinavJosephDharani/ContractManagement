import React, { useState, useEffect } from 'react'
import PayBill from './PayBill'

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
      // For each request, fetch negotiation history
      // Also fetch bills for each request
      const requestsWithHistory = await Promise.all(
        (Array.isArray(data) ? data : []).map(async req => {
          try {
            const [quotesRes, billsRes] = await Promise.all([
              fetch(`${apiBase}/api/quotes?requestId=${req._id}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
              }),
              fetch(`${apiBase}/api/bills?requestId=${req._id}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
              })
            ])
            const quotes = quotesRes.ok ? await quotesRes.json() : []
            const bills = billsRes.ok ? await billsRes.json() : []
            return { ...req, negotiationHistory: quotes, bills }
          } catch {
            return { ...req, negotiationHistory: [], bills: [] }
          }
        })
      )
      setRequests(requestsWithHistory)
    } catch (err) {
      setError(`Failed to load requests: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="quotes-container"><p>Loading requests...</p></div>
  if (error) return <div className="quotes-container"><p style={{color:'red'}}>{error}</p></div>

  async function handleAccept(requestId) {
    try {
      const res = await fetch(`${apiBase}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ requestId, status: 'accepted' })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchUserRequests()
    } catch (err) {
      setError(`Failed to accept quote: ${err.message}`)
    }
  }

  async function handleRenegotiate(requestId) {
    const note = prompt('Enter your counter note (e.g., "too expensive", "need another time slot")')
    if (!note) return
    try {
      const res = await fetch(`${apiBase}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ requestId, status: 'renegotiate', note })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchUserRequests()
    } catch (err) {
      setError(`Failed to renegotiate: ${err.message}`)
    }
  }

  async function handleCancel(requestId) {
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    try {
      const res = await fetch(`${apiBase}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ requestId, status: 'canceled' })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchUserRequests()
    } catch (err) {
      setError(`Failed to cancel request: ${err.message}`)
    }
  }

  return (
    <div className="quotes-container">
      <h2>My Service Requests & Quotes</h2>
      {requests.length === 0 ? (
        <p>No service requests yet.</p>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req._id} style={{marginBottom:'1em'}}>
              <strong>{req.cleaningType}</strong> — {req.status} — {req.address}
              {req.status === 'quoted' && (
                <>
                  <button onClick={() => handleAccept(req._id)} style={{marginLeft:'1em'}}>Accept</button>
                  <button onClick={() => handleRenegotiate(req._id)} style={{marginLeft:'0.5em'}}>Renegotiate</button>
                  <button onClick={() => handleCancel(req._id)} style={{marginLeft:'0.5em'}}>Cancel</button>
                </>
              )}
              {req.status === 'pending' && (
                <button onClick={() => handleCancel(req._id)} style={{marginLeft:'1em'}}>Cancel</button>
              )}
              {req.status === 'renegotiate' && (
                <span style={{marginLeft:'1em',color:'#e67e22'}}>Waiting for admin response</span>
              )}
              {req.status === 'accepted' && (
                <span style={{marginLeft:'1em',color:'#27ae60'}}>Order created</span>
              )}
              {req.status === 'canceled' && (
                <span style={{marginLeft:'1em',color:'#c0392b'}}>Canceled</span>
              )}
              {req.status === 'rejected' && (
                <span style={{marginLeft:'1em',color:'#c0392b'}}>Rejected</span>
              )}
              {/* Negotiation History */}
              {req.negotiationHistory && req.negotiationHistory.length > 0 && (
                <div style={{marginTop:'0.5em',padding:'0.5em',background:'#f9f9f9',borderRadius:'4px'}}>
                  <strong>Negotiation History:</strong>
                  <ul style={{margin:'0.5em 0 0 0',padding:'0 0 0 1em'}}>
                    {req.negotiationHistory.map((q, idx) => (
                      <li key={q._id || idx} style={{fontSize:'13px'}}>
                        <span style={{fontWeight:'bold'}}>{q.status}</span>
                        {q.price && <> — <span>Price: ${q.price}</span></>}
                        {q.scheduledDate && <> — <span>Date: {q.scheduledDate}</span></>}
                        {q.scheduledTime && <> — <span>Time: {q.scheduledTime}</span></>}
                        {q.note && <> — <span>Note: {q.note}</span></>}
                        {q.counterNote && <> — <span>Counter: {q.counterNote}</span></>}
                        {q.rejectionReason && <> — <span>Reason: {q.rejectionReason}</span></>}
                        {q.createdAt && <> — <span>{new Date(q.createdAt).toLocaleString()}</span></>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Bill and Payment */}
              <pre style={{background:'#fffbe6',color:'#b8860b',padding:'0.5em',borderRadius:'4px',fontSize:'12px',marginBottom:'0.5em'}}>
                Bills debug: {JSON.stringify(req.bills, null, 2)}
              </pre>
              {req.bills && req.bills.length > 0 && req.bills.map(bill => (
                <div key={bill._id} style={{marginTop:'0.5em',padding:'0.5em',background:'#f1f8e9',borderRadius:'4px'}}>
                  <strong>Bill:</strong> Amount: ${bill.amount} — Status: {bill.status}
                  {bill.status !== 'paid' && (
                    <PayBill bill={bill} userToken={userToken} onPaid={fetchUserRequests} />
                  )}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
