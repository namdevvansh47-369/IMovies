import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import { Film, Play, Star, Sparkles, Shield, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('now_showing');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, moviesRes] = await Promise.all([
          api.get('/movies/featured'),
          api.get('/movies?limit=8')
        ]);

        if (featuredRes.data?.success) {
          setFeaturedMovies(featuredRes.data.movies || []);
        }
        if (moviesRes.data?.success) {
          setMovies(moviesRes.data.movies || []);
        }
      } catch (err) {
        console.error('Failed to load home movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto carousel rotation
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentHero = featuredMovies[activeHeroIndex];
  const filteredMovies = movies.filter((m) => m.status === activeTab);

  return (
    <div>
      {/* Hero Showcase Carousel */}
      {currentHero && (
        <div
          className="hero-backdrop d-flex align-items-center"
          style={{ backgroundImage: `url(${currentHero.banner})` }}
        >
          <div className="hero-gradient"></div>
          <div className="container position-relative z-1 py-5">
            <div className="row align-items-center">
              <div className="col-lg-7 text-light">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-danger text-uppercase fw-bold px-2 py-1 small">
                    Featured Premiere
                  </span>
                  <span className="badge-rating px-2 py-1 rounded small d-flex align-items-center gap-1">
                    <Star size={13} fill="#fbbf24" stroke="none" /> {currentHero.rating} Rating
                  </span>
                  <span className="badge bg-secondary bg-opacity-50 small">
                    {currentHero.certificate || 'UA'}
                  </span>
                </div>

                <h1 className="display-4 fw-extrabold mb-3 text-white">
                  {currentHero.title}
                </h1>

                <p className="lead text-light text-opacity-90 mb-4 pe-lg-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {currentHero.description}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3">
                  <Link
                    to={`/movies/${currentHero._id}`}
                    className="btn btn-cinema btn-lg px-4 py-2 d-flex align-items-center gap-2"
                  >
                    <Film size={18} /> Book Tickets Now
                  </Link>

                  <button
                    className="btn btn-outline-light btn-lg px-4 py-2 d-flex align-items-center gap-2"
                    onClick={() => setTrailerMovie(currentHero)}
                  >
                    <Play size={18} fill="white" /> Watch Trailer
                  </button>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="col-12 mt-4 pt-4 d-flex gap-2">
                {featuredMovies.map((m, idx) => (
                  <button
                    key={m._id}
                    className={`btn p-0 rounded-pill transition-all ${
                      idx === activeHeroIndex ? 'bg-danger' : 'bg-secondary'
                    }`}
                    style={{
                      width: idx === activeHeroIndex ? 32 : 12,
                      height: 6,
                      border: 'none'
                    }}
                    onClick={() => setActiveHeroIndex(idx)}
                    title={m.title}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="container my-5">
        {/* Section Heading & Filter Tabs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
              <Sparkles size={24} className="text-danger" /> Cinema Releases
            </h2>
            <p className="text-secondary small m-0">Explore trending blockbusters and reserve your seats live</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group p-1 bg-black rounded-3 border border-secondary" role="group">
              <button
                type="button"
                className={`btn btn-sm rounded-2 fw-semibold px-3 ${
                  activeTab === 'now_showing' ? 'btn-danger' : 'btn-dark text-secondary'
                }`}
                onClick={() => setActiveTab('now_showing')}
              >
                Now Showing
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-2 fw-semibold px-3 ${
                  activeTab === 'coming_soon' ? 'btn-danger' : 'btn-dark text-secondary'
                }`}
                onClick={() => setActiveTab('coming_soon')}
              >
                Coming Soon
              </button>
            </div>

            <Link to="/movies" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading movies...</span>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-5 text-center text-secondary cinema-card-static">
            <h5>No movies found in this category.</h5>
          </div>
        ) : (
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard
                  movie={movie}
                  onWatchTrailer={(m) => setTrailerMovie(m)}
                />
              </div>
            ))}
          </div>
        )}

        {/* VIP Experiences Highlights */}
        <div className="my-5 pt-4">
          <h3 className="fw-bold text-center text-white mb-2">Unrivaled Cinema Tech & Comfort</h3>
          <p className="text-center text-secondary small mb-5">Built for purists who demand crystal-clear sound and visuals</p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="cinema-card-static p-4 h-100 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-inline-flex mb-3 text-danger">
                  <Film size={28} />
                </div>
                <h5 className="fw-bold text-white mb-2">IMAX with Laser 4K</h5>
                <p className="small text-secondary m-0">
                  Dual 4K laser projection engine delivers unprecedented brightness, contrast, and vivid color spectrums.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="cinema-card-static p-4 h-100 text-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-flex mb-3 text-warning">
                  <Award size={28} />
                </div>
                <h5 className="fw-bold text-white mb-2">Dolby Atmos Surround</h5>
                <p className="small text-secondary m-0">
                  Multi-dimensional spatial sound that flows completely around you with breathtaking realism.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="cinema-card-static p-4 h-100 text-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 d-inline-flex mb-3 text-info">
                  <Shield size={28} />
                </div>
                <h5 className="fw-bold text-white mb-2">Real-Time Seat Booking</h5>
                <p className="small text-secondary m-0">
                  Instant live seat synchronization prevents double bookings, accompanied by verified QR entry tickets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}
    </div>
  );
};

export default Home;
