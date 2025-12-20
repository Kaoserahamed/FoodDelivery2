import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    try {
      const response = await authAPI.login(formData);
      
      // Backend returns success in message, not success field
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
        window.location.reload(); // Refresh to update header
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <i className="fas fa-utensils" style={{ fontSize: '60px', color: 'var(--primary-color)' }}></i>
              <h1 style={{ color: 'var(--primary-color)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-xl)' }}>
                TasteNow
              </h1>
            </Link>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
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
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;