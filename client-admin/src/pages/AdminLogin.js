import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/dashboard');
    }

    // Load remembered email
    const rememberEmail = localStorage.getItem('rememberAdminEmail');
    if (rememberEmail) {
      setFormData(prev => ({ ...prev, email: rememberEmail }));
      setRemember(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Sending admin login request for:', formData.email);

      const response = await authAPI.login(formData);

      console.log('📥 Response received:', response.status);

      // Check if user is admin
      if (response.data.user.userType !== 'admin') {
        throw new Error('Access denied. Admin credentials required.');
      }

      // Store admin authentication data
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));

      if (remember) {
        localStorage.setItem('rememberAdminEmail', formData.email);
      } else {
        localStorage.removeItem('rememberAdminEmail');
      }

      console.log('✅ Admin login successful');
      navigate('/dashboard');

    } catch (error) {
      console.error('❌ Admin login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.message.includes('Access denied')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Invalid email or password';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
            <i className="fas fa-shield-alt" style={{ fontSize: '48px', color: 'var(--primary-color)' }}></i>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '20px'
          }}>
            <i className="fas fa-crown"></i> Admin Access
          </div>
          <h2 className="auth-title">Admin Login</h2>
          <p className="auth-subtitle">Access the admin dashboard</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            color: 'var(--danger-color)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            borderLeft: '4px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="admin@tastenow.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter admin password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group d-flex justify-between align-center">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            <i className="fas fa-sign-in-alt"></i> {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ textAlign: 'center', color: 'var(--medium-gray)', fontSize: '14px' }}>
            <i className="fas fa-info-circle"></i> Admin access only
          </p>
        </div>

        {/* Test Credentials Info */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          borderLeft: '4px solid #667eea' 
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            <strong>Test Credentials:</strong><br />
            Email: admin@tastenow.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;