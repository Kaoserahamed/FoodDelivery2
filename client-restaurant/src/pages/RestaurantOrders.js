import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../components/RestaurantHeader';
import RestaurantSidebar from '../components/RestaurantSidebar';
import { useRestaurant } from '../context/RestaurantContext';
import axios from 'axios';

const RestaurantOrders = () => {
  const { state, actions } = useRestaurant();
  const { orders, loading, error } = state;
  
  const [filter, setFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    // Fetch orders on component mount
    actions.fetchOrders();
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) actions.clearError();
    };
  }, [error]);

  const fetchOrderItems = async (orderId) => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log(`Fetching items for order ${orderId}...`);
      const response = await axios.get(`/api/restaurant/orders/${orderId}`, config);
      console.log('Order items response:', response.data);
      
      if (response.data.success && response.data.order.items) {
        console.log(`Found ${response.data.order.items.length} items for order ${orderId}`);
        setOrderItems(prev => ({
          ...prev,
          [orderId]: response.data.order.items
        }));
      } else {
        console.log('No items found in response');
        setOrderItems(prev => ({
          ...prev,
          [orderId]: []
        }));
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      setOrderItems(prev => ({
        ...prev,
        [orderId]: []
      }));
    }
  };

  const toggleOrderItems = async (orderId) => {
    const newExpanded = new Set(expandedOrders);
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      // Fetch items if not already loaded
      if (!orderItems[orderId]) {
        await fetchOrderItems(orderId);
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const result = await actions.updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      alert('Order status updated successfully!');
    } else {
      alert(result.error || 'Error updating order status. Please try again.');
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

  if (error) {
    return (
      <>
        <RestaurantHeader />
        <div className="container">
          <div className="layout-sidebar mt-xl mb-xl">
            <RestaurantSidebar />
            <main className="main-content" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
              <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--danger-color)' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}></i>
                <h3>Error Loading Orders</h3>
                <p>{error}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => actions.fetchOrders()}
                >
                  Try Again
                </button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RestaurantHeader />
      <div className="container">
        <div className="layout-sidebar mt-xl mb-xl">
          <RestaurantSidebar />
          <main className="main-content" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <div className="section-header">
                <h1 className="section-title">Order Management</h1>
                <p className="section-subtitle">Manage incoming orders and update their status</p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => actions.refreshOrders()}
                title="Refresh orders"
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
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
                  <div key={order.order_id} style={{
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
                          Order #{order.order_id}
                        </h3>
                        <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                          {order.order_date ? new Date(order.order_date).toLocaleDateString() : ''} at {order.order_date ? new Date(order.order_date).toLocaleTimeString() : ''}
                        </p>
                        <p style={{ color: 'var(--dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                          Customer: {order.customer_name} | Phone: {order.customer_phone}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {getStatusBadge(order.status)}
                        <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                          ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleOrderItems(order.order_id)}
                        style={{ marginBottom: 'var(--spacing-md)' }}
                      >
                        <i className={`fas fa-chevron-${expandedOrders.has(order.order_id) ? 'up' : 'down'}`}></i> 
                        {expandedOrders.has(order.order_id) ? 'Hide' : 'View'} Items ({order.item_count || order.total_items || 0})
                      </button>
                      
                      {expandedOrders.has(order.order_id) && (
                        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                          {orderItems[order.order_id] ? (
                            orderItems[order.order_id].length > 0 ? (
                              orderItems[order.order_id].map((item, index) => (
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
                                      {item.quantity}x {item.menu_item_name || item.item_name || item.name}
                                    </span>
                                    {item.menu_item_description && (
                                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)', margin: '2px 0 0 0' }}>
                                        {item.menu_item_description}
                                      </p>
                                    )}
                                    {item.notes && (
                                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)', margin: '2px 0 0 0' }}>
                                        Note: {item.notes}
                                      </p>
                                    )}
                                  </div>
                                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                    ${parseFloat(item.subtotal || (item.item_price * item.quantity) || 0).toFixed(2)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div style={{ 
                                padding: 'var(--spacing-md)',
                                textAlign: 'center',
                                color: 'var(--medium-gray)',
                                backgroundColor: 'var(--light-gray)',
                                borderRadius: 'var(--radius-md)'
                              }}>
                                <i className="fas fa-inbox" style={{ fontSize: '24px', marginBottom: 'var(--spacing-sm)' }}></i>
                                <p>No items found for this order</p>
                              </div>
                            )
                          ) : (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              padding: 'var(--spacing-md)',
                              color: 'var(--medium-gray)'
                            }}>
                              <i className="fas fa-spinner fa-spin" style={{ marginRight: 'var(--spacing-sm)' }}></i>
                              Loading items...
                            </div>
                          )}
                        </div>
                      )}
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
                              onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                              style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                            >
                              Accept Order
                            </button>
                          </>
                        )}
                        
                        {getNextStatus(order.status) && order.status !== 'pending' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => updateOrderStatus(order.order_id, getNextStatus(order.status))}
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
          </main>
        </div>
      </div>
    </>
  );
};

export default RestaurantOrders;