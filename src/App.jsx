import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import EventsPage from './pages/EventsPage'
import SeatMapPage from './pages/SeatMapPage'
import PaymentPage from './pages/PaymentPage'
import MyBookingsPage from './pages/MyBookingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId/seats" element={<SeatMapPage />} />
      <Route path="/events/:eventId/payment" element={<PaymentPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
    </Routes>
  )
}

export default App