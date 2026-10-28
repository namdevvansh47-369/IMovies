import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Film, Sparkles, Building, Check } from 'lucide-react';

const TheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        setLoading(true);
        const [theatresRes, citiesRes] = await Promise.all([
          api.get(`/theatres${selectedCity !== 'all' ? `?city=${selectedCity}` : ''}`),
          api.get('/theatres/cities')
        ]);

        if (theatresRes.data?.success) {
          setTheatres(theatresRes.data.theatres || []);
        }
        if (citiesRes.data?.success) {
          setCities(citiesRes.data.cities || []);
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  return (
    <div className="container py-4 my-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
            <Building size={24} className="text-danger" /> Partner Cinemas & Theatres
          </h2>
          <p className="text-secondary small m-0">Experience world-class projection, luxury recliners, and Dolby sound</p>
        </div>

        {/* City Filter Pills */}
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm px-3 rounded-pill ${
              selectedCity === 'all' ? 'btn-danger' : 'btn-dark border border-secondary text-secondary'
            }`}
            onClick={() => setSelectedCity('all')}
          >
            All Cities
          </button>
          {cities.map((c) => (
            <button
              key={c}
              className={`btn btn-sm px-3 rounded-pill ${
                selectedCity === c ? 'btn-danger' : 'btn-dark border border-secondary text-secondary'
              }`}
              onClick={() => setSelectedCity(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading theatres...</span>
          </div>
        </div>
      ) : theatres.length === 0 ? (
        <div className="cinema-card-static p-5 text-center text-secondary">
          <h5>No theatres found in {selectedCity}.</h5>
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((t) => (
            <div key={t._id} className="col-md-6">
              <div className="cinema-card-static p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-white mb-0">{t.name}</h5>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger small">
                      {t.city}
                    </span>
                  </div>

                  <div className="text-secondary small d-flex align-items-center gap-1 mb-3">
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span>{t.address}</span>
                  </div>

                  <div className="mb-3">
                    <div className="text-secondary small mb-1">Screens:</div>
                    <div className="d-flex flex-wrap gap-2">
                      {t.screens?.map((s, idx) => (
                        <span key={idx} className="badge bg-dark border border-secondary text-light small px-2 py-1">
                          {s.name} ({s.displayType || 'IMAX'})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-secondary small mb-1">Amenities:</div>
                    <div className="d-flex flex-wrap gap-1">
                      {t.amenities?.map((a, idx) => (
                        <span key={idx} className="badge bg-black border border-secondary text-secondary" style={{ fontSize: '0.72rem' }}>
                          <Check size={11} className="text-success me-1" /> {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary">
                  <Link
                    to={`/movies`}
                    className="btn btn-sm btn-cinema w-100 rounded-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Film size={15} /> View Showing Movies
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
