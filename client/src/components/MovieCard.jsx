import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Clock, Film } from 'lucide-react';

const MovieCard = ({ movie, onWatchTrailer }) => {
  return (
    <div className="cinema-card h-100 d-flex flex-column position-relative">
      {/* Poster Image Container */}
      <div className="position-relative overflow-hidden" style={{ paddingTop: '145%' }}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Certificate Badge */}
        <span className="position-absolute top-2 start-2 badge bg-black bg-opacity-75 border border-secondary text-light px-2 py-1 small fw-semibold" style={{ top: 10, left: 10 }}>
          {movie.certificate || 'UA'}
        </span>

        {/* Rating Badge */}
        <span className="position-absolute top-2 end-2 badge-rating px-2 py-1 rounded small d-flex align-items-center gap-1 shadow-sm" style={{ top: 10, right: 10 }}>
          <Star size={12} fill="#fbbf24" stroke="none" />
          {movie.rating ? movie.rating.toFixed(1) : '8.5'}
        </span>

        {/* Trailer Overlay Button on Hover */}
        {onWatchTrailer && (
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle position-absolute top-50 start-50 translate-middle shadow-lg p-2 opacity-90 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44 }}
            onClick={(e) => {
              e.preventDefault();
              onWatchTrailer(movie);
            }}
            title="Watch Trailer"
          >
            <Play size={20} fill="#e50914" className="text-danger ms-1" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <h6 className="fw-bold text-truncate mb-1 text-light" title={movie.title}>
          {movie.title}
        </h6>

        {/* Duration & Language */}
        <div className="d-flex align-items-center gap-2 text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
          <span className="d-flex align-items-center gap-1">
            <Clock size={12} /> {movie.duration}m
          </span>
          <span>•</span>
          <span className="text-truncate">{movie.language ? movie.language.join(', ') : 'English'}</span>
        </div>

        {/* Genres */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {movie.genre &&
            movie.genre.slice(0, 2).map((g, idx) => (
              <span key={idx} className="badge badge-tag px-2 py-1">
                {g}
              </span>
            ))}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-2">
          {movie.status === 'coming_soon' ? (
            <button className="btn btn-sm btn-outline-secondary w-100 rounded-2 fw-semibold" disabled>
              Coming Soon
            </button>
          ) : (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-sm btn-cinema w-100 rounded-2 text-center text-decoration-none d-flex align-items-center justify-content-center gap-1"
            >
              <Film size={14} /> Book Tickets
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
