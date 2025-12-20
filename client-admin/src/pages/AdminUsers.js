import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    thisMonth: 0,
    inactive: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      
      // Calculate stats
      const total = usersData.length;
      const active = usersData.filter(u => u.user_type === 'customer').length;
      const thisMonth = usersData.filter(u => {
        const created = new Date(u.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;
      const inactive = total - active;
      
      setStats({ total, active, thisMonth, inactive });
      
      console.log(`✅ Loaded ${usersData.length} users`);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(u => u.user_type === 'customer');
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(u => u.user_type !== 'customer');
      }
    }

    setFilteredUsers(filtered);
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
                  <h1>Manage Users</h1>
                  <p className="text-muted">View all customer accounts</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: 'var(--info-color)' }}>
                <div className="stat-value">{stats.thisMonth}</div>
                <div className="stat-label">This Month</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                <div className="stat-value">{stats.inactive}</div>
                <div className="stat-label">Inactive</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card mt-lg">
              <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
                <div className="d-flex gap-md align-center">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search users by name or email..." 
                    style={{ flex: 1 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ maxWidth: '200px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select className="form-control" style={{ maxWidth: '200px' }}>
                    <option>Sort by: Name A-Z</option>
                    <option>Sort by: Name Z-A</option>
                    <option>Sort by: Join Date</option>
                    <option>Sort by: Orders</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-container mt-lg">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Joined</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--medium-gray)' }}>
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                            <p>Loading users...</p>
                          </>
                        ) : (
                          'No users found'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      });
                      const userType = user.user_type || 'customer';
                      const typeBadge = userType === 'customer' ? 'badge-success' : 
                                       userType === 'restaurant' ? 'badge-info' : 'badge-warning';
                      const typeText = userType.charAt(0).toUpperCase() + userType.slice(1);
                      
                      return (
                        <tr key={user.user_id}>
                          <td>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '1.2rem'
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="fw-semibold" style={{ margin: 0 }}>{user.name}</p>
                              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                ID: {user.user_id}
                              </p>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td style={{ 
                            maxWidth: '200px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {user.address || 'N/A'}
                          </td>
                          <td>{joinDate}</td>
                          <td>
                            <span className={`badge ${typeBadge}`}>{typeText}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;