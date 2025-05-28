// ...existing imports...
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/popularmovies.css';

const POPULAR_URL = import.meta.env.VITE_TMDB_POPULAR_URL;
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
const GENRE_URL = import.meta.env.VITE_TMDB_GENRE_URL;

function PopularMovies({ movies: propMovies, isSearch, isGenreFilter, selectedGenres }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genreNames, setGenreNames] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loadingMore, setLoadingMore] = useState(false);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '' }), 1800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Fetch movies for the current page (only for popular, not search or genre filter)
  useEffect(() => {
    if (!isSearch && !isGenreFilter) {
      setLoadingMore(true);
      fetch(`${POPULAR_URL.replace(/page=\d+/, `page=${page}`)}`)
        .then(res => res.json())
        .then(data => {
          setMovies(prev => page === 1 ? (data.results || []) : [...prev, ...(data.results || [])]);
          setTotalPages(data.total_pages || 1);
          setLoadingMore(false);
        });
    }
  }, [page, isSearch, isGenreFilter]);

  // For search: handle pagination if results > 20
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  useEffect(() => {
    if (isSearch) {
      setSearchResults(Array.isArray(propMovies) ? propMovies.slice(0, 20) : []);
      setSearchPage(1);
      setSearchTotalPages(Math.ceil((propMovies?.length || 0) / 20));
      setMovies(Array.isArray(propMovies) ? propMovies.slice(0, 20) : []);
      setPage(1);
      setTotalPages(1);
    }
  }, [propMovies, isSearch]);

  // Load more for search results
  const handleSearchLoadMore = () => {
    if (searchPage < searchTotalPages && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        const nextPage = searchPage + 1;
        const nextResults = propMovies.slice(0, nextPage * 20);
        setSearchResults(nextResults);
        setMovies(nextResults);
        setSearchPage(nextPage);
        setLoadingMore(false);
      }, 400); // Simulate loading
    }
  };

  // When filtering by genre, use propMovies and reset to page 1
  useEffect(() => {
    if (isGenreFilter) {
      setMovies(Array.isArray(propMovies) ? propMovies : []);
      setPage(1);
      setTotalPages(1);
    }
  }, [propMovies, isGenreFilter]);

  // Show/hide back to top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle favorite with toast
  const toggleFavorite = (movie) => {
    setFavorites((prev) => {
      if (prev.some(fav => fav.id === movie.id)) {
        setToast({ show: true, message: 'Removed from favorites' });
        return prev.filter(fav => fav.id !== movie.id);
      } else {
        setToast({ show: true, message: 'Added to favorites' });
        return [...prev, movie];
      }
    });
  };

  // Get genre names for display
  const selectedGenreNames = selectedGenres
    .map(id => genreNames[id])
    .filter(Boolean)
    .join(', ');

  // Load more handler for popular movies
  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="popular-movies-container" id="popular-movies-section">
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#222',
            color: '#fff',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            zIndex: 9999,
            fontWeight: 'bold',
            fontSize: '1rem',
            letterSpacing: '0.5px',
            transition: 'opacity 0.3s'
          }}
        >
          {toast.message}
        </div>
      )}
      <h2 className="popular-movies-title">
        {isSearch
          ? 'Results'
          : isGenreFilter
            ? selectedGenreNames
              ? `Movies by Genre: ${selectedGenreNames}`
              : 'Movies by Genre'
            : 'Popular Movies'}
      </h2>
      <div className="popular-movies-grid">
        {movies.map((movie, idx) => (
          <div key={movie.id} style={{ position: 'relative' }}>
            <Link to={`/movie/${movie.id}`}>
              <div
                className="movie-card animated-fade-in"
                style={{
                  animationDelay: `${idx * 0.07}s`
                }}
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
                </div>
              </div>
            </Link>
            <button
              className="favorite-btn"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.7rem',
                color: favorites.some(fav => fav.id === movie.id) ? '#E50914' : '#fff',
                textShadow: '0 0 5px #000'
              }}
              onClick={() => toggleFavorite(movie)}
              aria-label={favorites.some(fav => fav.id === movie.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorites.some(fav => fav.id === movie.id) ? '♥' : '♡'}
            </button>
          </div>
        ))}
      </div>
      {/* Load More Button for Popular Movies */}
      {!isSearch && !isGenreFilter && page < totalPages && (
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
      {/* Load More Button for Search Results */}
      {isSearch && searchResults.length < (propMovies?.length || 0) && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
          <button
            onClick={handleSearchLoadMore}
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
      {/* Loader for when all movies are loaded */}
      {!isSearch && !isGenreFilter && page >= totalPages && (
        <div style={{ height: 40, textAlign: 'center', margin: '2rem 0', color: '#888' }}>
          No more movies to load.
        </div>
      )}
      {isSearch && searchResults.length >= (propMovies?.length || 0) && (
        <div style={{ height: 40, textAlign: 'center', margin: '2rem 0', color: '#888' }}>
          No more movies to load.
        </div>
      )}
      {showBackToTop && (
        <button
          className="back-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default PopularMovies;