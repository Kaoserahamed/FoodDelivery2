import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    description: '',
    cuisine_type: ''
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
      const response = await axios.post('/api/restaurant/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        cuisine_type: formData.cuisine_type
      });
      
      if (response.data.success) {
        localStorage.setItem('restaurantToken', response.data.token);
        localStorage.setItem('restaurant', JSON.stringify(response.data.restaurant));
        navigate('/restaurant/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
            <i className="fas fa-store" style={{ fontSize: '60px', color: 'var(--primary-color)' }}></i>
          </div>
          <h2 className="auth-title">Register Restaurant</h2>
          <p className="auth-subtitle">Join TasteNow as a restaurant partner</p>
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
            <label className="form-label">Restaurant Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter restaurant name"
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
              placeholder="Enter email address"
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
              placeholder="Enter phone number"
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
              placeholder="Enter restaurant address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cuisine Type</label>
            <select
              name="cuisine_type"
              className="form-control"
              value={formData.cuisine_type}
              onChange={handleChange}
              required
            >
              <option value="">Select cuisine type</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Mexican">Mexican</option>
              <option value="American">American</option>
              <option value="Thai">Thai</option>
              <option value="Japanese">Japanese</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Describe your restaurant"
              value={formData.description}
              onChange={handleChange}
              rows="3"
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
            {loading ? 'Creating Account...' : 'Register Restaurant'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/restaurant/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;