import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Mail, Lock, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMsg(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMsg(res.message || 'Quick login failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-3 d-flex justify-content-center align-items-center flex-grow-1">
      <div className="cinema-card-static p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center mb-2 shadow"
            style={{ background: 'linear-gradient(135deg, #e50914 0%, #990000 100%)' }}
          >
            <Film size={26} className="text-white" />
          </div>
          <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
          <p className="text-secondary small">Sign in to your IMovies account</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="form-label text-secondary small mb-1">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Lock size={15} />
              </span>
              <input
                type="password"
                className="form-control bg-dark border-secondary text-light"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cinema w-100 py-2 fw-semibold mb-3"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins for instant evaluation */}
        <div className="p-3 bg-black bg-opacity-40 rounded-3 border border-secondary mb-4 text-center">
          <div className="text-secondary small fw-semibold mb-2">⚡ Quick Demo One-Click Login:</div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-info flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1"
              onClick={() => handleQuickLogin('john@example.com', 'password123')}
            >
              <User size={14} /> Demo User
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1"
              onClick={() => handleQuickLogin('admin@imovies.com', 'admin123')}
            >
              <ShieldCheck size={14} /> Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-secondary small">
          Don't have an account?{' '}
          <Link to="/register" className="text-danger text-decoration-none fw-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
