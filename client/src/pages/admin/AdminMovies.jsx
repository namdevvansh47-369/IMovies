import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Film, Plus, Edit2, Trash2, Star, Clock } from 'lucide-react';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    poster: '',
    banner: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    language: 'English, Hindi',
    duration: 140,
    rating: 8.5,
    certificate: 'UA',
    director: '',
    status: 'now_showing',
    isFeatured: false,
    releaseDate: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies?limit=100');
      if (res.data?.success) {
        setMovies(res.data.movies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setEditingMovie(m);
    setFormData({
      title: m.title,
      description: m.description,
      poster: m.poster,
      banner: m.banner,
      trailerUrl: m.trailerUrl || '',
      genre: m.genre ? m.genre.join(', ') : '',
      language: m.language ? m.language.join(', ') : '',
      duration: m.duration || 120,
      rating: m.rating || 8.0,
      certificate: m.certificate || 'UA',
      director: m.director || '',
      status: m.status || 'now_showing',
      isFeatured: !!m.isFeatured,
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie and all associated shows?')) {
      try {
        await api.delete(`/movies/${id}`);
        setMovies(movies.filter((m) => m._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete movie');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: formData.language.split(',').map((s) => s.trim()).filter(Boolean),
        duration: Number(formData.duration),
        rating: Number(formData.rating)
      };

      if (editingMovie) {
        const res = await api.put(`/movies/${editingMovie._id}`, payload);
        if (res.data?.success) {
          setMovies(movies.map((m) => (m._id === editingMovie._id ? res.data.movie : m)));
        }
      } else {
        const res = await api.post('/movies', payload);
        if (res.data?.success) {
          setMovies([res.data.movie, ...movies]);
        }
      }

      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving movie');
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Film size={24} className="text-danger" /> Manage Cinema Catalog
          </h2>
          <p className="text-secondary small m-0">Add new movies, configure posters, trailers, and status</p>
        </div>
        <button className="btn btn-cinema d-flex align-items-center gap-1 rounded-2" onClick={openAddModal}>
          <Plus size={16} /> Add New Movie
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
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="rounded object-fit-cover shadow"
                          style={{ width: '42px', height: '60px' }}
                        />
                        <div>
                          <div className="fw-bold text-white fs-6">{m.title}</div>
                          <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                            {m.certificate} • {m.language?.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.genre?.map((g, idx) => (
                          <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary text-light">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1 text-secondary">
                        <Clock size={13} /> {m.duration}m
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-rating d-inline-flex align-items-center gap-1">
                        <Star size={11} fill="#fbbf24" stroke="none" /> {m.rating}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === 'now_showing'
                            ? 'bg-success bg-opacity-25 text-success border border-success'
                            : 'bg-warning bg-opacity-25 text-warning border border-warning'
                        }`}
                      >
                        {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-light me-2 rounded-2"
                        onClick={() => openEditModal(m)}
                        title="Edit Movie"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-2"
                        onClick={() => handleDelete(m._id)}
                        title="Delete Movie"
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

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
              <div className="modal-header border-secondary py-2">
                <h5 className="modal-title fw-bold">
                  {editingMovie ? 'Edit Movie' : 'Add New Movie to Catalog'}
                </h5>
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
                      <label className="form-label small text-secondary mb-1">Movie Title</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary mb-1">Certificate</label>
                      <select
                        className="form-select bg-dark border-secondary text-light"
                        value={formData.certificate}
                        onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      >
                        <option value="U">U (Universal)</option>
                        <option value="UA">UA (Parental Guidance)</option>
                        <option value="A">A (Adults Only)</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary mb-1">Synopsis / Description</label>
                      <textarea
                        className="form-control bg-dark border-secondary text-light"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Poster Image URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.poster}
                        onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                        required
                        placeholder="https://..."
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Hero Banner URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.banner}
                        onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                        required
                        placeholder="https://..."
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">YouTube Trailer URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.trailerUrl}
                        onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Director Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.director}
                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Genres (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        placeholder="Action, Sci-Fi, Drama"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary mb-1">Languages (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        placeholder="English, Hindi"
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary mb-1">Duration (mins)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary mb-1">Rating (1-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control bg-dark border-secondary text-light"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary mb-1">Release Status</label>
                      <select
                        className="form-select bg-dark border-secondary text-light"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary mb-1">Featured Premiere</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        />
                        <label className="form-check-label small text-secondary">Hero Slider</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-cinema px-3">
                    {editingMovie ? 'Update Movie' : 'Save Movie'}
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

export default AdminMovies;
