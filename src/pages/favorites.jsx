import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/popularmovies.css';
import '../styles/favorites.css';

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
const GENRE_URL = import.meta.env.VITE_TMDB_GENRE_URL;

function Favorites({ selectedGenres = [] }) {
  const [favorites, setFavorites] = useState([]);
  const [genreNames, setGenreNames] = useState({});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    setFavorites(stored ? JSON.parse(stored) : []);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 20);
      setLoadingMore(false);
    }, 400); // Simulate loading
  };

  // Fetch genre names for mapping IDs to names
  useEffect(() => {
    fetch(GENRE_URL)
      .then(res => res.json())
      .then(data => {
        const map = {};
        (data.genres || []).forEach(g => { map[g.id] = g.name; });
        setGenreNames(map);
      });
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '' }), 1800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Remove a movie from favorites
  const removeFavorite = (id) => {
    const updated = favorites.filter(movie => movie.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setToast({ show: true, message: 'Removed from favorites' });
  };

  // Filter favorites by selected genres if any
  let filteredFavorites = favorites;
  if (selectedGenres.length > 0) {
    filteredFavorites = filteredFavorites.filter(movie =>
      movie.genre_ids &&
      movie.genre_ids.some(id => selectedGenres.includes(id))
    );
  }
  // Filter by search input (case-insensitive, matches title)
  if (search.trim()) {
    filteredFavorites = filteredFavorites.filter(movie =>
      movie.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  if (filteredFavorites.length === 0) {
    return (
      <div className="popular-movies-container" id="favorites-section">
        {toast.show && (
         <div className="favorites-toast">
            {toast.message}
          </div>
        )}
        <h2 className="popular-movies-title">Favorites</h2>
        <input
          type="text"
          placeholder="Search favorites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="favorites-search-input"
        />
        <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
          {favorites.length === 0
            ? 'No favorites yet.'
            : 'No favorites match your search or selected genres.'}
        </p>
      </div>
    );
  }

  return (
    <div className="popular-movies-container" id="favorites-section">
       {toast.show && (
          <div className="favorites-toast">
            {toast.message}
          </div>
        )}
      <h2 className="popular-movies-title">Favorites</h2>
      <input
        type="text"
        placeholder="Search favorites..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="favorites-search-input"
      />
      <div className="popular-movies-grid">
        {filteredFavorites.slice(0, visibleCount).map((movie, idx) => (
          <div key={movie.id} style={{ position: 'relative' }}>
            <Link to={`/movie/${movie.id}`} state={{ fromFavorites: true }}>
              <div
                className="movie-card animated-fade-in"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                <img
                  className="movie-poster"
                  src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : ''}
                  alt={movie.title}
                />
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-release">Release: {movie.release_date}</p>
                  <p className="movie-vote">⭐ {movie.vote_average}</p>
                  {movie.genre_ids && (
                    <p className="movie-genres">
                      {movie.genre_ids
                        .map(id => genreNames[id])
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </Link>
            <button
              className="favorite-btn"
              onClick={() => removeFavorite(movie.id)}
              aria-label="Remove from favorites"
              title="Remove from favorites"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
      {/* Load More Button for Favorites */}
      {filteredFavorites.length > visibleCount && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              padding: '0.7rem 2rem',
              borderRadius: '999px',
              border: 'none',
              background: loadingMore ? '#888' : '#E50914',
              color: '#fff',
              fontWeight: 'bold',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem'
            }}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      {/* Loader for when all favorites are loaded */}
      {filteredFavorites.length > 0 && filteredFavorites.length <= visibleCount && (
        <div style={{ height: 40, textAlign: 'center', margin: '2rem 0', color: '#888' }}>
          No more movies to load.
        </div>
      )}
    </div>
  );
}

export default Favorites;