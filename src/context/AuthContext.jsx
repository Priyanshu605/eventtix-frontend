import { createContext, useContext, useState } from 'react'

// Step 1: Create the "shelf" - an empty context to start with
const AuthContext = createContext(null)

// Step 2: The Provider - wraps your app, holds the actual state and logic
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // On first load, check if we already have a saved user (e.g., page was refreshed)
    const savedEmail = localStorage.getItem('userEmail')
    const savedRole = localStorage.getItem('userRole')
    const token = localStorage.getItem('token')

    if (token && savedEmail && savedRole) {
      return { email: savedEmail, role: savedRole }
    }
    return null
  })

  function login(token, email, role) {
    localStorage.setItem('token', token)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userRole', role)
    setUser({ email, role })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 3: A custom hook - the convenient way other components will access this
export function useAuth() {
  return useContext(AuthContext)
}