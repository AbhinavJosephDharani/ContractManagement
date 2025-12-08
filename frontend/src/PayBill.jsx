import React, { useState } from 'react'

export default function PayBill({ bill, userToken, onPaid }) {
  const [form, setForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE + '/api/credit-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          billId: bill._id,
          ...form
        })
      })
      if (!res.ok) throw new Error(await res.text())
      setMessage('Payment successful!')
      if (onPaid) onPaid()
    } catch (err) {
      setMessage('Payment failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="pay-bill-form" onSubmit={handleSubmit} style={{marginTop:'1em',padding:'1em',border:'1px solid #eee',borderRadius:'6px',maxWidth:400}}>
      <h3>Pay Bill</h3>
      <div>
        <label>Name on Card</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Card Number</label>
        <input name="number" value={form.number} onChange={handleChange} required maxLength={16} />
      </div>
      <div>
        <label>Expiry</label>
        <input name="expiry" value={form.expiry} onChange={handleChange} required placeholder="MM/YY" />
      </div>
      <div>
        <label>CVV</label>
        <input name="cvv" value={form.cvv} onChange={handleChange} required maxLength={4} />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Paying...' : 'Pay Now'}</button>
      {message && <p style={{marginTop:'0.5em',color:message.startsWith('Payment successful')?'green':'red'}}>{message}</p>}
    </form>
  )
}
