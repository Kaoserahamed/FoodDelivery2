import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Split name into first_name and last_name for backend
      const nameParts = formData.name.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ');

      const response = await authAPI.register({
        first_name,
        last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.address, // Backend expects 'city' field
        user_type: 'customer'
      });
      
      // Backend returns userId on successful registration, need to login after
      if (response.data.userId) {
        // Auto-login after successful registration
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          navigate('/');
          window.location.reload(); // Refresh to update header
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join TasteNow today</p>
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
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Enter your address"
              value={formData.address}
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;