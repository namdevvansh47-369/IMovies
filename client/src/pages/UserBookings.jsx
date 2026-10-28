import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  AlertTriangle,
  QrCode,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    try {
      setCancelLoading(true);
      const res = await api.put(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: 'User cancelled reservation via dashboard'
      });

      if (res.data?.success) {
        setBookings(
          bookings.map((b) => (b._id === cancellingBooking._id ? res.data.booking : b))
        );
        setCancellingBooking(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const now = new Date();

  const upcomingBookings = bookings.filter((b) => {
    const showTime = b.show?.showDateTime ? new Date(b.show.showDateTime) : new Date(b.createdAt);
    return showTime >= now && b.bookingStatus === 'confirmed';
  });

  const pastOrCancelledBookings = bookings.filter((b) => {
    const showTime = b.show?.showDateTime ? new Date(b.show.showDateTime) : new Date(b.createdAt);
    return showTime < now || b.bookingStatus === 'cancelled';
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastOrCancelledBookings;

  return (
    <div className="container py-4 my-2">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Ticket size={24} className="text-danger" /> My Cinema Bookings
          </h2>
          <p className="text-secondary small m-0">View your active reservations, digital tickets, and past history</p>
        </div>

        {/* Tab switcher */}
        <div className="btn-group p-1 bg-black rounded-3 border border-secondary" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-2 fw-semibold px-3 ${
              activeTab === 'upcoming' ? 'btn-danger' : 'btn-dark text-secondary'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-2 fw-semibold px-3 ${
              activeTab === 'history' ? 'btn-danger' : 'btn-dark text-secondary'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History & Cancelled ({pastOrCancelledBookings.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="cinema-card-static p-5 text-center text-secondary my-4">
          <Ticket size={48} className="text-secondary mb-3 opacity-50" />
          <h5>No {activeTab} bookings found.</h5>
          <p className="small text-muted mb-4">You have no reservations under this tab right now.</p>
          <Link to="/movies" className="btn btn-cinema">
            Explore Movies & Book Tickets
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {displayedBookings.map((b) => {
            const showTime = b.show?.showDateTime ? new Date(b.show.showDateTime) : new Date(b.createdAt);
            const isCancelled = b.bookingStatus === 'cancelled';
            const canCancel = !isCancelled && showTime > now;

            return (
              <div key={b._id} className="cinema-card-static p-4 shadow-sm">
                <div className="row g-4 align-items-center">
                  {/* Poster */}
                  <div className="col-auto">
                    <img
                      src={b.movie?.poster}
                      alt={b.movie?.title}
                      className="rounded-3 object-fit-cover shadow"
                      style={{ width: '85px', height: '125px' }}
                    />
                  </div>

                  {/* Booking Info */}
                  <div className="col">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-1">
                      <div>
                        <h5 className="fw-bold text-white mb-1">{b.movie?.title}</h5>
                        <div className="text-secondary small font-monospace">
                          Booking ID: <strong className="text-light">{b.bookingId}</strong>
                        </div>
                      </div>

                      <div>
                        {isCancelled ? (
                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-1">
                            Cancelled (Refund: ₹{b.refundAmount})
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-1 d-flex align-items-center gap-1">
                            <CheckCircle size={13} /> Confirmed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 text-secondary small my-2">
                      <span className="d-flex align-items-center gap-1 text-light">
                        <MapPin size={14} className="text-danger" /> {b.theatre?.name} ({b.show?.screenName || 'Audi 1'})
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 text-light">
                        <Calendar size={14} className="text-danger" />
                        {showTime.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 text-light">
                        <Clock size={14} className="text-danger" />
                        {showTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2 border-top border-secondary mt-3">
                      <div>
                        <span className="text-secondary small me-2">Seats:</span>
                        {b.seats?.map((s) => (
                          <span key={s.seatNumber} className="badge bg-danger me-1">
                            {s.seatNumber}
                          </span>
                        ))}
                        <span className="text-secondary small ms-3">
                          Total: <strong className="text-white">₹{b.totalAmount}</strong>
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-light rounded-2 d-flex align-items-center gap-1"
                          onClick={() => setViewingTicket(b)}
                        >
                          <QrCode size={14} /> View Ticket Pass
                        </button>

                        {canCancel && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-2 d-flex align-items-center gap-1"
                            onClick={() => setCancellingBooking(b)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Cancel Booking?
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCancellingBooking(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-light mb-2">
                  Are you sure you want to cancel your booking for{' '}
                  <strong>{cancellingBooking.movie?.title}</strong> ({cancellingBooking.bookingId})?
                </p>
                <div className="alert alert-dark border-secondary small text-secondary">
                  <strong>Refund Policy:</strong> As per cinema guidelines, 90% of the total amount (
                  <strong className="text-warning">₹{Math.round(cancellingBooking.totalAmount * 0.9)}</strong>) will be
                  refunded to your original payment method. Your reserved seats will be released immediately.
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCancellingBooking(null)}
                  disabled={cancelLoading}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger fw-bold"
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Pass View Modal */}
      {viewingTicket && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
          onClick={() => setViewingTicket(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title fw-bold">🎬 Entry Pass — {viewingTicket.bookingId}</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setViewingTicket(null)}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <h4 className="fw-bold text-white mb-1">{viewingTicket.movie?.title}</h4>
                <div className="text-secondary small mb-3">
                  {viewingTicket.theatre?.name} • {viewingTicket.show?.screenName || 'Audi 1'}
                </div>

                <div className="p-3 bg-white d-inline-block rounded-3 shadow mb-3">
                  {viewingTicket.qrCode ? (
                    <img
                      src={viewingTicket.qrCode}
                      alt="QR"
                      style={{ width: '180px', height: '180px' }}
                    />
                  ) : (
                    <div style={{ width: 180, height: 180 }} className="text-dark d-flex align-items-center justify-content-center">
                      Verified
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-around text-center p-3 bg-black bg-opacity-40 rounded-3 border border-secondary mb-2">
                  <div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>SEATS</div>
                    <div className="fw-bold text-warning">{viewingTicket.seats?.map((s) => s.seatNumber).join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>DATE</div>
                    <div className="fw-bold text-light">
                      {new Date(viewingTicket.show?.showDateTime || viewingTicket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>TIME</div>
                    <div className="fw-bold text-light">
                      {new Date(viewingTicket.show?.showDateTime || viewingTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-cinema px-4"
                  onClick={() => window.print()}
                >
                  Print Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
