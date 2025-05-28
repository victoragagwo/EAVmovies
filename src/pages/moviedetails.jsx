import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '../styles/moviedetails.css';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const DETAIL_URL = 'https://api.themoviedb.org/3/movie/';
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;

function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${DETAIL_URL}${id}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      });
    // Fetch trailer
    fetch(`${DETAIL_URL}${id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = (data.results || []).find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        setTrailerKey(trailer ? trailer.key : null);
      });
  }, [id]);

  if (loading) {
    return <div className="movie-details-loading">Loading...</div>;
  }

  if (!movie || movie.success === false) {
    return <div className="movie-details-error">Movie not found.</div>;
  }

  // Determine where to go back: favorites or home
  const fromFavorites = location.state && location.state.fromFavorites;

  return (
    <div className="movie-details-container">
      <Link
        to={fromFavorites ? "/favorites" : "/"}
        className="movie-details-back"
      >
        ← Back to {fromFavorites ? "Favorites" : "Movies"}
      </Link>
      <div className="movie-details-content">
        <img
          className="movie-details-poster"
          src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : ''}
          alt={movie.title}
        />
        <div className="movie-details-info">
          <h1 className="movie-details-title">{movie.title}</h1>
          <p className="movie-details-overview">{movie.overview}</p>
          <div className="movie-details-meta">
            <span><strong>Release Date:</strong> {movie.release_date}</span>
            <span><strong>Runtime:</strong> {movie.runtime} min</span>
          </div>
          <div className="movie-details-genres">
            <strong>Genres:</strong>{' '}
            {movie.genres && movie.genres.length > 0
              ? movie.genres.map(g => g.name).join(', ')
              : 'N/A'}
          </div>
          {trailerKey && (
            <button
              className="movie-details-trailer-btn"
              onClick={() => setShowTrailer(true)}
              style={{
                marginTop: '1.2rem',
                padding: '0.6rem 1.5rem',
                background: '#E50914',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Play Trailer
            </button>
          )}
          {showTrailer && trailerKey && (
            <div className="movie-details-trailer-modal" style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <div style={{ position: 'relative', width: '90vw', maxWidth: 700 }}>
                <button
                  onClick={() => setShowTrailer(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                  aria-label="Close trailer"
                >
                  ×
                </button>
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ borderRadius: '12px', background: '#000' }}
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;