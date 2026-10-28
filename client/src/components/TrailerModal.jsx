import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ movie, onClose }) => {
  if (!movie) return null;

  // Extract YouTube ID from URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1200 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark text-light border border-secondary shadow-lg overflow-hidden">
          <div className="modal-header border-secondary py-2 px-3 d-flex justify-content-between align-items-center">
            <h6 className="modal-title m-0 fw-bold text-truncate" style={{ maxWidth: '85%' }}>
              🎬 {movie.title} — Official Trailer
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-circle p-1 border-0"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body p-0 ratio ratio-16x9 bg-black">
            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
