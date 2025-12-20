import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cartItems.map(item =>
      (item.id === id || item.item_id === id) ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id && item.item_id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateDeliveryFee = () => {
    return cartItems.length > 0 ? 3.99 : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const deliveryFee = calculateDeliveryFee();
    return subtotal + tax + deliveryFee;
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menu_item_id: item.item_id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: calculateTotal(),
        delivery_address: JSON.parse(localStorage.getItem('user')).address
      };

      const response = await orderAPI.create(orderData);
      
      if (response.data.success) {
        clearCart();
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
          <i className="fas fa-shopping-cart" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/foods')}
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            Browse Foods
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <h1 className="section-title">Your Cart</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 'var(--spacing-xl)'
      }}>
        {/* Cart Items */}
        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3>Cart Items ({cartItems.length})</h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>

          {cartItems.map((item) => (
            <div key={item.item_id || item.id} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr auto',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg)',
              borderBottom: '1px solid var(--gray)'
            }}>
              <img 
                src={item.image_url || item.image || '/api/placeholder/80/80'} 
                alt={item.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)'
                }}
              />
              
              <div>
                <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{item.name}</h4>
                <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  {item.restaurant_name}
                </p>
                <div className="price">${item.price}</div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'space-between'
              }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => removeItem(item.item_id || item.id)}
                  style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                >
                  <i className="fas fa-trash"></i>
                </button>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  backgroundColor: 'var(--light-gray)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-xs)'
                }}>
                  <button 
                    onClick={() => updateQuantity(item.item_id || item.id, item.quantity - 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: 'none',
                      backgroundColor: 'var(--white)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    minWidth: '30px',
                    textAlign: 'center',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.item_id || item.id, item.quantity + 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: 'none',
                      backgroundColor: 'var(--white)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          height: 'fit-content',
          position: 'sticky',
          top: 'calc(var(--header-height) + var(--spacing-lg))'
        }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Order Summary</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
            <span>Subtotal</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
            <span>Tax</span>
            <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
            <span>Delivery Fee</span>
            <span>${calculateDeliveryFee().toFixed(2)}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--darker-gray)',
            paddingTop: 'var(--spacing-md)',
            borderTop: '2px solid var(--gray)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>

          <button 
            className="btn btn-primary btn-block btn-lg"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;