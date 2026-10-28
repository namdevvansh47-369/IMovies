import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  DollarSign,
  Ticket,
  Film,
  Building,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading admin analytics...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const revenueByMovie = data?.revenueByMovie || [];

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="badge bg-warning text-dark fw-bold mb-1 d-inline-flex align-items-center gap-1">
            <ShieldCheck size={13} /> Administrator Portal
          </div>
          <h2 className="fw-bold m-0 text-white">Cinema Management & Analytics</h2>
          <p className="text-secondary small m-0">Real-time overview of bookings, ticketing revenue, and schedules</p>
        </div>

        {/* Quick Actions */}
        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-sm btn-cinema d-flex align-items-center gap-1 rounded-2">
            <Plus size={15} /> Add Movie
          </Link>
          <Link to="/admin/shows" className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 rounded-2">
            <Plus size={15} /> Schedule Show
          </Link>
          <Link to="/admin/theatres" className="btn btn-sm btn-dark border border-secondary text-light d-flex align-items-center gap-1 rounded-2">
            <Plus size={15} /> Add Theatre
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-sm-6 col-xl-3">
          <div className="cinema-card-static p-3 h-100 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small">Total Revenue</div>
                <h3 className="fw-bold text-white my-1">₹{stats.totalRevenue?.toLocaleString()}</h3>
                <div className="text-success small" style={{ fontSize: '0.75rem' }}>
                  <TrendingUp size={12} className="me-1" /> All confirmed bookings
                </div>
              </div>
              <div className="rounded-3 p-2 bg-danger bg-opacity-10 text-danger">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="col-sm-6 col-xl-3">
          <div className="cinema-card-static p-3 h-100 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small">Tickets Issued</div>
                <h3 className="fw-bold text-white my-1">{stats.totalTicketsSold?.toLocaleString()}</h3>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Across {stats.totalBookings} transactions
                </div>
              </div>
              <div className="rounded-3 p-2 bg-warning bg-opacity-10 text-warning">
                <Ticket size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Movies */}
        <div className="col-sm-6 col-xl-3">
          <div className="cinema-card-static p-3 h-100 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small">Active Catalog</div>
                <h3 className="fw-bold text-white my-1">{stats.totalMovies} Movies</h3>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  {stats.totalShows} Scheduled Shows
                </div>
              </div>
              <div className="rounded-3 p-2 bg-info bg-opacity-10 text-info">
                <Film size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Theatres & Users */}
        <div className="col-sm-6 col-xl-3">
          <div className="cinema-card-static p-3 h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-secondary small">Cinemas & Members</div>
                <h3 className="fw-bold text-white my-1">{stats.totalTheatres} Theatres</h3>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  {stats.totalUsers} Registered Users
                </div>
              </div>
              <div className="rounded-3 p-2 bg-success bg-opacity-10 text-success">
                <Building size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Top Grossing Movies */}
        <div className="col-lg-5">
          <div className="cinema-card-static p-4 h-100">
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <TrendingUp size={18} className="text-warning" /> Top Performing Movies
            </h5>

            {revenueByMovie.length === 0 ? (
              <div className="text-secondary small py-3 text-center">No revenue data yet.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {revenueByMovie.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-2 bg-black bg-opacity-30">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="rounded object-fit-cover"
                      style={{ width: '42px', height: '58px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-light small text-truncate" style={{ maxWidth: '200px' }}>
                        {item.title}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {item.ticketsCount} tickets sold
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-success small">₹{item.totalRevenue?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="col-lg-7">
          <div className="cinema-card-static p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white m-0 d-flex align-items-center gap-2">
                <Ticket size={18} className="text-danger" /> Recent Bookings
              </h5>
              <Link to="/admin/bookings" className="text-warning small text-decoration-none">
                View All →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr className="text-secondary">
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="font-monospace text-light">{b.bookingId}</td>
                      <td>{b.user?.name || 'User'}</td>
                      <td className="text-truncate" style={{ maxWidth: 120 }}>{b.movie?.title}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {b.seats?.map((s) => s.seatNumber).join(', ')}
                        </span>
                      </td>
                      <td className="fw-bold text-light">₹{b.totalAmount}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
