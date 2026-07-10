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
    setProcessing(true)
    setError('')

    try {
      // Step 1: ask our backend to create a Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        eventId,
        seatIds,
      })

      const { orderId, amount, razorpayKeyId } = orderResponse.data

      // Step 2: configure and open Razorpay's checkout widget
      const options = {
        key: razorpayKeyId,
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        name: 'EventTix',
        description: 'Seat booking payment',
        order_id: orderId,
        handler: async function (response) {
          // Step 3: this runs automatically after a successful test payment
          await confirmBooking(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          )
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No seats selected. Please go back and select seats first.</p>
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