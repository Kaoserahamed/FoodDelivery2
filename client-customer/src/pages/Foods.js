import React, { useState, useEffect } from 'react';
import { menuAPI } from '../utils/api';
import FoodItemModal from '../components/FoodItemModal';
import ImageWithFallback from '../components/ImageWithFallback';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await menuAPI.getAll();
        // Handle the response structure
        const foodsData = response.data?.items || response.data || [];
        setFoods(Array.isArray(foodsData) ? foodsData : []);
      } catch (error) {
        console.error('Error fetching foods:', error);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const addToCart = (food, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.item_id === food.item_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        ...food, 
        id: food.item_id, // Add id for compatibility
        quantity: quantity,
        restaurant_id: food.restaurant_id // Ensure restaurant_id is included
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

  const categories = ['all', ...new Set(foods.map(food => food.category_name).filter(Boolean))];

  const filteredFoods = foods
    .filter(food => 
      (selectedCategory === 'all' || food.category_name === selectedCategory) &&
      (food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase())))
    );

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
        <h1 className="section-title">All Foods</h1>
        <p className="section-subtitle">Browse delicious dishes from all restaurants</p>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'var(--white)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search for dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 'var(--spacing-md)' }}
        />

        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-sm)'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: selectedCategory === category ? 'var(--primary-color)' : 'var(--white)',
                border: `2px solid ${selectedCategory === category ? 'var(--primary-color)' : 'var(--gray)'}`,
                borderRadius: 'var(--radius-full)',
                color: selectedCategory === category ? 'var(--white)' : 'var(--dark-gray)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Grid */}
      {filteredFoods.length === 0 ? (
        <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
          <i className="fas fa-utensils" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
          <h3>No dishes found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-4">
          {filteredFoods.map((food) => (
            <div 
              key={food.item_id} 
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => openItemModal(food)}
            >
              <ImageWithFallback
                src={food.image_url}
                alt={food.name}
                className="card-img"
                fallbackText={food.name}
                fallbackType="food"
              />
              <div className="card-body">
                <h4 className="card-title" style={{ fontSize: 'var(--font-size-lg)' }}>
                  {food.name}
                </h4>
                <p className="card-text" style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--medium-gray)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {food.restaurant_name}
                </p>
                <p className="card-text" style={{ 
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  {food.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span className="price">${food.price}</span>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(food);
                    }}
                  >
                    <i className="fas fa-cart-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Item Modal */}
      {showModal && selectedItem && (
        <FoodItemModal 
          item={selectedItem}
          restaurant={{ name: selectedItem.restaurant_name }}
          onClose={closeModal}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Foods;