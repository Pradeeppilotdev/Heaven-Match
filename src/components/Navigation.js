/**
 * Navigation Component
 * Purpose: Main navigation bar component with responsive mobile menu
 * Displays navigation links and highlights the active route
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  // State to control mobile menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  /**
   * isActive - Checks if a navigation path is currently active
   * Purpose: Determines which navigation link should be highlighted based on current route
   * @param {string} path - The path to check against current location
   * @returns {boolean} True if the path matches current location
   */
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/contact', label: 'Contact Us', icon: 'fas fa-envelope' },
    { path: '/support', label: 'Support', icon: 'fas fa-headset' },
    { path: '/locations', label: 'Locations', icon: 'fas fa-map-marker-alt' },
    { path: '/help', label: 'Help Center', icon: 'fas fa-question-circle' }
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-heart"></i>
          <span>HeavenMatch</span>
        </Link>

        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

