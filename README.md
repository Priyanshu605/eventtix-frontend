# EventTix Frontend 🎟️

React frontend for **EventTix** — a full-stack event ticketing platform with real-time seat locking, secure payments, and OAuth2 authentication.

**Backend Repo:** [eventtix](https://github.com/Priyanshu605/eventtix)
**Live Demo:** _(add link after deployment)_

---

## Tech Stack

- **React** (Vite) — component-based UI, fast dev server with HMR
- **Tailwind CSS** — utility-first styling
- **React Router** — client-side routing
- **Axios** — HTTP client with automatic JWT attachment via interceptors
- **Razorpay Checkout** — payment widget integration
- **Google Identity Services** — OAuth2 sign-in

---

## Features

- Email/password login and registration, plus **Google OAuth2 login**
- Browse events, view live seat availability
- **Multi-select seat picker** — select any number of available seats before committing
- Seats are only locked (via the backend's Redis-based locking) at the moment of proceeding to payment, minimizing unnecessary lock contention
- Real Razorpay checkout integration (test mode) with server-side payment verification
- View and cancel bookings

---

## Architecture Notes

### Auth state via React Context
Rather than passing login state through props across every page, the app uses a single `AuthContext` (`src/context/AuthContext.jsx`) that holds the current user and exposes `login()`/`logout()` functions to any component via a `useAuth()` hook. JWT tokens are persisted in `localStorage` so sessions survive page refreshes.

### Centralized API layer
All backend calls go through a single configured Axios instance (`src/api/axios.js`), which automatically attaches the JWT `Authorization` header to every outgoing request via an interceptor — no component needs to manually manage auth headers.

### Seat selection flow
Seat selection is intentionally **not** tied to locking on every click. Users can freely multi-select seats in the UI; the actual Redis-backed lock is only acquired when the user clicks "Proceed to Payment," reducing unnecessary lock churn for users who are still browsing/deciding.

---

## Project Structure

```
src/
├── api/            # Axios instance + interceptors
├── context/         # AuthContext (global login state)
├── pages/           # Route-level components
│   ├── LoginPage.jsx
│   ├── EventsPage.jsx
│   ├── SeatMapPage.jsx
│   ├── PaymentPage.jsx
│   └── MyBookingsPage.jsx
├── App.jsx           # Route definitions
└── main.jsx          # App entry point, providers
```

---

## Running Locally

### Prerequisites
- Node.js
- The [EventTix backend](https://github.com/Priyanshu605/eventtix) running locally on `http://localhost:8080`
- A Google Cloud OAuth Client ID (same one used by the backend)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/Priyanshu605/eventtix-frontend.git
cd eventtix-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
VITE_GOOGLE_CLIENT_ID=<your Google OAuth client id>
```

4. Start the dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** the backend must be running and accessible at `http://localhost:8080` for the app to function — event listings, login, seat locking, and payments all depend on it.

---

## What I'd Add Next

- Loading skeletons instead of plain "Loading..." text
- Admin UI for creating events (currently backend-only, tested via Postman)
- Responsive/mobile layout polish for the seat map grid