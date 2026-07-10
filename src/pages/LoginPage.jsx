import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const googleButtonRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, email: userEmail, role } = response.data

      login(token, userEmail, role)

      const redirectTo = location.state?.redirectTo || '/events'
      navigate(redirectTo)
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  async function handleGoogleResponse(response) {
    setError('')
    try {
      const backendResponse = await api.post('/auth/google', {
        idToken: response.credential,
      })
      const { token, email: userEmail, role } = backendResponse.data

      login(token, userEmail, role)

      const redirectTo = location.state?.redirectTo || '/events'
      navigate(redirectTo)
    } catch (err) {
      setError('Google login failed')
    }
  }

  useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 300,
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Login</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div ref={googleButtonRef} className="flex justify-center"></div>
      </form>
    </div>
  )
}

export default LoginPage