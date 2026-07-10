import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      const response = await api.get('/bookings/my')
      setBookings(response.data)
    } catch (err) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(bookingId) {
    try {
      await api.delete(`/bookings/${bookingId}`)
      fetchBookings() // refresh list to show updated status
    } catch (err) {
      setError('Failed to cancel booking')
    }
  }

  if (loading) return <p className="text-center mt-10">Loading bookings...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => navigate('/events')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to events
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <div className="space-y-4 max-w-xl">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-800 font-medium">
                    Seats: {booking.seatIds.length}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Total: ₹{booking.totalAmount}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Booked on {new Date(booking.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookingsPage