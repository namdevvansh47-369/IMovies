import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import MoviesPage from './pages/MoviesPage';
import MovieDetails from './pages/MovieDetails';
import TheatresPage from './pages/TheatresPage';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import UserBookings from './pages/UserBookings';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminTheatres from './pages/admin/AdminTheatres';
import AdminShows from './pages/admin/AdminShows';
import AdminBookings from './pages/admin/AdminBookings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/theatres" element={<TheatresPage />} />
              <Route path="/seat-selection/:showId" element={<SeatSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation/:id"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <UserBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/movies"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminMovies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/theatres"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminTheatres />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shows"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminShows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
