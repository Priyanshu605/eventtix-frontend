import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function SeatMapPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeatIds, setSelectedSeatIds] = useState([])
  const [lockMessage, setLockMessage] = useState('')
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    fetchSeats()
  }, [eventId])

  async function fetchSeats() {
    try {
      const response = await api.get(`/events/${eventId}/seats`)
      setSeats(response.data)
    } catch (err) {
      setError('Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

  function toggleSeat(seat) {
    if (seat.status !== 'AVAILABLE') return

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)   // already selected -> remove it
        : [...prev, seat.id]                     // not selected -> add it
    )
  }

  async function handleProceedToPayment() {
    setLockMessage('')
    setLocking(true)

    const lockedSeatIds = []

    try {
      for (const seatId of selectedSeatIds) {
        const response = await api.post(`/events/${eventId}/seats/${seatId}/lock`)
        if (response.data.success) {
          lockedSeatIds.push(seatId)
        }
      }

      if (lockedSeatIds.length !== selectedSeatIds.length) {
        setLockMessage('Some seats were just taken by someone else. Please review your selection.')
        setSelectedSeatIds(lockedSeatIds) // keep only what we actually secured... 
        fetchSeats()
        setLocking(false)
        return
      }

      navigate(`/events/${eventId}/payment`, { state: { seatIds: lockedSeatIds } })
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/login', { state: { redirectTo: `/events/${eventId}/seats` } })
        return
      }
      setLockMessage('Failed to lock seats. Please try again.')
      fetchSeats()
      setLocking(false)
    }
  }

  function getSeatColor(status, seatId) {
    if (selectedSeatIds.includes(seatId)) return 'bg-blue-500 text-white'
    if (status === 'AVAILABLE') return 'bg-green-100 hover:bg-green-200 cursor-pointer'
    if (status === 'LOCKED') return 'bg-yellow-200 cursor-not-allowed'
    if (status === 'BOOKED') return 'bg-gray-400 cursor-not-allowed'
    return 'bg-gray-100'
  }

  if (loading) return <p className="text-center mt-10">Loading seats...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => navigate('/events')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to events
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Select Seats</h1>

      {error && <p className="text-red-500">{error}</p>}
      {lockMessage && <p className="text-blue-600 mb-4">{lockMessage}</p>}

      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-100 inline-block rounded"></span> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-yellow-200 inline-block rounded"></span> Locked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-400 inline-block rounded"></span> Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-500 inline-block rounded"></span> Your selection
        </span>
      </div>

      <div className="grid grid-cols-8 gap-3 max-w-2xl">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => toggleSeat(seat)}
            disabled={seat.status !== 'AVAILABLE' && !selectedSeatIds.includes(seat.id)}
            className={`p-3 rounded text-sm font-medium ${getSeatColor(seat.status, seat.id)}`}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>

      {selectedSeatIds.length > 0 && (
        <button
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleProceedToPayment}
          disabled={locking}
        >
          {locking ? 'Locking seats...' : `Proceed to Payment (${selectedSeatIds.length} seat${selectedSeatIds.length > 1 ? 's' : ''})`}
        </button>
      )}
    </div>
  )
}

export default SeatMapPage