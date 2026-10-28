import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import SeatGrid from '../components/SeatGrid';
import {
  Film,
  MapPin,
  Clock,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    selectedShow,
    setSelectedShow,
    selectedSeats,
    toggleSeat,
    initShowBooking,
    pricing
  } = useBooking();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch show details
  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shows/${showId}`);
        if (res.data?.success) {
          setShow(res.data.show);
          initShowBooking(res.data.show);
        } else {
          setErrorMsg('Show not found or cancelled.');
        }
      } catch (err) {
        console.error('Failed to load show:', err);
        setErrorMsg('Error loading show details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [showId]);

  // Socket.io Real-Time Synchronization
  useEffect(() => {
    if (!showId) return;

    // Join show room
    socket.emit('join_show', showId);

    // Handle seats locked by other clients
    const handleSeatsLocked = (data) => {
      if (data.showId === showId) {
        setShow((prevShow) => {
          if (!prevShow) return prevShow;
          const updatedSeats = prevShow.seats.map((seat) => {
            if (data.lockedSeats.includes(seat.seatNumber)) {
              return {
                ...seat,
                status: 'locked',
                lockedBy: data.lockedBy,
                lockedUntil: data.lockedUntil
              };
            }
            return seat;
          });
          return { ...prevShow, seats: updatedSeats };
        });
      }
    };

    // Handle seats released
    const handleSeatsReleased = (data) => {
      if (data.showId === showId) {
        setShow((prevShow) => {
          if (!prevShow) return prevShow;
          const updatedSeats = prevShow.seats.map((seat) => {
            if (data.releasedSeats.includes(seat.seatNumber)) {
              return {
                ...seat,
                status: 'available',
                lockedBy: null,
                lockedUntil: null
              };
            }
            return seat;
          });
          return { ...prevShow, seats: updatedSeats };
        });
      }
    };

    // Handle seats booked (confirmed)
    const handleSeatsUpdated = (data) => {
      if (data.showId === showId) {
        setShow((prevShow) => {
          if (!prevShow) return prevShow;
          if (data.seats) {
            return { ...prevShow, seats: data.seats };
          }
          if (data.bookedSeats) {
            const updatedSeats = prevShow.seats.map((seat) => {
              if (data.bookedSeats.includes(seat.seatNumber)) {
                return { ...seat, status: 'booked' };
              }
              return seat;
            });
            return { ...prevShow, seats: updatedSeats };
          }
          return prevShow;
        });
      }
    };

    socket.on('seats_locked', handleSeatsLocked);
    socket.on('seats_released', handleSeatsReleased);
    socket.on('seats_updated', handleSeatsUpdated);

    return () => {
      socket.emit('leave_show', showId);
      socket.off('seats_locked', handleSeatsLocked);
      socket.off('seats_released', handleSeatsReleased);
      socket.off('seats_updated', handleSeatsUpdated);
    };
  }, [showId]);

  const handleSeatClick = (seat) => {
    const isCurrentlySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    toggleSeat(seat);

    // Emit live lock / release to socket
    if (!isCurrentlySelected) {
      socket.emit('lock_seats', {
        showId,
        seatNumbers: [seat.seatNumber],
        userId: user?._id || 'guest_' + socket.id
      });
    } else {
      socket.emit('release_seats', {
        showId,
        seatNumbers: [seat.seatNumber],
        userId: user?._id || 'guest_' + socket.id
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    if (!isAuthenticated) {
      // Save state and redirect to login
      navigate('/login', { state: { from: `/seat-selection/${showId}` } });
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading live auditorium...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !show) {
    return (
      <div className="container py-5 text-center">
        <div className="cinema-card-static p-5">
          <AlertCircle size={40} className="text-danger mb-3" />
          <h5>{errorMsg || 'Show not available'}</h5>
          <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
        </div>
      </div>
    );
  }

  const showTime = new Date(show.showDateTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const showDate = new Date(show.showDateTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Top Breadcrumb & Movie Header */}
      <div className="cinema-card-static p-3 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <Link
              to={`/movies/${show.movie?._id}`}
              className="btn btn-sm btn-dark border border-secondary text-light p-2 rounded-circle"
              title="Back to Movie"
            >
              <ArrowLeft size={16} />
            </Link>

            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold m-0 text-white">{show.movie?.title}</h5>
                <span className="badge bg-danger small py-0">{show.format || 'IMAX 3D'}</span>
              </div>
              <div className="text-secondary small d-flex flex-wrap align-items-center gap-2">
                <span>{show.theatre?.name}</span>
                <span>•</span>
                <span>{show.screenName}</span>
                <span>•</span>
                <span className="text-light">{showDate}, {showTime}</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <span className="badge bg-success bg-opacity-25 text-success border border-success small px-2 py-1">
                Live Seat Synchronization Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Summary Sidebar */}
      <div className="row g-4">
        {/* Left: Interactive Curved Seat Matrix */}
        <div className="col-lg-8">
          <SeatGrid show={show} onSeatClick={handleSeatClick} />
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="col-lg-4">
          <div className="cinema-card-static p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary d-flex align-items-center gap-2">
              <Film size={18} className="text-danger" /> Booking Summary
            </h5>

            {/* Selected Seats Chips */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Selected Seats:</span>
                <span className="badge bg-secondary small">{selectedSeats.length} / 10 max</span>
              </div>

              {selectedSeats.length === 0 ? (
                <div className="p-3 bg-black bg-opacity-50 border border-secondary rounded-3 text-center text-secondary small">
                  Click on any available seat on the grid to reserve.
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat.seatNumber}
                      className="badge bg-danger px-3 py-2 rounded-2 d-flex align-items-center gap-1 shadow-sm"
                    >
                      <strong>{seat.seatNumber}</strong> ({seat.tier}) • ₹{seat.price}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Financials Breakdown */}
            <div className="d-flex flex-column gap-2 py-3 border-top border-secondary small">
              <div className="d-flex justify-content-between text-secondary">
                <span>Tickets Subtotal</span>
                <span className="text-light fw-semibold">₹{pricing.subtotal}</span>
              </div>

              <div className="d-flex justify-content-between text-secondary">
                <span>Convenience Fees</span>
                <span className="text-light fw-semibold">₹{pricing.convenienceFee}</span>
              </div>

              <div className="d-flex justify-content-between text-secondary">
                <span>Taxes & GST (18%)</span>
                <span className="text-light fw-semibold">₹{pricing.taxAmount}</span>
              </div>

              <div className="d-flex justify-content-between pt-2 border-top border-secondary fs-6 fw-bold text-white">
                <span>Total Payable</span>
                <span className="text-danger fs-5">₹{pricing.totalAmount}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              type="button"
              className="btn btn-cinema w-100 py-3 mt-3 d-flex align-items-center justify-content-center gap-2 fs-6"
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToCheckout}
            >
              <CreditCard size={18} /> Proceed to Payment
            </button>

            <div className="mt-3 text-center">
              <span className="text-secondary small d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={14} className="text-success" /> 100% Guaranteed Safe Checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
