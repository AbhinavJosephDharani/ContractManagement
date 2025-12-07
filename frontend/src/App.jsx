import React from 'react'
import ServiceRequestForm from './ServiceRequestForm'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Anna Johnson — Home Cleaning Service</h1>
      </header>
      <main className="container">
        <ServiceRequestForm />
      </main>
    </div>
  )
}
