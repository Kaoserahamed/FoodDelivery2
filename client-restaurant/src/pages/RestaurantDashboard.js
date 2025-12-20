import React, { useEffect } from 'react';
import RestaurantHeader from '../components/RestaurantHeader';
import RestaurantSidebar from '../components/RestaurantSidebar';
import { useRestaurant } from '../context/RestaurantContext';

const RestaurantDashboard = () => {
  const { state, actions } = useRestaurant();
  const { stats, restaurant, recentOrders, loading, error } = state;

  useEffect(() => {
    // Fetch dashboard data on component mount
    actions.fetchDashboardData();
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) actions.clearError();
    };
  }, [error]);

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
                <h3>Error Loading Dashboard</h3>
                <p>{error}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => actions.fetchDashboardData()}
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
            <div className="section-header">
              <h1 className="section-title">
                {restaurant?.name ? `Welcome back, ${restaurant.name}! 👋` : 'Restaurant Dashboard'}
              </h1>
              <p className="section-subtitle">Here's what's happening with your restaurant today</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
                <div className="stat-value">{stats.todayOrders}</div>
                <div className="stat-label">Today's Orders</div>
                <div className="mt-sm text-success" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <i className="fas fa-arrow-up"></i> 12% from yesterday
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
                <div className="stat-value">${parseFloat(stats.todayRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="stat-label">Today's Revenue</div>
                <div className="mt-sm text-success" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <i className="fas fa-arrow-up"></i> 8% from yesterday
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                <div className="stat-value">{stats.pendingOrders}</div>
                <div className="stat-label">Pending Orders</div>
                <div className="mt-sm text-warning" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <i className="fas fa-clock"></i> Needs attention
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--info-color)' }}>
                <div className="stat-value">{stats.avgRating}</div>
                <div className="stat-label">Average Rating</div>
                <div className="mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <i className="fas fa-star" style={{ color: 'var(--accent-color)' }}></i> Reviews
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              marginTop: 'var(--spacing-xl)'
            }}>
              <div style={{
                padding: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--gray)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3>Recent Orders</h3>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => actions.refreshDashboardData()}
                  title="Refresh data"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
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
                        <tr key={order.order_id} style={{ borderBottom: '1px solid var(--gray)' }}>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                            #{order.order_id}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                            {order.customer_name}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                            {order.item_count || order.total_items || 0} items
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                            ${parseFloat(order.total_amount || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                            {getStatusBadge(order.status)}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                            {order.order_date ? new Date(order.order_date).toLocaleTimeString() : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Auto-refresh indicator */}
            {state.lastUpdated && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: 'var(--spacing-lg)', 
                color: 'var(--medium-gray)', 
                fontSize: 'var(--font-size-sm)' 
              }}>
                <i className="fas fa-clock"></i> Last updated: {state.lastUpdated.toLocaleTimeString()}
                <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                  (Auto-refreshes every 30 seconds)
                </span>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default RestaurantDashboard;