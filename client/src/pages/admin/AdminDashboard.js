import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    pendingRestaurants: 0,
    activeRestaurants: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/admin/dashboard', config);
      
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="section-header">
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Platform overview and statistics</p>
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
              {stats.totalUsers}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Total Users
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
              {stats.totalRestaurants}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Total Restaurants
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
            borderLeft: '4px solid var(--warning-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--warning-color)',
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
            borderLeft: '4px solid var(--info-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--info-color)',
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
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--accent-color)',
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
            borderLeft: '4px solid var(--danger-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--danger-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {stats.pendingRestaurants}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Pending Approvals
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
              {stats.activeRestaurants}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Active Restaurants
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
            <h3>Recent Activity</h3>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--dark-gray)' }}>
              <i className="fas fa-chart-line" style={{ fontSize: '48px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-md)' }}></i>
              <p>No recent activity</p>
            </div>
          ) : (
            <div style={{ padding: 'var(--spacing-lg)' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md) 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid var(--gray)' : 'none'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--light-gray)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)'
                  }}>
                    <i className={activity.icon || 'fas fa-info'}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                      {activity.message}
                    </p>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;