import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function PaymentPage() {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const seatIds = location.state?.seatIds || []

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  async function handlePayNow() {
    if (seatIds.length === 0) {
      navigate(`/events/${eventId}/seats`)
      return
    }

    setProcessing(true)
    setError('')

    try {
      const orderResponse = await api.post('/payments/create-order', {
        eventId,
        seatIds,
      })

      const { orderId, amount, razorpayKeyId } = orderResponse.data

      const options = {
        key: razorpayKeyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'EventTix',
        description: 'Seat booking payment',
        order_id: orderId,
        handler: async function (response) {
          await confirmBooking(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          )
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
            navigate(`/events/${eventId}/seats`)
          },
        },
        theme: {
          color: '#2563eb',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError('Failed to start payment. Please try again.')
      setProcessing(false)
    }
  }

  async function confirmBooking(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      await api.post('/bookings', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        eventId,
        seatIds,
      })
      navigate('/my-bookings')
    } catch (err) {
      setError('Payment succeeded but booking confirmation failed. Please contact support.')
      setProcessing(false)
    }
  }

  if (seatIds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-600">No seats selected. Please go back and select seats first.</p>
        <button
          onClick={() => navigate('/events')}
          className="text-blue-600 hover:underline"
        >
          Back to events
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h1>

        <p className="text-gray-600 mb-2">
          Seats selected: <span className="font-medium">{seatIds.length}</span>
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handlePayNow}
          disabled={processing}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  )
}

export default PaymentPage