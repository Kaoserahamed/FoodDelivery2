import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_restaurants: 0,
    total_customers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadRecentOrders(),
        loadTopRestaurants(),
        loadOrdersByStatus()
      ]);
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
      console.log('📊 Stats loaded:', response.data);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setRecentOrders(response.data.slice(0, 5)); // Show only first 5 orders
      console.log(`📦 Loaded ${response.data.length} orders`);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
    }
  };

  const loadTopRestaurants = async () => {
    try {
      const response = await adminAPI.getTopRestaurants();
      setTopRestaurants(response.data);
      console.log(`🏆 Loaded ${response.data.length} top restaurants`);
    } catch (error) {
      console.error('❌ Error loading top restaurants:', error);
    }
  };

  const loadOrdersByStatus = async () => {
    try {
      const response = await adminAPI.getOrders();
      const orders = response.data;

      // Count orders by status
      const statusCounts = {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0
      };

      orders.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
          statusCounts[order.status]++;
        }
      });

      setOrdersByStatus(statusCounts);
      console.log(`📊 Loaded orders by status:`, statusCounts);
    } catch (error) {
      console.error('❌ Error loading orders by status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { class: 'badge-warning', text: 'Pending' },
      'confirmed': { class: 'badge-info', text: 'Confirmed' },
      'preparing': { class: 'badge-warning', text: 'Preparing' },
      'ready': { class: 'badge-info', text: 'Ready' },
      'delivered': { class: 'badge-success', text: 'Delivered' },
      'cancelled': { class: 'badge-danger', text: 'Cancelled' }
    };
    return badges[status] || { class: 'badge-secondary', text: status };
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="container">
        <div className="layout-sidebar mt-xl mb-xl">
          <AdminSidebar />
          
          <main className="main-content">
            {/* Page Header */}
            <div className="dashboard-header">
              <div className="d-flex justify-between align-center">
                <div>
                  <h1>Dashboard</h1>
                  <p className="text-muted">Welcome back, Admin! Here's your platform overview</p>
                </div>
                <div className="d-flex gap-md">
                  <select className="form-control" style={{ maxWidth: '150px' }}>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="stats-grid">
              <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
                <div className="d-flex justify-between align-center">
                  <div>
                    <div className="stat-value">{(stats.total_orders || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div style={{ fontSize: '2rem', color: 'var(--primary-color)', opacity: 0.2 }}>
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
                <div className="d-flex justify-between align-center">
                  <div>
                    <div className="stat-value">${(stats.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                  <div style={{ fontSize: '2rem', color: 'var(--success-color)', opacity: 0.2 }}>
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--info-color)' }}>
                <div className="d-flex justify-between align-center">
                  <div>
                    <div className="stat-value">{(stats.total_restaurants || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Restaurants</div>
                  </div>
                  <div style={{ fontSize: '2rem', color: 'var(--info-color)', opacity: 0.2 }}>
                    <i className="fas fa-store"></i>
                  </div>
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                <div className="d-flex justify-between align-center">
                  <div>
                    <div className="stat-value">{(stats.total_customers || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div style={{ fontSize: '2rem', color: 'var(--warning-color)', opacity: 0.2 }}>
                    <i className="fas fa-users"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="card mt-lg">
              <div className="card-body">
                <h3 className="card-title">Orders by Status</h3>
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: 'var(--spacing-md)' 
                  }}>
                    {Object.entries(ordersByStatus).map(([status, count]) => {
                      const statusConfig = {
                        pending: { label: 'Pending', color: 'var(--warning-color)', icon: 'clock' },
                        confirmed: { label: 'Confirmed', color: 'var(--info-color)', icon: 'check-circle' },
                        preparing: { label: 'Preparing', color: 'var(--primary-color)', icon: 'fire' },
                        ready: { label: 'Ready', color: 'var(--success-color)', icon: 'check' },
                        delivered: { label: 'Delivered', color: 'var(--success-color)', icon: 'truck' },
                        cancelled: { label: 'Cancelled', color: 'var(--danger-color)', icon: 'times-circle' }
                      };
                      const config = statusConfig[status];
                      
                      return (
                        <div key={status} style={{
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--light-gray)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center'
                        }}>
                          <i className={`fas fa-${config.icon}`} style={{
                            fontSize: '1.5rem',
                            color: config.color,
                            marginBottom: 'var(--spacing-sm)'
                          }}></i>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            marginBottom: '4px'
                          }}>{count}</div>
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--medium-gray)'
                          }}>{config.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders & Top Restaurants */}
            <div className="grid-2 mt-lg gap-lg">
              {/* Recent Orders */}
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Recent Orders</h3>
                  <div className="table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--medium-gray)' }}>
                              No orders found
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map(order => {
                            const statusBadge = getStatusBadge(order.status);
                            return (
                              <tr key={order.order_id}>
                                <td>#{order.order_id}</td>
                                <td>{order.customer_name || 'Unknown'}</td>
                                <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                                <td><span className={`badge ${statusBadge.class}`}>{statusBadge.text}</span></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Restaurants */}
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Top Restaurants</h3>
                  <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    {topRestaurants.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--medium-gray)' }}>
                        No restaurant data available
                      </p>
                    ) : (
                      topRestaurants.map((restaurant, index) => {
                        const isLast = index === topRestaurants.length - 1;
                        const borderStyle = isLast ? {} : { paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--gray)' };
                        
                        return (
                          <div key={restaurant.restaurant_id} className={`d-flex justify-between align-center ${isLast ? '' : 'mb-lg'}`} style={borderStyle}>
                            <div>
                              <p className="fw-semibold">{restaurant.name}</p>
                              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                ⭐ {restaurant.rating || 'N/A'} • {restaurant.total_orders || 0} orders
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div className="fw-semibold" style={{ color: 'var(--primary-color)' }}>
                                ${parseFloat(restaurant.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>This week</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;