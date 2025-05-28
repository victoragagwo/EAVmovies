import React from 'react';
import logo1 from '../assets/logo1.jpg';
import logo2 from '../assets/logo2.jpg';
import '../styles/footer.css';

function Footer({ dark }) {
  return (
    <footer className={`footer ${dark ? '' : 'footer-light'}`}>
      <div className="footer-content">
        <img
          src={dark ? logo1 : logo2}
          alt="EAVmovies Logo"
          className="footer-logo"
        />
        <span>
          &copy; EAVmovies 2025. Made by Victor Agagwo
        </span>
      </div>
    </footer>
  );
}

export default Footer;