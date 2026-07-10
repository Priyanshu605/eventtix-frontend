import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await api.get('/events')
        setEvents(response.data)
      } catch (err) {
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  function handleLogout() {
    logout()
    navigate('/events')
  }

  if (loading) {
    return <p className="text-center mt-10">Loading events...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Events</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/events/${event.id}/seats`)}
          >
            <h2 className="text-xl font-semibold text-gray-800">{event.name}</h2>
            <p className="text-gray-600">{event.venue}</p>
            <p className="text-gray-500 text-sm">{new Date(event.dateTime).toLocaleString()}</p>
            <p className="text-gray-800 font-medium mt-2">₹{event.price}</p>
            <p className="text-sm text-gray-500">{event.availableSeats} seats available</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventsPage