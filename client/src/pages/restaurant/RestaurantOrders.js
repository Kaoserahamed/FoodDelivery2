import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import axios from 'axios';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/restaurant/orders', config);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/restaurant/orders/${orderId}/status`, 
        { status: newStatus }, 
        config
      );

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'confirmed': 'info',
      'preparing': 'info',
      'ready': 'success',
      'delivered': 'success',
      'cancelled': 'danger'
    };

    return (
      <span className={`badge badge-${statusColors[status] || 'info'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <>
        <RestaurantHeader />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <RestaurantHeader />
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="section-header">
          <h1 className="section-title">Order Management</h1>
          <p className="section-subtitle">Manage incoming orders and update their status</p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'].map(status => (
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
              {status} ({orders.filter(o => status === 'all' || o.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
            <i className="fas fa-receipt" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
            <h3>No orders found</h3>
            <p>No orders match the selected filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{
                backgroundColor: 'var(--white)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: order.status === 'pending' ? '2px solid var(--warning-color)' : '1px solid var(--gray)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-md)',
                  paddingBottom: 'var(--spacing-md)',
                  borderBottom: '1px solid var(--gray)'
                }}>
                  <div>
                    <h3 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)' }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    <p style={{ color: 'var(--dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                      Customer: {order.customer_name} | Phone: {order.customer_phone}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {getStatusBadge(order.status)}
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                      ${order.total_amount}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-lg)' }}>Order Items:</h4>
                  <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--spacing-sm)',
                        backgroundColor: 'var(--light-gray)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {item.quantity}x {item.name}
                          </span>
                          {item.notes && (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)', margin: '2px 0 0 0' }}>
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ color: 'var(--dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                      <i className="fas fa-map-marker-alt"></i> {order.delivery_address}
                    </p>
                    {order.special_instructions && (
                      <p style={{ color: 'var(--dark-gray)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                        <i className="fas fa-sticky-note"></i> {order.special_instructions}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    {order.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        >
                          Accept Order
                        </button>
                      </>
                    )}
                    
                    {getNextStatus(order.status) && order.status !== 'pending' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      >
                        Mark as {getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RestaurantOrders;