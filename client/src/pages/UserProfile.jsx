import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ShieldCheck, CheckCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = { name, phone };
      if (password.trim()) {
        payload.password = password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setPassword('');
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 my-2" style={{ maxWidth: '680px' }}>
      <div className="cinema-card-static p-4 p-md-5">
        <div className="text-center mb-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="rounded-circle shadow mb-3 border border-2 border-danger"
            style={{ width: '90px', height: '90px', objectFit: 'cover' }}
          />
          <h3 className="fw-bold text-white mb-1">{user?.name}</h3>
          <p className="text-secondary small mb-2">{user?.email}</p>
          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-1">
            {user?.role === 'admin' ? 'Administrator' : 'Verified Cinema Club Member'}
          </span>
        </div>

        {successMsg && (
          <div className="alert alert-success py-2 px-3 mb-4 rounded-3 small d-flex align-items-center gap-2">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}
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
                value={user?.email || ''}
                disabled
              />
            </div>
            <div className="form-text text-secondary small">Email address cannot be modified.</div>
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small mb-1">New Password (optional)</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Lock size={15} />
              </span>
              <input
                type="password"
                className="form-control bg-dark border-secondary text-light"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cinema w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
