import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, CreditCard, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-black border-top border-secondary pt-5 pb-4 text-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Col */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #e50914 0%, #990000 100%)' }}
              >
                <Film size={20} className="text-white" />
              </div>
              <span className="brand-font fs-4 fw-bold text-white">
                I<span className="text-danger">MOVIES</span>
              </span>
            </div>
            <p className="small text-secondary mb-3 pe-lg-4">
              The premier online destination for movie lovers. Experience real-time seat tracking,
              instant QR ticketing, and seamless cinema showtime reservations with cutting-edge tech.
            </p>
            <div className="d-flex gap-3 small text-light">
              <span className="d-flex align-items-center gap-1">
                <ShieldCheck size={14} className="text-success" /> 256-Bit SSL
              </span>
              <span className="d-flex align-items-center gap-1">
                <CreditCard size={14} className="text-info" /> Instant Refund
              </span>
              <span className="d-flex align-items-center gap-1">
                <Sparkles size={14} className="text-warning" /> Live Seat Sync
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2">
            <h6 className="text-light fw-bold mb-3 small text-uppercase">Cinemas</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 m-0">
              <li><Link to="/movies" className="text-secondary text-decoration-none">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-secondary text-decoration-none">Coming Soon</Link></li>
              <li><Link to="/theatres" className="text-secondary text-decoration-none">All Theatres</Link></li>
              <li><Link to="/movies?genre=Sci-Fi" className="text-secondary text-decoration-none">Sci-Fi Blockbusters</Link></li>
            </ul>
          </div>

          {/* Formats */}
          <div className="col-6 col-lg-3">
            <h6 className="text-light fw-bold mb-3 small text-uppercase">Experience Formats</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 m-0">
              <li className="text-secondary">IMAX with Laser 4K</li>
              <li className="text-secondary">Dolby Atmos 12.1 Surround</li>
              <li className="text-secondary">4DX Immersive Motion</li>
              <li className="text-secondary">VIP Director's Cut Recliner</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3">
            <h6 className="text-light fw-bold mb-3 small text-uppercase">Movie Alerts</h6>
            <p className="small text-secondary mb-2">
              Subscribe to get exclusive early-bird notifications for upcoming blockbuster releases.
            </p>
            <div className="input-group input-group-sm">
              <input
                type="email"
                className="form-control bg-dark border-secondary text-light"
                placeholder="Enter email address"
              />
              <button className="btn btn-cinema" type="button">
                Join
              </button>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small">
          <div className="text-secondary">
            © {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved. Built with MERN Stack.
          </div>
          <div className="d-flex align-items-center gap-1 text-secondary">
            Designed with <Heart size={13} className="text-danger" fill="#e50914" /> for seamless cinema booking
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
