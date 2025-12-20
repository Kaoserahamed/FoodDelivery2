import React, { useState, useEffect } from 'react';
import { orderAPI } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getHistory();
        // Backend returns { success: true, orders: [...] }
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <h1 className="section-title">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
          <i className="fas fa-receipt" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
          <h3>No orders yet</h3>
          <p>Your order history will appear here</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.order_id} style={{
              backgroundColor: 'var(--white)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 'var(--spacing-lg)'
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
                    Order #{order.order_number || order.order_id}
                  </h3>
                  <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                    {order.restaurant_name}
                  </p>
                  <p style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                    {new Date(order.order_date).toLocaleDateString()} at {new Date(order.order_date).toLocaleTimeString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {getStatusBadge(order.status)}
                  <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-semibold)' }}>
                    ${order.total_amount}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-lg)' }}>
                  Items ({order.item_count || order.items?.length || 0}):
                </h4>
                {order.items && order.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-sm) 0',
                    color: 'var(--dark-gray)'
                  }}>
                    <span>{item.quantity}x {item.item_name}</span>
                    <span>${(item.item_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
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
                </div>
                <button className="btn btn-outline btn-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;