import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Ticket, Search, CheckCircle, XCircle, QrCode } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewingPass, setViewingPass] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Ticket size={24} className="text-danger" /> Cinema Bookings Audit Log
          </h2>
          <p className="text-secondary small m-0">All customer reservations, transactions, and status history</p>
        </div>

        {/* Filter controls */}
        <div className="d-flex gap-2">
          <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ width: '220px' }}>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-light"
              placeholder="Search Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              <Search size={14} />
            </button>
          </form>

          <select
            className="form-select form-select-sm bg-dark border-secondary text-light rounded-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">All Bookings</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="cinema-card-static p-5 text-center text-secondary">
          <h5>No bookings match your filter.</h5>
        </div>
      ) : (
        <div className="cinema-card-static p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary">
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre & Showtime</th>
                  <th>Reserved Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace text-light fw-bold">{b.bookingId}</td>
                    <td>
                      <div className="fw-semibold text-white">{b.user?.name || 'Customer'}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td>
                      <div className="text-light fw-semibold">{b.movie?.title}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {b.show?.format || 'IMAX 3D'}
                      </div>
                    </td>
                    <td>
                      <div className="text-light">{b.theatre?.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {new Date(b.show?.showDateTime || b.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {b.seats?.map((s) => (
                          <span key={s.seatNumber} className="badge bg-secondary">
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="fw-bold text-white">₹{b.totalAmount}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-light rounded-2"
                        onClick={() => setViewingPass(b)}
                        title="View Ticket QR"
                      >
                        <QrCode size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Ticket Modal */}
      {viewingPass && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
          onClick={() => setViewingPass(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg text-center p-4">
              <h5 className="fw-bold text-white mb-1">{viewingPass.movie?.title}</h5>
              <div className="text-secondary small mb-3">Booking ID: {viewingPass.bookingId}</div>

              <div className="p-3 bg-white d-inline-block rounded-3 shadow mb-3 mx-auto">
                {viewingPass.qrCode && (
                  <img src={viewingPass.qrCode} alt="QR" style={{ width: 170, height: 170 }} />
                )}
              </div>

              <div className="small text-secondary mb-3">
                Seats: <strong className="text-warning">{viewingPass.seats?.map((s) => s.seatNumber).join(', ')}</strong> | Paid: <strong className="text-white">₹{viewingPass.totalAmount}</strong>
              </div>

              <button className="btn btn-sm btn-outline-secondary w-50 mx-auto" onClick={() => setViewingPass(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
