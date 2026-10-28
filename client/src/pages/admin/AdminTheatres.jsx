import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building, Plus, Trash2, MapPin, Check } from 'lucide-react';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const initialForm = {
    name: '',
    city: 'Mumbai',
    location: '',
    address: '',
    amenities: 'Dolby Atmos, IMAX with Laser, Recliner Seats, Gourmet Cafe, Valet Parking',
    screenName: 'IMAX Screen 1',
    displayType: 'IMAX Laser 4K',
    soundSystem: 'Dolby Atmos 12.1',
    rows: 8,
    cols: 12
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await api.get('/theatres');
      if (res.data?.success) {
        setTheatres(res.data.theatres || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this theatre and all associated show schedules?')) {
      try {
        await api.delete(`/theatres/${id}`);
        setTheatres(theatres.filter((t) => t._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete theatre');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        location: formData.location,
        address: formData.address,
        amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        screens: [
          {
            name: formData.screenName,
            displayType: formData.displayType,
            soundSystem: formData.soundSystem,
            rows: Number(formData.rows),
            cols: Number(formData.cols),
            totalSeats: Number(formData.rows) * Number(formData.cols)
          }
        ]
      };

      const res = await api.post('/theatres', payload);
      if (res.data?.success) {
        setTheatres([...theatres, res.data.theatre]);
        setShowModal(false);
        setFormData(initialForm);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving theatre');
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Building size={24} className="text-danger" /> Manage Theatres & Multiplexes
          </h2>
          <p className="text-secondary small m-0">Configure partner cinema screens, auditoriums, and seat capacities</p>
        </div>
        <button className="btn btn-cinema d-flex align-items-center gap-1 rounded-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Cinema Hall
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="cinema-card-static p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary">
                  <th>Cinema Name</th>
                  <th>City & Location</th>
                  <th>Screens</th>
                  <th>Amenities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-bold text-white fs-6">{t.name}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        {t.address}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                        {t.city}
                      </span>
                      <div className="text-secondary small mt-1">{t.location}</div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {t.screens?.map((s, idx) => (
                          <span key={idx} className="badge bg-dark border border-secondary text-light">
                            {s.name} ({s.totalSeats} seats)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '300px' }}>
                        {t.amenities?.map((a, idx) => (
                          <span key={idx} className="badge bg-black border border-secondary text-secondary" style={{ fontSize: '0.7rem' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger rounded-2"
                        onClick={() => handleDelete(t._id)}
                        title="Delete Cinema"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Cinema Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fw-bold">Add Cinema Multiplex</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-secondary mb-1">Theatre / Multiplex Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="e.g. PVR ICON Grand Mall"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">City</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Location Area</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="e.g. Lower Parel"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Full Street Address</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="e.g. 462, Senapati Bapat Marg"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary mb-1">Amenities (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      />
                    </div>

                    <div className="col-12 pt-2 border-top border-secondary">
                      <h6 className="fw-bold text-warning mb-2">Auditorium / Screen 1 Configuration</h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Screen Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.screenName}
                        onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Display Tech</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.displayType}
                        onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Sound System</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.soundSystem}
                        onChange={(e) => setFormData({ ...formData, soundSystem: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Seat Rows (e.g. 8 for A-H)</label>
                      <input
                        type="number"
                        min="4"
                        max="16"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.rows}
                        onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Seat Columns (e.g. 12 per row)</label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.cols}
                        onChange={(e) => setFormData({ ...formData, cols: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-cinema px-3">
                    Save Multiplex
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatres;
