import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import {
  CheckCircle,
  Ticket,
  Printer,
  Film,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore
    }

    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${id}`);
          if (res.data?.success) {
            setBooking(res.data.booking);
          }
        } catch (err) {
          console.error('Failed to load booking:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking details unavailable.</h4>
        <Link to="/my-bookings" className="btn btn-cinema mt-3">Go to My Bookings</Link>
      </div>
    );
  }

  const showDateTime = booking.show?.showDateTime || booking.createdAt;
  const formattedDate = new Date(showDateTime).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = new Date(showDateTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container py-4 my-2" style={{ maxWidth: '780px' }}>
      {/* Success banner */}
      <div className="text-center mb-4">
        <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-flex mb-2 text-success">
          <CheckCircle size={44} />
        </div>
        <h2 className="fw-bold text-white mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small mb-0">
          Your cinema tickets have been reserved. Show this digital pass or QR code at the cinema entrance.
        </p>
      </div>

      {/* Printable Digital Cinema Ticket */}
      <div className="ticket-container p-4 p-md-5 mb-4 shadow-lg text-light">
        <div className="ticket-notch-left"></div>
        <div className="ticket-notch-right"></div>

        <div className="row g-4 align-items-center">
          {/* Left Details */}
          <div className="col-md-8 border-end-md border-secondary pe-md-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-danger text-uppercase fw-bold px-2 py-1 small">
                Confirmed Entry Pass
              </span>
              <span className="text-secondary small font-monospace">
                {booking.bookingId}
              </span>
            </div>

            <h3 className="fw-extrabold text-white mb-1">
              {booking.movie?.title}
            </h3>

            <div className="d-flex flex-wrap gap-2 text-secondary small mb-3">
              <span className="badge bg-dark border border-secondary text-light">
                {booking.movie?.certificate || 'UA'}
              </span>
              <span className="badge bg-dark border border-secondary text-info">
                {booking.show?.format || 'IMAX 3D'}
              </span>
              <span className="badge bg-dark border border-secondary text-light">
                {booking.movie?.duration}m
              </span>
            </div>

            {/* Theatre & Screen */}
            <div className="d-flex align-items-center gap-2 mb-2 text-light small">
              <MapPin size={15} className="text-danger flex-shrink-0" />
              <div>
                <strong>{booking.theatre?.name}</strong>
                <span className="text-secondary"> — {booking.show?.screenName || 'Audi 1'}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="d-flex align-items-center gap-2 mb-3 text-light small">
              <Calendar size={15} className="text-danger flex-shrink-0" />
              <div>{formattedDate} • <strong>{formattedTime}</strong></div>
            </div>

            {/* Seats Grid */}
            <div className="p-3 bg-black bg-opacity-40 rounded-3 border border-secondary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-secondary text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
                    Reserved Seats ({booking.seats?.length})
                  </div>
                  <div className="fw-bold fs-5 text-warning">
                    {booking.seats?.map((s) => s.seatNumber).join(', ')}
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-secondary text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
                    Total Paid
                  </div>
                  <div className="fw-bold fs-5 text-white">
                    ₹{booking.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right QR Code Pass */}
          <div className="col-md-4 text-center">
            <div className="p-3 bg-white d-inline-block rounded-3 shadow mb-2">
              {booking.qrCode ? (
                <img
                  src={booking.qrCode}
                  alt="Entry Ticket QR"
                  className="img-fluid"
                  style={{ width: '150px', height: '150px' }}
                />
              ) : (
                <div style={{ width: '150px', height: '150px' }} className="d-flex align-items-center justify-content-center text-dark">
                  QR Code
                </div>
              )}
            </div>

            <div className="small text-secondary mb-1" style={{ fontSize: '0.72rem' }}>
              Scan at Entrance Turnstile
            </div>
            <div className="text-success small fw-semibold d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={14} /> Verified Cinema Ticket
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-3 px-3 py-2"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Print / Save Ticket
        </button>

        <div className="d-flex gap-2">
          <Link
            to="/my-bookings"
            className="btn btn-dark border border-secondary text-light d-flex align-items-center gap-1 rounded-3 px-3 py-2"
          >
            <Ticket size={16} /> My Bookings
          </Link>

          <Link
            to="/movies"
            className="btn btn-cinema d-flex align-items-center gap-1 rounded-3 px-3 py-2"
          >
            Explore More <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
