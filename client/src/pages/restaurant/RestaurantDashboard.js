import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import axios from 'axios';

const RestaurantDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    menuItems: 0,
    avgRating: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('restaurantToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get('/api/restaurant/dashboard', config);
        
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentOrders(response.data.recentOrders || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
          <h1 className="section-title">Restaurant Dashboard</h1>
          <p className="section-subtitle">Overview of your restaurant performance</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--primary-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--primary-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {stats.totalOrders}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Total Orders
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--secondary-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--secondary-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {stats.todayOrders}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Today's Orders
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--success-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--success-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              ${stats.totalRevenue}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Total Revenue
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--warning-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--warning-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              ${stats.todayRevenue}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Today's Revenue
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--info-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--info-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {stats.menuItems}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Menu Items
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--accent-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {stats.avgRating}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Average Rating
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--gray)'
          }}>
            <h3>Recent Orders</h3>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--dark-gray)' }}>
              <i className="fas fa-receipt" style={{ fontSize: '48px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-md)' }}></i>
              <p>No recent orders</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--light-gray)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Order ID
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Customer
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Items
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Total
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Status
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--gray)' }}>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {order.customer_name}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {order.item_count} items
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        ${order.total_amount}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        {getStatusBadge(order.status)}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {new Date(order.created_at).toLocaleTimeString()}
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

export default RestaurantDashboard;