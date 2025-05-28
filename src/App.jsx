import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Banner from './pages/banner.jsx';
import PopularMovies from './pages/popularmovies.jsx';
import Favorites from './pages/favorites.jsx';
import MovieDetails from './pages/moviedetails.jsx';
import Footer from './components/footer.jsx';

function App() {
  // Theme state
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme-dark');
    return stored === null ? true : stored === 'true';
  });

  // Movies and search state
  const [movies, setMovies] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  // Genre dropdown and selection state
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isGenreFilter, setIsGenreFilter] = useState(false);

  // Fetch default popular movies
  const fetchPopular = () => {
    fetch(import.meta.env.VITE_TMDB_POPULAR_URL)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results || []);
        setIsSearch(false);
        setIsGenreFilter(false);
        setSelectedGenres([]);
      });
  };

  useEffect(() => {
    fetchPopular();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme-dark', dark);
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);

  // Handle search results from Navbar
  const handleSearch = (results) => {
    setMovies(results);
    setIsSearch(true);
    setIsGenreFilter(false);
    setSelectedGenres([]);
  };

  // Handler for showing popular movies (reset)
  const handleShowPopular = () => {
    fetchPopular();
  };

  // Fetch movies by genres (multi-select)
  useEffect(() => {
    if (selectedGenres.length === 0) {
      setIsGenreFilter(false);
      return;
    }
    setIsSearch(false);
    setIsGenreFilter(true);
    const genreString = selectedGenres.join(',');
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${genreString}`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results || []);
      });
  }, [selectedGenres]);

  return (
    <div className={`min-h-screen ${dark ? 'bg-black' : 'bg-white'} transition-colors duration-800`}>
      <Navbar
        dark={dark}
        toggleTheme={toggleTheme}
        onSearch={handleSearch}
        onShowPopular={handleShowPopular}
        onGenreClick={() => setGenreDropdownOpen((open) => !open)}
        genreDropdownOpen={genreDropdownOpen}
        onCloseGenreDropdown={() => setGenreDropdownOpen(false)}
        selectedGenres={selectedGenres}
        onSelectGenres={setSelectedGenres}
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              {!isSearch && !isGenreFilter && <Banner dark={dark} />}
              <PopularMovies
                movies={movies}
                isSearch={isSearch}
                isGenreFilter={isGenreFilter}
                selectedGenres={selectedGenres}
              />
            </>
          }
        />
        <Route path="/favorites" element={
  <Favorites selectedGenres={selectedGenres} />
} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
      <Footer dark={dark} />
    </div>
  );
}

export default App;