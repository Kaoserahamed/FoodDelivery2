import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantAPI } from '../utils/api';
import FoodItemModal from '../components/FoodItemModal';
import ImageWithFallback from '../components/ImageWithFallback';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, menuRes] = await Promise.all([
          restaurantAPI.getById(id),
          restaurantAPI.getMenu(id)
        ]);

        setRestaurant(restaurantRes.data);
        setMenuItems(menuRes.data?.items || []);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setError('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const addToCart = (item, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(cartItem => cartItem.item_id === item.item_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        ...item, 
        id: item.item_id,
        quantity: quantity,
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.name
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', textAlign: 'center' }}>
        <div style={{ color: 'var(--danger-color)', padding: 'var(--spacing-3xl)' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '80px', marginBottom: 'var(--spacing-lg)' }}></i>
          <h3>{error || 'Restaurant not found'}</h3>
          <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category_name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Restaurant Header */}
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div style={{ position: 'relative' }}>
          <ImageWithFallback
            src={restaurant.image_url}
            alt={restaurant.name}
            fallbackText={restaurant.name}
            fallbackType="restaurant"
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover'
            }}
          />
          {restaurant.is_open && (
            <div style={{
              position: 'absolute',
              top: 'var(--spacing-lg)',
              right: 'var(--spacing-lg)',
              backgroundColor: 'var(--success-color)',
              color: 'var(--white)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              Open Now
            </div>
          )}
        </div>
        
        <div style={{ padding: 'var(--spacing-xl)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>{restaurant.name}</h1>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            color: 'var(--medium-gray)', 
            marginBottom: 'var(--spacing-lg)' 
          }}>
            {restaurant.description}
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Cuisine Type</h4>
              <p style={{ color: 'var(--medium-gray)' }}>{restaurant.cuisine_type}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Rating</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <i className="fas fa-star" style={{ color: 'var(--accent-color)' }}></i>
                <span>{restaurant.rating || '4.5'} ({restaurant.total_reviews || 0} reviews)</span>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Delivery Time</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <i className="fas fa-clock"></i>
                <span>{restaurant.delivery_time || '30-45'} minutes</span>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Price Range</h4>
              <span>{restaurant.price_range || '$$'}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--gray)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <i className="fas fa-map-marker-alt"></i>
              <span>{restaurant.address}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <i className="fas fa-phone"></i>
              <span>{restaurant.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <i className="fas fa-clock"></i>
              <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>Menu</h2>
        
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
            <i className="fas fa-utensils" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
            <h3>No menu items available</h3>
            <p>This restaurant hasn't added any menu items yet.</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 'var(--spacing-3xl)' }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-lg)',
                paddingBottom: 'var(--spacing-sm)',
                borderBottom: '2px solid var(--primary-color)',
                display: 'inline-block'
              }}>
                {category}
              </h3>
              
              <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
                {items.map((item) => (
                  <div 
                    key={item.item_id} 
                    className="card"
                    style={{ 
                      display: 'flex',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)',
                      ':hover': { transform: 'translateY(-2px)' }
                    }}
                    onClick={() => openItemModal(item)}
                  >
                    <ImageWithFallback
                      src={item.image_url}
                      alt={item.name}
                      fallbackText={item.name}
                      fallbackType="food"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)'
                      }}
                    />
                    <div style={{ 
                      flex: 1, 
                      padding: 'var(--spacing-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{item.name}</h4>
                        <p style={{ 
                          color: 'var(--medium-gray)', 
                          fontSize: 'var(--font-size-sm)',
                          marginBottom: 'var(--spacing-md)',
                          lineHeight: '1.5'
                        }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span className="price" style={{ fontSize: 'var(--font-size-lg)' }}>
                          ${item.price}
                        </span>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <i className="fas fa-cart-plus"></i> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Food Item Modal */}
      {showModal && selectedItem && (
        <FoodItemModal 
          item={selectedItem}
          restaurant={restaurant}
          onClose={closeModal}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default RestaurantDetail;