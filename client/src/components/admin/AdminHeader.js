import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav className="navbar container">
        <Link to="/admin/dashboard" className="navbar-brand">
          <i className="fas fa-cog"></i>
          TasteNow Admin
        </Link>

        <div className="navbar-menu">
          <Link to="/admin/dashboard" className={`navbar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/admin/restaurants" className={`navbar-link ${isActive('/admin/restaurants') ? 'active' : ''}`}>
            Restaurants
          </Link>
          <Link to="/admin/users" className={`navbar-link ${isActive('/admin/users') ? 'active' : ''}`}>
            Users
          </Link>
        </div>

        <div className="navbar-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <span style={{ color: 'var(--dark-gray)' }}>
              Admin Panel
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;