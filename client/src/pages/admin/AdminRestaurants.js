import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import axios from 'axios';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/admin/restaurants', config);
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurantStatus = async (restaurantId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/admin/restaurants/${restaurantId}/status`, 
        { status }, 
        config
      );

      // Update local state
      setRestaurants(restaurants.map(restaurant => 
        restaurant.id === restaurantId ? { ...restaurant, status } : restaurant
      ));

      alert(`Restaurant ${status} successfully!`);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert('Error updating restaurant status. Please try again.');
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/admin/restaurants/${restaurantId}`, config);
      
      // Remove from local state
      setRestaurants(restaurants.filter(restaurant => restaurant.id !== restaurantId));
      alert('Restaurant deleted successfully!');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Error deleting restaurant. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger',
      'suspended': 'danger'
    };

    return (
      <span className={`badge badge-${statusColors[status] || 'info'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (filter === 'all') return true;
    return restaurant.status === filter;
  });

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
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="section-header">
          <h1 className="section-title">Restaurant Management</h1>
          <p className="section-subtitle">Manage restaurant applications and status</p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: filter === status ? 'var(--primary-color)' : 'var(--white)',
                border: `2px solid ${filter === status ? 'var(--primary-color)' : 'var(--gray)'}`,
                color: filter === status ? 'var(--white)' : 'var(--dark-gray)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize'
              }}
            >
              {status} ({restaurants.filter(r => status === 'all' || r.status === status).length})
            </button>
          ))}
        </div>

        {/* Restaurants Table */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
              <i className="fas fa-store" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
              <h3>No restaurants found</h3>
              <p>No restaurants match the selected filter</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--light-gray)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Restaurant
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Contact
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Cuisine
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Status
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Joined
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} style={{ borderBottom: '1px solid var(--gray)' }}>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {restaurant.name}
                          </h4>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                            {restaurant.address}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            {restaurant.email}
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            {restaurant.phone}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {restaurant.cuisine_type}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        {getStatusBadge(restaurant.status)}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                          {restaurant.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => updateRestaurantStatus(restaurant.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => updateRestaurantStatus(restaurant.id, 'rejected')}
                                style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {restaurant.status === 'approved' && (
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => updateRestaurantStatus(restaurant.id, 'suspended')}
                              style={{ color: 'var(--warning-color)', borderColor: 'var(--warning-color)' }}
                            >
                              Suspend
                            </button>
                          )}
                          
                          {restaurant.status === 'suspended' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => updateRestaurantStatus(restaurant.id, 'approved')}
                            >
                              Reactivate
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => deleteRestaurant(restaurant.id)}
                            style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminRestaurants;