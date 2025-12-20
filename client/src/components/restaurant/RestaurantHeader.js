import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const RestaurantHeader = () => {
  const [restaurant, setRestaurant] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const restaurantData = localStorage.getItem('restaurant');
    if (restaurantData) {
      setRestaurant(JSON.parse(restaurantData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurant');
    navigate('/restaurant/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="navbar container">
        <Link to="/restaurant/dashboard" className="navbar-brand">
          <i className="fas fa-store"></i>
          TasteNow Restaurant
        </Link>

        <div className="navbar-menu">
          <Link to="/restaurant/dashboard" className={`navbar-link ${isActive('/restaurant/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/restaurant/menu" className={`navbar-link ${isActive('/restaurant/menu') ? 'active' : ''}`}>
            Menu
          </Link>
          <Link to="/restaurant/orders" className={`navbar-link ${isActive('/restaurant/orders') ? 'active' : ''}`}>
            Orders
          </Link>
          <Link to="/restaurant/profile" className={`navbar-link ${isActive('/restaurant/profile') ? 'active' : ''}`}>
            Profile
          </Link>
        </div>

        <div className="navbar-actions">
          {restaurant && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{ color: 'var(--dark-gray)' }}>
                Welcome, {restaurant.name}
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default RestaurantHeader;