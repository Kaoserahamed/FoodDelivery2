import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="navbar container">
        <Link to="/dashboard" className="navbar-brand">
          <i className="fas fa-utensils"></i>
          TasteNow Admin
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/restaurants" className={`navbar-link ${isActive('/restaurants') ? 'active' : ''}`}>
            Restaurants
          </Link>
          <Link to="/users" className={`navbar-link ${isActive('/users') ? 'active' : ''}`}>
            Users
          </Link>
        </div>

        <div className="navbar-actions">
          <button 
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;