import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ServiceRequestForm from './ServiceRequestForm'
import './UserPage.css'

export default function UserPage({ userName, onLogout }) {
  const [activeTab, setActiveTab] = useState('submit')

  return (
    <div className="user-page">
      <header className="user-header">
        <div className="user-header-left">
          <h1>Service Request Dashboard</h1>
          <p className="welcome-text">Welcome, {userName}!</p>
        </div>
        <div className="user-header-right">
          <Link to="/" style={{fontSize:'13px',color:'#3498db',textDecoration:'none',marginRight:'15px'}}>← Back Home</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="user-container">
        <ServiceRequestForm />
      </main>
    </div>
  )
}
