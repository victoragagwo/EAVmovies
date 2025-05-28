import React, { useEffect, useState } from 'react';
import '../styles/genres.css';

const GENRE_URL = import.meta.env.VITE_TMDB_GENRE_URL;

function Genres({ onSelectGenres, selectedGenres, show, onClose }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch(GENRE_URL)
      .then(res => res.json())
      .then(data => setGenres(data.genres || []));
  }, []);

  if (!show) return null;

  const handleGenreClick = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      onSelectGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      onSelectGenres([...selectedGenres, genreId]);
    }
  };

  const handleClear = () => {
    onSelectGenres([]);
  };

  return (
    <div className="genre-dropdown">
      <div className="genre-dropdown-header">
        <span>Filter by Genre</span>
        <button onClick={onClose} className="genre-close-btn">×</button>
      </div>
      <ul>
        <li
          className={selectedGenres.length === 0 ? 'selected' : ''}
          onClick={handleClear}
        >
          All Genres
        </li>
        {genres.map(genre => (
          <li
            key={genre.id}
            className={selectedGenres.includes(genre.id) ? 'selected' : ''}
            onClick={() => handleGenreClick(genre.id)}
          >
            {genre.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Genres;