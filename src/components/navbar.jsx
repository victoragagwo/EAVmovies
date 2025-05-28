import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo1 from '../assets/logo1.jpg';
import logo2 from '../assets/logo2.jpg';
import Genres from '../pages/genres.jsx';
import '../styles/navbar.css';

const Navbar = ({
  dark,
  toggleTheme,
  onSearch,
  onShowPopular,
  onGenreClick,
  genreDropdownOpen,
  onCloseGenreDropdown,
  selectedGenres,
  onSelectGenres
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Hamburger menu state
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Use the correct search URL from .env
  const SEARCH_URL = import.meta.env.VITE_TMDB_SEARCH_URL;

  // Fetch suggestions as user types
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const endpoint = `${SEARCH_URL}${encodeURIComponent(value)}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setSuggestions((data.results || []).slice(0, 6));
      setShowDropdown(true);
    } catch (err) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle search submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const endpoint = `${SEARCH_URL}${encodeURIComponent(search)}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (onSearch) {
        onSearch(data.results || []);
      }
      setShowDropdown(false);
      setMenuOpen(false); // Close menu on search
      navigate('/'); // <-- Always go to main page to show results
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (title) => {
    setSearch(title);
    setShowDropdown(false);
    // Optionally trigger search immediately:
    // handleSearch({ preventDefault: () => {} });
  };

  // Hide dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to section by id
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Hamburger menu toggle
  const handleHamburger = () => setMenuOpen((open) => !open);

  return (
    <nav className={`flex items-center justify-between px-6 py-3 shadow-md transition-colors duration-800 ${dark ? 'bg-black' : 'bg-white'}`}>
      {/* Left: Logo and Hamburger */}
      <div className="flex items-center space-x-10">
         <img
          src={dark ? logo1 : logo2}
          alt="Logo"
          className="h-20 w-auto cursor-pointer"
          onClick={() => {
            if (onShowPopular) onShowPopular();
            navigate('/');
          }}
        />
        {/* Hamburger Icon (tablet and below) */}
        <button
          className="navbar-hamburger md:hidden ml-4"
          aria-label="Open menu"
          onClick={handleHamburger}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: 0,
            marginLeft: '1rem'
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke={dark ? "#fff" : "#222"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="7" x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="navbar-desktop-menu hidden md:flex items-center space-x-8" style={{ position: 'relative' }}>
        <Link
          to="/"
          className={`font-medium hover:text-blue-400 ${dark ? 'text-white' : 'text-black'}`}
          onClick={() => {
            if (onShowPopular) onShowPopular();
          }}
        >
          Home
        </Link>
        <button
          type="button"
          className={`font-medium hover:text-blue-400 bg-transparent border-none outline-none ${dark ? 'text-white' : 'text-black'}`}
          onClick={() => {
            if (onShowPopular) onShowPopular();
            navigate('/'); // Always go to popular movies page
            setTimeout(() => {
              const el = document.getElementById('popular-movies-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          style={{ background: 'none' }}
        >
          Popular Movies
        </button>
        <button
          type="button"
          className={`font-medium hover:text-blue-400 bg-transparent border-none outline-none ${dark ? 'text-white' : 'text-black'}`}
          onClick={() => {
            if (onGenreClick) onGenreClick();
          }}
          style={{ background: 'none' }}
        >
          Genres
        </button>
        {/* Genre Dropdown */}
        <Genres
          show={genreDropdownOpen}
          onSelectGenres={onSelectGenres}
          selectedGenres={selectedGenres}
          onClose={onCloseGenreDropdown}
        />
        <Link
          to="/favorites"
          className={`font-medium hover:text-blue-400 ${dark ? 'text-white' : 'text-black'}`}
        >
          Favorites
        </Link>
      </div>

      {/* Desktop Search */}
      <div className="navbar-desktop-menu hidden md:flex flex-1 justify-center mx-6" ref={dropdownRef} style={{ position: 'relative' }}>
        <form className="relative flex w-full max-w-xs" onSubmit={handleSearch} autoComplete="off">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={handleInputChange}
            className={`flex-1 px-4 py-2 pr-12 rounded-full focus:outline-none focus:ring-2 border-none transition-colors duration-300 ${
              dark
                ? 'bg-gray-800 text-white '
                : 'bg-gray-100 text-black placeholder-black '
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors flex items-center justify-center bg-transparent ${
              dark ? 'text-white' : 'text-black'
            } hover:text-[#E50914]`}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
{showDropdown && suggestions.length > 0 && (
  <ul
    className={`absolute left-0 right-0 top-12 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto border ${
      dark
        ? 'bg-gray-800 text-white border-gray-700'
        : 'bg-white text-black border-gray-200'
    }`}
    style={{
      minWidth: '100%',
      background: dark ? '#1f2937' : '#fff', // Ensures background is dark in dark mode
      color: dark ? '#fff' : '#000',         // Ensures text is visible in dark mode
    }}
  >
    {suggestions.map((movie) => (
      <li
        key={movie.id}
        className={`px-4 py-2 cursor-pointer hover:bg-[#E50914] hover:text-white transition`}
        onClick={() => handleSuggestionClick(movie.title)}
      >
        {movie.title}
      </li>
    ))}
  </ul>
)}
        </form>
      </div>

      {/* Right: Theme Toggle (always visible) */}
<div className="flex items-center space-x-8">
        <button
          onClick={toggleTheme}
          className={`navbar-toggle-theme transition-colors text-2xl p-2 rounded-full focus:outline-none ${
            dark ? 'text-white hover:text-[#E50914]' : 'text-black hover:text-[#E50914]'
          }`}
          aria-label="Toggle theme"
        >
          {dark ? (
            // Sun icon for light mode
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M17.36 17.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M17.36 6.64l1.42-1.42"/>
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile/Tablet Dropdown Menu */}
      {menuOpen && (
        <div className={`navbar-mobile-menu md:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50`}>
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              className="absolute top-6 right-8 text-white text-3xl"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              &times;
            </button>
            <Link
              to="/"
              className="text-2xl font-semibold text-white"
              onClick={() => {
                setMenuOpen(false);
                if (onShowPopular) onShowPopular();
              }}
            >
              Home
            </Link>
            <button
              type="button"
              className="text-2xl font-semibold text-white bg-transparent border-none outline-none"
              onClick={() => {
                setMenuOpen(false);
                if (onShowPopular) onShowPopular();
                navigate('/');
                setTimeout(() => {
                  const el = document.getElementById('popular-movies-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              style={{ background: 'none' }}
            >
              Popular Movies
            </button>
            <button
              type="button"
              className="text-2xl font-semibold text-white bg-transparent border-none outline-none"
              onClick={() => {
                if (onGenreClick) onGenreClick();
              }}
              style={{ background: 'none' }}
            >
              Genres
            </button>
            {/* Genre Dropdown (optional, can show here if desired) */}
            <Genres
              show={genreDropdownOpen}
              onSelectGenres={onSelectGenres}
              selectedGenres={selectedGenres}
              onClose={onCloseGenreDropdown}
            />
            <form className="w-4/5" onSubmit={handleSearch} autoComplete="off">
              <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-full bg-gray-800 text-white"
                style={{ marginBottom: '1rem' }}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-full bg-[#E50914] text-white font-semibold"
                aria-label="Search"
              >
                Search
              </button>
            </form>
            <Link
              to="/favorites"
              className="text-2xl font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              Favorites
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;