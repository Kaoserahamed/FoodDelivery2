import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../utils/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        // Handle direct array response
        const restaurantsData = Array.isArray(response.data) ? response.data : [];
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants
    .filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'delivery_time':
          return (a.delivery_time || 0) - (b.delivery_time || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <div className="section-header">
        <h1 className="section-title">All Restaurants</h1>
        <p className="section-subtitle">Discover amazing food from local restaurants</p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'var(--white)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="delivery_time">Sort by Delivery Time</option>
          </select>
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
          <i className="fas fa-search" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
          <h3>No restaurants found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.restaurant_id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={restaurant.image_url || '/api/placeholder/400/200'} 
                  alt={restaurant.name}
                  className="card-img"
                />
                {restaurant.is_open && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--spacing-md)',
                    right: 'var(--spacing-md)',
                    backgroundColor: 'var(--success-color)',
                    color: 'var(--white)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    Open
                  </div>
                )}
              </div>
              
              <div className="card-body">
                <h3 className="card-title">{restaurant.name}</h3>
                <p className="card-text">{restaurant.description}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-sm)' }}>
                  {restaurant.cuisine_type}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'var(--spacing-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)',
                    color: 'var(--dark-gray)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <i className="fas fa-star" style={{ color: 'var(--accent-color)' }}></i>
                      <span>{restaurant.rating || '4.5'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <i className="fas fa-clock"></i>
                      <span>{restaurant.delivery_time || '30-45'} min</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <Link 
                    to={`/restaurants/${restaurant.restaurant_id}`} 
                    className="btn btn-primary btn-block"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;