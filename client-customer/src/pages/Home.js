import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI, menuAPI } from '../utils/api';
import ImageWithFallback from '../components/ImageWithFallback';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsRes, dishesRes] = await Promise.all([
          restaurantAPI.getFeatured(),
          menuAPI.getPopular()
        ]);
        
        // Handle restaurants response - it's a direct array
        const restaurantsData = Array.isArray(restaurantsRes.data) ? restaurantsRes.data : [];
        setRestaurants(restaurantsData.slice(0, 6)); // Show only first 6 restaurants
        
        // Handle dishes response - extract items from response
        const dishesData = dishesRes.data?.items || dishesRes.data || [];
        setPopularDishes(Array.isArray(dishesData) ? dishesData.slice(0, 8) : []); // Show only first 8 dishes
      } catch (error) {
        console.error('Error fetching data:', error);
        setRestaurants([]);
        setPopularDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Reset message after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'var(--white)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <i className="fas fa-utensils" style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }}></i>
            </div>
            
            <h1 className="hero-title" style={{
              fontSize: '3.5rem',
              color: 'var(--white)',
              marginBottom: '20px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Delicious Food, Delivered Fast
            </h1>
            <p className="hero-subtitle" style={{
              fontSize: '22px',
              marginBottom: '40px',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: '1.6'
            }}>
              Order from your favorite local restaurants
            </p>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Restaurants</h2>
            <p className="section-subtitle">Discover the best places near you</p>
          </div>

          <div className="grid grid-3">
            {restaurants.map((restaurant) => (
              <div key={restaurant.restaurant_id} className="card">
                <ImageWithFallback
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="card-img"
                  fallbackText={restaurant.name}
                  fallbackType="restaurant"
                />
                <div className="card-body">
                  <h3 className="card-title">{restaurant.name}</h3>
                  <p className="card-text">{restaurant.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--dark-gray)' }}>
                      <span><i className="fas fa-star"></i> {restaurant.rating || '4.5'}</span>
                      <span><i className="fas fa-clock"></i> {restaurant.delivery_time || '30-45'} min</span>
                    </div>
                    <Link to={`/restaurants/${restaurant.restaurant_id}`} className="btn btn-primary btn-sm">
                      View Menu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-xl">
            <Link to="/restaurants" className="btn btn-outline btn-lg">View All Restaurants</Link>
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Dishes</h2>
            <p className="section-subtitle">Trending dishes from top restaurants</p>
          </div>

          <div className="grid grid-4">
            {popularDishes.map((dish) => (
              <div key={dish.item_id} className="card">
                <ImageWithFallback
                  src={dish.image_url}
                  alt={dish.name}
                  className="card-img"
                  fallbackText={dish.name}
                  fallbackType="food"
                />
                <div className="card-body">
                  <h4 className="card-title">{dish.name}</h4>
                  <p className="card-text" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {dish.restaurant_name}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="price">${dish.price}</span>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                        const existingItem = cart.find(item => item.item_id === dish.item_id);

                        if (existingItem) {
                          existingItem.quantity += 1;
                        } else {
                          cart.push({ 
                            ...dish, 
                            id: dish.item_id,
                            quantity: 1,
                            restaurant_id: dish.restaurant_id // Ensure restaurant_id is included
                          });
                        }

                        localStorage.setItem('cart', JSON.stringify(cart));
                        window.dispatchEvent(new Event('cartUpdated'));
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-xl">
            <Link to="/foods" className="btn btn-outline btn-lg">View All Dishes</Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 0'
      }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', color: 'var(--white)' }}>
            <h2 style={{ color: 'var(--white)', marginBottom: 'var(--spacing-md)' }}>Stay Updated</h2>
            <p style={{ marginBottom: 'var(--spacing-lg)' }}>
              Subscribe to get exclusive deals and latest restaurant updates delivered to your inbox.
            </p>
            
            {subscribed ? (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}></i>
                <h3 style={{ color: 'var(--white)', marginBottom: 'var(--spacing-xs)' }}>Thank You!</h3>
                <p style={{ margin: 0 }}>You've successfully subscribed to our newsletter.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="form-control" 
                  style={{ flex: 1 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-secondary">Subscribe</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;