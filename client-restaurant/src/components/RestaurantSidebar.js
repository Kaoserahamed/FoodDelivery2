import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { restaurantAuthAPI } from '../utils/api';

const RestaurantSidebar = () => {
  const { state, actions } = useRestaurant();
  const { restaurant } = state;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Get restaurant status from context or localStorage
    if (restaurant?.is_open !== undefined) {
      setIsOpen(restaurant.is_open);
    } else {
      const data = localStorage.getItem('restaurant');
      if (data) {
        const rest = JSON.parse(data);
        setIsOpen(!!rest.is_open);
      }
    }
  }, [restaurant]);

  const isActive = (path) => {
    // Check exact path match or legacy restaurant path
    return location.pathname === path || 
           location.pathname === `/restaurant${path}` ||
           (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/restaurant'));
  };

  const toggleStatus = async (e) => {
    const newStatus = e.target.checked;
    setIsOpen(newStatus);

    try {
      await restaurantAuthAPI.updateStatus({ is_open: newStatus });
      
      // Update context
      actions.updateRestaurantStatus(newStatus);
      
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('restaurant') || '{}');
      stored.is_open = newStatus;
      localStorage.setItem('restaurant', JSON.stringify(stored));
    } catch (err) {
      console.error('Error updating status:', err);
      // revert
      setIsOpen(!newStatus);
      alert('Failed to update restaurant status');
    }
  };

  return (
    <aside className="sidebar">
      {/* Restaurant Info */}
      <div style={{ 
        padding: 'var(--spacing-lg)', 
        borderBottom: '1px solid var(--gray)',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
        color: 'var(--white)'
      }}>
        <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--white)' }}>
          {restaurant?.name || 'Restaurant Dashboard'}
        </h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          {restaurant?.email || 'Manage your restaurant'}
        </p>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <Link 
          to="/dashboard" 
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <i className="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </Link>
        <Link 
          to="/orders" 
          className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
        >
          <i className="fas fa-receipt"></i>
          <span>Orders</span>
        </Link>
        <Link 
          to="/menu" 
          className={`sidebar-link ${isActive('/menu') ? 'active' : ''}`}
        >
          <i className="fas fa-utensils"></i>
          <span>Menu Management</span>
        </Link>
      </div>

      {/* Restaurant Status Toggle */}
      <div style={{ 
        padding: 'var(--spacing-lg)', 
        marginTop: 'auto',
        borderTop: '1px solid var(--gray)',
        backgroundColor: 'var(--light-gray)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-sm)'
        }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
            Restaurant Status
          </span>
          <span className={`badge ${isOpen ? 'badge-success' : 'badge-danger'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)', 
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)'
        }}>
          <input 
            type="checkbox" 
            checked={isOpen} 
            onChange={toggleStatus}
            style={{ marginRight: 'var(--spacing-xs)' }}
          />
          <span>Currently accepting orders</span>
        </label>
      </div>
    </aside>
  );
};

export default RestaurantSidebar;