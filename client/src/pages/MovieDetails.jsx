import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import TrailerModal from '../components/TrailerModal';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Film,
  MapPin,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  // Generate next 4 dates
  const availableDates = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dateObj: d,
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      dateString: d.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/movies/${id}`);
        if (res.data?.success) {
          setMovie(res.data.movie);
          setShows(res.data.shows || []);
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading movie details...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h4>Movie Not Found</h4>
        <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
      </div>
    );
  }

  // Filter shows by selected date
  const selectedDate = availableDates[selectedDateIndex].dateString;
  const filteredShows = shows.filter((s) => {
    const showDate = new Date(s.showDateTime).toISOString().split('T')[0];
    return showDate === selectedDate;
  });

  // Group shows by Theatre
  const showsByTheatre = {};
  filteredShows.forEach((s) => {
    const theatreId = s.theatre?._id || 'unknown';
    if (!showsByTheatre[theatreId]) {
      showsByTheatre[theatreId] = {
        theatre: s.theatre,
        showsList: []
      };
    }
    showsByTheatre[theatreId].showsList.push(s);
  });

  return (
    <div>
      {/* Movie Hero Banner */}
      <div
        className="hero-backdrop position-relative d-flex align-items-end pb-4"
        style={{
          backgroundImage: `url(${movie.banner})`,
          minHeight: '440px'
        }}
      >
        <div className="hero-gradient"></div>

        <div className="container position-relative z-1">
          <div className="row g-4 align-items-end">
            {/* Poster */}
            <div className="col-md-3 col-sm-4 d-none d-sm-block">
              <div className="cinema-card shadow-lg overflow-hidden border-2 border-danger">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-100 object-fit-cover"
                  style={{ height: '360px' }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="col-md-9 col-sm-8 text-light">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-uppercase fw-bold px-2 py-1 small">
                  {movie.certificate || 'UA'}
                </span>
                <span className="badge-rating px-2 py-1 rounded small d-flex align-items-center gap-1">
                  <Star size={13} fill="#fbbf24" stroke="none" /> {movie.rating?.toFixed(1) || '8.5'} / 10
                  <span className="text-secondary ms-1">({movie.votesCount?.toLocaleString()} votes)</span>
                </span>
                <span className="badge bg-dark border border-secondary text-secondary small d-flex align-items-center gap-1">
                  <Clock size={12} /> {movie.duration} mins
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre &&
                  movie.genre.map((g, idx) => (
                    <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary text-light px-3 py-1">
                      {g}
                    </span>
                  ))}
                <span className="badge bg-secondary bg-opacity-25 border border-secondary text-info px-3 py-1">
                  {movie.language ? movie.language.join(', ') : 'English'}
                </span>
              </div>

              <p className="text-light text-opacity-80 small mb-3" style={{ maxWidth: '750px', lineHeight: '1.6' }}>
                {movie.description}
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <button
                  className="btn btn-outline-light btn-sm px-3 py-2 d-flex align-items-center gap-2 rounded-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <Play size={16} fill="white" /> Watch Official Trailer
                </button>

                <div className="text-secondary small">
                  <strong>Director:</strong> {movie.director}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container my-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary">
          <div>
            <h3 className="fw-bold m-0 text-white d-flex align-items-center gap-2">
              <Calendar size={22} className="text-danger" /> Select Date & Showtimes
            </h3>
            <p className="text-secondary small m-0">Live seat layout unlocks instantly on showtime selection</p>
          </div>

          {/* Date Selector Pills */}
          <div className="d-flex gap-2 overflow-x-auto pb-2">
            {availableDates.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className={`btn btn-sm px-3 py-2 rounded-3 text-center transition-all ${
                  selectedDateIndex === idx
                    ? 'btn-danger shadow'
                    : 'btn-dark border border-secondary text-secondary'
                }`}
                onClick={() => setSelectedDateIndex(idx)}
              >
                <div className="fw-bold" style={{ fontSize: '0.82rem' }}>{item.dayName}</div>
                <div style={{ fontSize: '0.72rem' }}>{item.dateFormatted}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theatre Grouped Shows */}
        {Object.keys(showsByTheatre).length === 0 ? (
          <div className="cinema-card-static p-5 text-center text-secondary my-4">
            <h5>No shows scheduled for {availableDates[selectedDateIndex].dayName} ({availableDates[selectedDateIndex].dateFormatted}).</h5>
            <p className="small text-muted">Try selecting a different date or exploring other movies.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {Object.values(showsByTheatre).map(({ theatre, showsList }) => (
              <div key={theatre._id} className="cinema-card-static p-4">
                <div className="row align-items-center mb-3 pb-3 border-bottom border-secondary">
                  <div className="col-lg-6">
                    <h5 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                      <Film size={18} className="text-danger" /> {theatre.name}
                    </h5>
                    <div className="text-secondary small d-flex align-items-center gap-1">
                      <MapPin size={13} className="text-danger" />
                      <span>{theatre.location}, {theatre.city}</span>
                    </div>
                  </div>

                  <div className="col-lg-6 mt-2 mt-lg-0 text-lg-end">
                    <div className="d-flex flex-wrap gap-1 justify-content-lg-end">
                      {theatre.amenities &&
                        theatre.amenities.map((a, i) => (
                          <span key={i} className="badge bg-black border border-secondary text-secondary" style={{ fontSize: '0.7rem' }}>
                            {a}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Showtime Chips */}
                <div className="d-flex flex-wrap gap-3">
                  {showsList.map((show) => {
                    const timeStr = new Date(show.showDateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <button
                        key={show._id}
                        type="button"
                        className="btn btn-dark border border-secondary p-3 text-start rounded-3 cinema-card transition-all"
                        style={{ minWidth: '150px' }}
                        onClick={() => navigate(`/seat-selection/${show._id}`)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold fs-6 text-white">{timeStr}</span>
                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger small px-2 py-0">
                            {show.format || 'IMAX 3D'}
                          </span>
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                          {show.screenName}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary text-light" style={{ fontSize: '0.72rem' }}>
                          <span className="text-success">{show.availableSeatsCount} seats left</span>
                          <span className="fw-semibold">₹{show.priceTiers?.silver || 200}+</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          movie={movie}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default MovieDetails;
