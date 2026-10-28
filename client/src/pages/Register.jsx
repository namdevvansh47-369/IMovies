import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await register(name, email, password, phone, role);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-3 d-flex justify-content-center align-items-center flex-grow-1">
      <div className="cinema-card-static p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-2 shadow"
            style={{ background: 'linear-gradient(135deg, #e50914 0%, #990000 100%)' }}
          >
            <Film size={26} className="text-white" />
          </div>
          <h3 className="fw-bold text-white mb-1">Create an Account</h3>
          <p className="text-secondary small">Join IMovies for fast reservations & seat sync</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <User size={15} />
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Mail size={15} />
              </span>
              <input
                type="email"
                className="form-control bg-dark border-secondary text-light"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Phone size={15} />
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Lock size={15} />
              </span>
              <input
                type="password"
                className="form-control bg-dark border-secondary text-light"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small mb-1">Account Role</label>
            <select
              className="form-select bg-dark border-secondary text-light"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Regular Moviegoer (User)</option>
              <option value="admin">Cinema Manager (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-cinema w-100 py-2 fw-semibold mb-3"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Already have an account?{' '}
          <Link to="/login" className="text-danger text-decoration-none fw-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
