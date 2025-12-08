import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AuthPage from './AuthPage'
import UserPage from './UserPage'
import AdminPage from './AdminPage'
import './styles.css'

function AppRoutes() {
  const [userToken, setUserToken] = React.useState(null)
  const [userName, setUserName] = React.useState(null)

  React.useEffect(() => {
    // Check if user token exists
    const token = localStorage.getItem('userToken')
    const name = localStorage.getItem('userName')
    if (token) {
      setUserToken(token)
      setUserName(name)
    }
  }, [])

  function handleUserLogin(token) {
    setUserToken(token)
    const name = localStorage.getItem('userName')
    setUserName(name)
  }

  function handleUserLogout() {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userName')
    setUserToken(null)
    setUserName(null)
  }

  return (
    <Routes>
      <Route path="/" element={userToken ? <UserPage userName={userName} userToken={userToken} onLogout={handleUserLogout} /> : <AuthPage onLoginSuccess={handleUserLogin} />} />
      <Route path="/user" element={userToken ? <UserPage userName={userName} userToken={userToken} onLogout={handleUserLogout} /> : <AuthPage onLoginSuccess={handleUserLogin} />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
)
