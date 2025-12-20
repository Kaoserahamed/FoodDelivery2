import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </Link>
        <Link to="/restaurants" className={`sidebar-link ${isActive('/restaurants') ? 'active' : ''}`}>
          <i className="fas fa-store"></i>
          <span>Restaurants</span>
        </Link>
        <Link to="/users" className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}>
          <i className="fas fa-users"></i>
          <span>Users</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;