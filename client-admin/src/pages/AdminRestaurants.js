import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../utils/api';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchTerm, filterStatus]);

  const loadRestaurants = async () => {
    try {
      const response = await adminAPI.getRestaurants();
      const restaurantsData = Array.isArray(response.data) ? response.data : [];
      setRestaurants(restaurantsData);
      
      // Calculate stats
      const total = restaurantsData.length;
      const active = restaurantsData.filter(r => r.is_open).length;
      const suspended = total - active;
      setStats({ total, active, suspended });
      
      console.log(`✅ Loaded ${restaurantsData.length} restaurants`);
    } catch (error) {
      console.error('❌ Error loading restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.email && restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(r => r.is_open);
      } else if (filterStatus === 'suspended') {
        filtered = filtered.filter(r => !r.is_open);
      }
    }

    setFilteredRestaurants(filtered);
  };

  const toggleRestaurantStatus = async (restaurantId) => {
    try {
      const response = await adminAPI.toggleRestaurant(restaurantId);
      
      if (response.data.message) {
        // Update the restaurant in the list
        setRestaurants(prev => prev.map(restaurant => 
          restaurant.restaurant_id === restaurantId 
            ? { ...restaurant, is_open: response.data.is_open }
            : restaurant
        ));
        
        // Update stats
        const updatedRestaurants = restaurants.map(restaurant => 
          restaurant.restaurant_id === restaurantId 
            ? { ...restaurant, is_open: response.data.is_open }
            : restaurant
        );
        const total = updatedRestaurants.length;
        const active = updatedRestaurants.filter(r => r.is_open).length;
        const suspended = total - active;
        setStats({ total, active, suspended });
        
        console.log(`✅ Restaurant ${restaurantId} status updated`);
      }
    } catch (error) {
      console.error('❌ Error toggling restaurant status:', error);
      alert('Failed to update restaurant status');
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="container">
        <div className="layout-sidebar mt-xl mb-xl">
          <AdminSidebar />
          
          <main className="main-content">
            {/* Page Header */}
            <div className="dashboard-header">
              <div className="d-flex justify-between align-center">
                <div>
                  <h1>Manage Restaurants</h1>
                  <p className="text-muted">View and manage all restaurant accounts</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Restaurants</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: 'var(--danger-color)' }}>
                <div className="stat-value">{stats.suspended}</div>
                <div className="stat-label">Suspended</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card mt-lg">
              <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
                <div className="d-flex gap-md align-center">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search restaurants..." 
                    style={{ flex: 1 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ maxWidth: '200px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select className="form-control" style={{ maxWidth: '200px' }}>
                    <option>Sort by: Name A-Z</option>
                    <option>Sort by: Name Z-A</option>
                    <option>Sort by: Rating</option>
                    <option>Sort by: Orders</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Restaurants Table */}
            <div className="table-container mt-lg">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Logo</th>
                    <th>Restaurant Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--medium-gray)' }}>
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                            <p>Loading restaurants...</p>
                          </>
                        ) : (
                          'No restaurants found'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant.restaurant_id}>
                        <td>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: restaurant.image_url 
                              ? `url(${restaurant.image_url}) center/cover` 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1.2rem'
                          }}>
                            {!restaurant.image_url && restaurant.name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="fw-semibold" style={{ margin: 0 }}>{restaurant.name}</p>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                              {restaurant.cuisine_type}
                            </p>
                          </div>
                        </td>
                        <td>{restaurant.email || 'N/A'}</td>
                        <td>{restaurant.phone || 'N/A'}</td>
                        <td>{restaurant.total_orders || 0}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <i className="fas fa-star" style={{ color: 'var(--accent-color)' }}></i>
                            <span>{restaurant.rating || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${restaurant.is_open ? 'badge-success' : 'badge-danger'}`}>
                            {restaurant.is_open ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${restaurant.is_open ? 'btn-outline' : 'btn-primary'}`}
                            onClick={() => toggleRestaurantStatus(restaurant.restaurant_id)}
                            style={{ 
                              fontSize: 'var(--font-size-xs)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)'
                            }}
                          >
                            {restaurant.is_open ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminRestaurants;