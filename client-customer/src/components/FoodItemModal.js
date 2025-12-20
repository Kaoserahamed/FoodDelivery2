import React, { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';

const FoodItemModal = ({ item, restaurant, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAddToCart = () => {
    const itemWithInstructions = {
      ...item,
      special_instructions: specialInstructions
    };
    onAddToCart(itemWithInstructions, quantity);
    onClose();
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--spacing-lg)'
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--spacing-lg)',
            right: 'var(--spacing-lg)',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 'var(--font-size-lg)',
            zIndex: 1001
          }}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Item Image */}
        <div style={{ position: 'relative' }}>
          <ImageWithFallback
            src={item.image_url}
            alt={item.name}
            fallbackText={item.name}
            fallbackType="food"
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-xl)' }}>
          {/* Restaurant Name */}
          <p style={{ 
            color: 'var(--primary-color)', 
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-xs)'
          }}>
            {restaurant.name}
          </p>

          {/* Item Name */}
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>{item.name}</h2>

          {/* Description */}
          <p style={{ 
            color: 'var(--medium-gray)', 
            lineHeight: '1.6',
            marginBottom: 'var(--spacing-lg)'
          }}>
            {item.description}
          </p>

          {/* Price */}
          <div style={{ 
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--primary-color)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            ${item.price}
          </div>

          {/* Special Instructions */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or modifications..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: 'var(--spacing-md)',
                border: '2px solid var(--gray)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-lg)'
          }}>
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={decreaseQuantity}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid var(--primary-color)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--primary-color)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-lg)'
                  }}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span style={{ 
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  minWidth: '30px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid var(--primary-color)',
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--white)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-lg)'
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg"
              style={{ 
                flex: 1,
                maxWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)'
              }}
            >
              <i className="fas fa-cart-plus"></i>
              Add ${(item.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;