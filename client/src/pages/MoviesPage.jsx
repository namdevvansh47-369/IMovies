import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import { Filter, Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerMovie, setTrailerMovie] = useState(null);

  // Filters state from searchParams or defaults
  const search = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || 'all';
  const selectedLanguage = searchParams.get('language') || 'all';
  const selectedStatus = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'rating_desc';

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (selectedGenre !== 'all') queryParams.set('genre', selectedGenre);
        if (selectedLanguage !== 'all') queryParams.set('language', selectedLanguage);
        if (selectedStatus !== 'all') queryParams.set('status', selectedStatus);
        if (sort) queryParams.set('sort', sort);

        const res = await api.get(`/movies?${queryParams.toString()}`);
        if (res.data?.success) {
          setMovies(res.data.movies || []);
          if (res.data.allGenres) setGenres(res.data.allGenres);
          if (res.data.allLanguages) setLanguages(res.data.allLanguages);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, selectedStatus, sort]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container py-4 my-2">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0 text-white">Explore All Movies</h2>
          <p className="text-secondary small m-0">Browse now showing movies, advance premieres, and showtimes</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Sorting */}
          <div className="d-flex align-items-center gap-2">
            <span className="small text-secondary text-nowrap">Sort by:</span>
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light rounded-3"
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="rating_desc">Top Rated</option>
              <option value="release_desc">Release Date</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cinema-card-static p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light"
                placeholder="Search by title, director, cast..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light rounded-2"
              value={selectedStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="all">All Releases</option>
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light rounded-2"
              value={selectedGenre}
              onChange={(e) => updateFilter('genre', e.target.value)}
            >
              <option value="all">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-light rounded-2"
              value={selectedLanguage}
              onChange={(e) => updateFilter('language', e.target.value)}
            >
              <option value="all">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="col-6 col-md-2 text-end">
            <button
              className="btn btn-sm btn-outline-secondary w-100 rounded-2 d-flex align-items-center justify-content-center gap-1"
              onClick={clearFilters}
              type="button"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading movies...</span>
          </div>
        </div>
      ) : movies.length === 0 ? (
        <div className="p-5 text-center text-secondary cinema-card-static my-4">
          <h5>No movies found matching your filters.</h5>
          <p className="small text-muted mb-3">Try adjusting your search criteria or clearing filters.</p>
          <button className="btn btn-sm btn-cinema" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 text-secondary small">
            Showing <strong className="text-light">{movies.length}</strong> movies
          </div>
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard
                  movie={movie}
                  onWatchTrailer={(m) => setTrailerMovie(m)}
                />
              </div>
            ))}
          </div>
        </>
      )}

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

export default MoviesPage;
