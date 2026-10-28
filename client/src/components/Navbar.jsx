import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Film,
  MapPin,
  Search,
  User,
  ShieldCheck,
  Ticket,
  LogOut,
  ChevronDown
} from 'lucide-react';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { city, changeCity } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black bg-opacity-95 border-bottom border-secondary sticky-top py-2">
      <div className="container-fluid px-lg-4">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 m-0 text-decoration-none">
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center shadow"
            style={{ background: 'linear-gradient(135deg, #e50914 0%, #990000 100%)' }}
          >
            <Film size={22} className="text-white" />
          </div>
          <span className="brand-font fs-4 fw-extrabold tracking-wide text-white">
            I<span className="text-danger">MOVIES</span>
          </span>
        </Link>

        {/* City Selector */}
        <div className="dropdown ms-2 ms-lg-3 d-none d-sm-block">
          <button
            className="btn btn-sm btn-dark border border-secondary text-light dropdown-toggle d-flex align-items-center gap-1 px-3 py-2 rounded-3"
            type="button"
            data-bs-toggle="dropdown"
          >
            <MapPin size={14} className="text-danger" />
            <span className="fw-semibold small">{city}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-dark border-secondary shadow-lg">
            {CITIES.map((c) => (
              <li key={c}>
                <button
                  className={`dropdown-item small ${c === city ? 'active bg-danger text-white' : ''}`}
                  onClick={() => changeCity(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-none d-md-flex ms-3 flex-grow-1" style={{ maxWidth: '380px' }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-dark border-secondary text-secondary">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-light"
              placeholder="Search movies, genres, cinemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-secondary ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link to="/movies" className="nav-link text-light fw-semibold small">
                Explore Movies
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/theatres" className="nav-link text-light fw-semibold small">
                Cinemas & Theatres
              </Link>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/my-bookings" className="nav-link text-light fw-semibold small d-flex align-items-center gap-1">
                  <Ticket size={15} className="text-danger" /> My Bookings
                </Link>
              </li>
            )}

            {isAdmin && (
              <li className="nav-item">
                <Link
                  to="/admin/dashboard"
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 rounded-3 px-2 py-1 fw-semibold small"
                >
                  <ShieldCheck size={14} /> Admin Panel
                </Link>
              </li>
            )}

            {/* Notification Bell (Authenticated) */}
            {isAuthenticated && (
              <li className="nav-item d-none d-lg-block">
                <NotificationDropdown />
              </li>
            )}

            {/* User Profile / Auth Actions */}
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-sm btn-dark border border-secondary text-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: 24, height: 24, objectFit: 'cover' }}
                  />
                  <span className="small fw-semibold text-truncate" style={{ maxWidth: 100 }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end border-secondary shadow-lg">
                  <li className="px-3 py-2 border-bottom border-secondary">
                    <div className="fw-bold text-light small">{user.name}</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      {user.email}
                    </div>
                    {user.role === 'admin' && (
                      <span className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.65rem' }}>
                        Administrator
                      </span>
                    )}
                  </li>
                  <li>
                    <Link to="/my-bookings" className="dropdown-item small d-flex align-items-center gap-2">
                      <Ticket size={14} /> My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="dropdown-item small d-flex align-items-center gap-2">
                      <User size={14} /> Account Settings
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider border-secondary" /></li>
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item small text-warning d-flex align-items-center gap-2">
                          <ShieldCheck size={14} /> Admin Overview
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/movies" className="dropdown-item small text-warning">
                          Manage Movies
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/theatres" className="dropdown-item small text-warning">
                          Manage Theatres
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/shows" className="dropdown-item small text-warning">
                          Schedule Shows
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button
                      className="dropdown-item small text-danger d-flex align-items-center gap-2"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                <Link to="/login" className="btn btn-sm btn-outline-light rounded-3 px-3 fw-semibold small">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-cinema rounded-3 px-3 fw-semibold small">
                  Sign Up
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
