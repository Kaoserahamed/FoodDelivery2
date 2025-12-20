import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  };

  const updateAuthState = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    setUser(userData ? JSON.parse(userData) : null);
  };

  useEffect(() => {
    // Initial load
    updateAuthState();
    updateCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    // Listen for storage changes (for auth updates)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'cart') {
        updateAuthState();
        updateCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update auth state when location changes (for page refreshes after login)
  useEffect(() => {
    updateAuthState();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
    window.dispatchEvent(new Event('cartUpdated'));
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
            {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
          </Link>
          
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
              <Link to="/orders" className="navbar-icon">
                <i className="fas fa-receipt"></i>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                  Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                >
                  Logout
                </button>
              </div>
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