import React, { useState } from 'react'
import './LoginPage.css'

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const apiBase = import.meta.env.VITE_API_BASE

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!apiBase) {
        throw new Error('Backend API not configured')
      }

      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await res.json()
      // Store token in localStorage
      localStorage.setItem('adminToken', data.token)
      onLoginSuccess(data.token)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">Home Cleaning Service Management</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anna@cleaning.local"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="demo-hint">
          <strong>Demo credentials:</strong><br />
          Email: anna@cleaning.local<br />
          Password: admin123
        </p>
      </div>
    </div>
  )
}
