import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import EventsPage from './pages/EventsPage'
import SeatMapPage from './pages/SeatMapPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId/seats" element={<SeatMapPage />} />
    </Routes>
  )
}

export default App