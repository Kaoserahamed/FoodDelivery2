import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/admin/users', config);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/admin/users/${userId}/status`, 
        { status: newStatus }, 
        config
      );

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      alert(`User ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/admin/users/${userId}`, config);
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage platform users and their accounts</p>
        </div>

        {/* Search Bar */}
        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {filteredUsers.length === 0 ? (
            <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
              <i className="fas fa-users" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
              <h3>No users found</h3>
              <p>No users match your search criteria</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--light-gray)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      User
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Contact
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Orders
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Status
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Joined
                    </th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)', color: 'var(--darker-gray)', borderBottom: '2px solid var(--gray)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--gray)' }}>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {user.name}
                          </h4>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                            ID: {user.id}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            {user.email}
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            {user.phone}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {user.total_orders || 0} orders
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                            ${user.total_spent || 0} spent
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        {getStatusBadge(user.status || 'active')}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)', color: 'var(--dark-gray)' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                          <button 
                            className={`btn btn-outline btn-sm`}
                            onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                            style={{
                              color: (user.status || 'active') === 'active' ? 'var(--warning-color)' : 'var(--success-color)',
                              borderColor: (user.status || 'active') === 'active' ? 'var(--warning-color)' : 'var(--success-color)'
                            }}
                          >
                            {(user.status || 'active') === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => deleteUser(user.id)}
                            style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginTop: 'var(--spacing-xl)'
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--primary-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {users.length}
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
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--success-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {users.filter(u => (u.status || 'active') === 'active').length}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Active Users
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--danger-color)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--dark-gray)',
              textTransform: 'uppercase'
            }}>
              Suspended Users
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;