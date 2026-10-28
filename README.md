# 🎬 IMovies — Full-Stack Cinema Management & Ticket Booking System

A production-grade **MERN Stack** cinema management and online ticket booking platform built with **MongoDB**, **Express.js**, **React.js (Vite)**, and **Node.js**.

The platform provides a seamless cinema booking experience with **real-time seat availability tracking via Socket.io**, interactive curved screen seating layouts (Silver, Gold, Platinum tiers), secure JWT role-based access control (User & Admin), simulated checkout with instant QR-coded cinema entry passes, cancellation with refund management, and an admin management dashboard.

---

## 🌟 Key Features

### 👤 User Experience
- **Hero Showcase Carousel:** High-definition video banner slider of featured blockbusters with responsive YouTube trailer preview modal.
- **Movie Exploration & Filtering:** Filter movies by Genre (Action, Sci-Fi, Drama, Animation, etc.), Language, Status (*Now Showing* vs. *Coming Soon*), and Sort by Rating, Release Date, or Title.
- **Cinema & Multiplex Finder:** Explore theatres across cities (Mumbai, Delhi, Bangalore, etc.) with screen specifications and luxury amenities (IMAX with Laser, Dolby Atmos, 4DX, VIP Loungers).
- **Interactive Real-Time Seating Matrix:**
  - Curved cinema screen visualization.
  - Three distinct seating tiers: **Silver** (Front), **Gold** (Executive), and **Platinum** (Luxury Recliner).
  - **Live WebSocket Synchronization (Socket.io):** Real-time seat hold/lock countdown (5 minutes) prevents double-bookings; other users instantly see held seats in real-time.
- **Checkout & Simulated Payment Gateway:**
  - Supports Credit/Debit Cards, Instant UPI with dynamic QR code generation, and Net Banking.
  - Generates verifiable **Digital Cinema Tickets with QR Code** containing encrypted booking details for turnstile scanning.
- **User Dashboard & Bookings Management:**
  - View upcoming confirmed tickets and past history.
  - Instant ticket download / print layout.
  - Self-service booking cancellation with automatic seat release and refund calculation.
- **Notification Drawer:** In-app real-time alerts for booking confirmations, cancellations, and promotions.

### 🛡️ Admin Management Panel
- **Analytics KPI Dashboard:** Real-time revenue calculations, total tickets sold, active movie counts, and revenue-by-movie performance.
- **Catalog Management (CRUD):** Add, edit, and remove movies with custom poster images, banner backdrops, YouTube trailers, cast, and certificates.
- **Theatre & Auditorium Configuration:** Create multiplexes with custom auditorium screen layouts and seat rows/cols.
- **Show Scheduling Engine:** Schedule movie showtimes across auditoriums with custom Silver/Gold/Platinum ticket pricing.
- **Audit Log:** Comprehensive booking log with search by Booking ID and status filtering.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5, Bootstrap Icons, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.io (WebSockets), Express Rate Limit, Morgan, Multer |
| **Database** | MongoDB with Mongoose ODM (Auto-fallback to in-memory MongoDB runner if no local daemon is running) |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js password hashing, Role-Based Access Control (RBAC) |
| **Ticketing** | QRCode generator for verified entrance passes |

---

## 📁 Project Structure

```
imovies-app/
├── package.json               # Root convenience scripts
├── README.md                  # Project documentation
├── server/                    # Backend API & WebSocket Server
│   ├── config/
│   │   ├── db.js              # Resilient MongoDB connector (Atlas/Local/In-Memory)
│   │   └── seedData.js        # Initial dataset of movies, multiplexes, shows, users
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── theatreController.js
│   │   ├── showController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication
│   │   ├── adminMiddleware.js  # Admin route protection
│   │   └── errorHandler.js    # Centralized error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Show.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── Notification.js
│   ├── routes/                # Express API routes
│   ├── sockets/
│   │   └── seatSocket.js      # Socket.io live seat lock, release & broadcast
│   ├── .env                   # Environment variables
│   ├── server.js              # Server entry point
│   └── package.json
└── client/                    # React 18 + Vite Frontend
    ├── public/
    ├── src/
    │   ├── components/        # Navbar, Footer, MovieCard, SeatGrid, TrailerModal, etc.
    │   ├── context/           # AuthContext, BookingContext
    │   ├── pages/             # Home, Movies, Details, SeatSelection, Checkout, Bookings
    │   │   └── admin/         # Admin Dashboard, Movies, Theatres, Shows, Bookings
    │   ├── services/          # Axios API instance & Socket.io client
    │   ├── App.jsx            # React Router v6 route definitions
    │   ├── index.css          # Cinema theme styling & curved screen aesthetics
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or v20+ recommended)
- npm (v9+)

### Installation
From the root directory (`imovies-app`):

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

### Running the Application

#### Option A: Unified Production Mode (Fastest)
Build the frontend and run the Express server (Express serves both the API and the compiled React frontend on port 5000):

```bash
# In the client directory, build the client:
cd client
npm run build

# In the server directory, start the server:
cd ../server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

#### Option B: Concurrent Development Mode
Run the backend and Vite dev server simultaneously:

```bash
# Terminal 1 - Backend Server
cd server
npm start

# Terminal 2 - Frontend Vite Server
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔑 Demo Login Credentials

The database automatically seeds with realistic demo data on initial launch:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `admin123` | Full access to Admin Panel, Shows, Movies & Theatres |
| **Moviegoer (User)** | `john@example.com` | `password123` | Standard booking, seat selection, and tickets |

*(You can also use the one-click **"⚡ Quick Demo Login"** buttons directly on the Sign-In page).*

---

## 📡 REST API Endpoints Overview

### Authentication
- `POST /api/auth/register` — Register a new customer or manager
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/profile` — Get authenticated user details
- `PUT /api/auth/profile` — Update account profile and phone

### Movies
- `GET /api/movies` — Filter movies by genre, language, status, search, sorting
- `GET /api/movies/featured` — Get top rated movies for hero banner
- `GET /api/movies/:id` — Get single movie details and scheduled shows
- `POST /api/movies` *(Admin)* — Create new movie
- `PUT /api/movies/:id` *(Admin)* — Update movie details
- `DELETE /api/movies/:id` *(Admin)* — Remove movie and associated shows

### Multiplexes & Theatres
- `GET /api/theatres` — List theatres (with optional city filter)
- `GET /api/theatres/cities` — Distinct list of operational cities
- `POST /api/theatres` *(Admin)* — Add multiplex and configure auditorium screens

### Shows & Real-Time Seating
- `GET /api/shows` — List scheduled shows filtered by date/movie/theatre
- `GET /api/shows/:id` — Get live auditorium seat layout and pricing tiers
- `POST /api/shows` *(Admin)* — Schedule show with custom Silver/Gold/Platinum tiers

### Bookings & Payments
- `POST /api/bookings` — Create booking, process payment, generate QR entry pass
- `GET /api/bookings/my-bookings` — Customer booking history
- `GET /api/bookings/:id` — View specific digital entry ticket
- `PUT /api/bookings/:id/cancel` — Cancel booking, release seats, and trigger refund

### Admin Analytics
- `GET /api/admin/dashboard` — Overview KPI metrics, revenue charts, recent orders
- `GET /api/admin/bookings` — Complete audit log of all transactions
