import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Trash2, Film, Clock, DollarSign } from 'lucide-react';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const initialForm = {
    movie: '',
    theatre: '',
    screenName: 'Audi 1',
    showDateTime: '',
    format: 'IMAX 3D',
    language: 'English',
    silverPrice: 200,
    goldPrice: 320,
    platinumPrice: 480,
    rows: 8,
    cols: 12
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies?limit=50'),
        api.get('/theatres')
      ]);

      if (showsRes.data?.success) setShows(showsRes.data.shows || []);
      if (moviesRes.data?.success) setMovies(moviesRes.data.movies || []);
      if (theatresRes.data?.success) {
        setTheatres(theatresRes.data.theatres || []);
        if (theatresRes.data.theatres?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            theatre: theatresRes.data.theatres[0]._id
          }));
        }
      }
      if (moviesRes.data?.movies?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          movie: moviesRes.data.movies[0]._id
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Cancel and delete this show schedule?')) {
      try {
        await api.delete(`/shows/${id}`);
        setShows(shows.filter((s) => s._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete show');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movie: formData.movie,
        theatre: formData.theatre,
        screenName: formData.screenName,
        showDateTime: new Date(formData.showDateTime),
        format: formData.format,
        language: formData.language,
        priceTiers: {
          silver: Number(formData.silverPrice),
          gold: Number(formData.goldPrice),
          platinum: Number(formData.platinumPrice)
        },
        rows: Number(formData.rows),
        cols: Number(formData.cols)
      };

      const res = await api.post('/shows', payload);
      if (res.data?.success) {
        setShows([res.data.show, ...shows]);
        setShowModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling show');
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Calendar size={24} className="text-danger" /> Show Scheduling & Pricing
          </h2>
          <p className="text-secondary small m-0">Schedule movie showtimes across multiplex auditoriums with custom seat pricing</p>
        </div>
        <button className="btn btn-cinema d-flex align-items-center gap-1 rounded-2" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Schedule Show
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
                  <th>Movie</th>
                  <th>Theatre & Screen</th>
                  <th>Date & Time</th>
                  <th>Format</th>
                  <th>Pricing Tiers</th>
                  <th>Availability</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="fw-bold text-white fs-6">{s.movie?.title}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {s.language}
                      </div>
                    </td>
                    <td>
                      <div className="text-light">{s.theatre?.name}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        {s.screenName} • {s.theatre?.city}
                      </div>
                    </td>
                    <td>
                      <div className="text-light fw-semibold">
                        {new Date(s.showDateTime).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {new Date(s.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                        {s.format || 'IMAX 3D'}
                      </span>
                    </td>
                    <td>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        Silver: ₹{s.priceTiers?.silver} | Gold: ₹{s.priceTiers?.gold} | Plat: ₹{s.priceTiers?.platinum}
                      </div>
                    </td>
                    <td>
                      <span className="text-success fw-bold">
                        {s.availableSeatsCount}
                      </span>
                      <span className="text-secondary"> / {s.totalSeats} seats</span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger rounded-2"
                        onClick={() => handleDelete(s._id)}
                        title="Delete Show"
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

      {/* Schedule Show Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fw-bold">Schedule New Movie Showtime</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Select Movie</label>
                      <select
                        className="form-select bg-dark border-secondary text-light"
                        value={formData.movie}
                        onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                        required
                      >
                        {movies.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.title} ({m.certificate})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Select Cinema / Multiplex</label>
                      <select
                        className="form-select bg-dark border-secondary text-light"
                        value={formData.theatre}
                        onChange={(e) => setFormData({ ...formData, theatre: e.target.value })}
                        required
                      >
                        {theatres.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Screen / Audi Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.screenName}
                        onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Projection Format</label>
                      <select
                        className="form-select bg-dark border-secondary text-light"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      >
                        <option value="IMAX 3D">IMAX 3D</option>
                        <option value="IMAX 2D">IMAX 2D</option>
                        <option value="3D">3D</option>
                        <option value="2D">2D</option>
                        <option value="4DX">4DX</option>
                        <option value="Dolby Cinema">Dolby Cinema</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Audio Language</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary mb-1">Date and Showtime</label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.showDateTime}
                        onChange={(e) => setFormData({ ...formData, showDateTime: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 pt-2 border-top border-secondary">
                      <h6 className="fw-bold text-warning mb-2">Ticket Pricing Tiers (₹)</h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Silver (Front)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.silverPrice}
                        onChange={(e) => setFormData({ ...formData, silverPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Gold (Middle)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.goldPrice}
                        onChange={(e) => setFormData({ ...formData, goldPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Platinum (Recliner)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.platinumPrice}
                        onChange={(e) => setFormData({ ...formData, platinumPrice: e.target.value })}
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
                    Schedule Show
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

export default AdminShows;
