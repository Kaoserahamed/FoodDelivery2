import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RestaurantHeader = () => {
  const [restaurant, setRestaurant] = useState(null);
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
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="navbar container">
        <Link to="/dashboard" className="navbar-brand">
          <i className="fas fa-store"></i>
          TasteNow Restaurant
        </Link>

        <div className="navbar-actions">
          {restaurant && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{ color: 'var(--dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                Welcome, {restaurant.name}
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default RestaurantHeader;