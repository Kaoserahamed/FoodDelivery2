import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="navbar container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-utensils"></i>
          TasteNow
        </Link>

        <div className="navbar-menu">
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/restaurants" className={`navbar-link ${isActive('/restaurants') ? 'active' : ''}`}>
            Restaurants
          </Link>
          <Link to="/foods" className={`navbar-link ${isActive('/foods') ? 'active' : ''}`}>
            Foods
          </Link>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-icon">
            <i className="fas fa-shopping-cart"></i>
            <span className="navbar-badge">{cartCount}</span>
          </Link>
          
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
              <Link to="/orders" className="navbar-icon">
                <i className="fas fa-receipt"></i>
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;