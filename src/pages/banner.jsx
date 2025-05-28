import React, { useEffect, useState } from 'react';
import '../styles/banner.css';

// Import the API endpoint from .env
const BANNER_URL = import.meta.env.VITE_TMDB_POPULAR_URL;

function Banner({ dark }) {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  useEffect(() => {
    // Fetch popular movies and limit to 7 results with a backdrop image
    fetch(BANNER_URL)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.results || []).filter(m => m.backdrop_path).slice(0, 7);
        setMovies(filtered);
      });
  }, []);

  // Fetch trailer when the current movie changes
  useEffect(() => {
    if (!movies.length) return;
    const movie = movies[current];
    if (!movie) return;
    setLoadingTrailer(true);
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const trailer = (data.results || []).find(
          vid => vid.site === 'YouTube' && vid.type === 'Trailer'
        );
        setTrailerKey(trailer ? trailer.key : null);
        setLoadingTrailer(false);
      })
      .catch(() => {
        setTrailerKey(null);
        setLoadingTrailer(false);
      });
  }, [movies, current]);

  // Slideshow effect
  useEffect(() => {
    if (movies.length === 0 || showTrailer) return; // Stop transition if trailer is playing
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % movies.length);
      setShowTrailer(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [movies, showTrailer]);

  if (!movies.length) return <div className={dark ? 'text-white' : 'text-black'}>Loading...</div>;

  const movie = movies[current];

  return (
    <div className={`banner ${dark ? 'banner-dark' : 'banner-light'}`}>
      <div
        className="banner-slide"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : undefined,
        }}
      >
        <div className="banner-overlay">
          <h2 className="banner-title">{movie.title}</h2>
          <p className="banner-overview">{movie.overview}</p>
          <button
            className="banner-trailer-btn"
            onClick={() => setShowTrailer((prev) => !prev)}
            type="button"
            disabled={loadingTrailer || !trailerKey}
            style={{
              opacity: loadingTrailer ? 0.7 : 1,
              cursor: loadingTrailer || !trailerKey ? 'not-allowed' : 'pointer'
            }}
          >
            {loadingTrailer
              ? "Loading Trailer..."
              : showTrailer
                ? "Hide Trailer"
                : trailerKey
                  ? "Play Trailer"
                  : "No Trailer"}
          </button>
          {showTrailer && trailerKey && (
            <div className="banner-trailer-modal">
              <button
                className="banner-trailer-close"
                onClick={() => setShowTrailer(false)}
                aria-label="Close trailer"
              >
                &times;
              </button>
              <div className="banner-trailer-content" style={{ width: '90vw', maxWidth: 700 }}>
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ borderRadius: '12px', background: '#000', width: '100%', height: '40vw', maxHeight: 400, minHeight: 200 }}
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="banner-dots">
        {movies.map((_, idx) => (
          <span
            key={idx}
            className={`banner-dot${idx === current ? ' active' : ''}`}
            onClick={() => { setCurrent(idx); setShowTrailer(false); }}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;