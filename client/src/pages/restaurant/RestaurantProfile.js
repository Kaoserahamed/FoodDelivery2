import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import axios from 'axios';

const RestaurantProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    cuisine_type: '',
    is_open: true,
    delivery_fee: '',
    delivery_time: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/restaurant/profile', config);
      setProfile(response.data.restaurant);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put('/api/restaurant/profile', profile, config);
      
      if (response.data.success) {
        // Update localStorage
        localStorage.setItem('restaurant', JSON.stringify(response.data.restaurant));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const newStatus = !profile.is_open;
      await axios.put('/api/restaurant/status', { is_open: newStatus }, config);
      
      setProfile({ ...profile, is_open: newStatus });
      alert(`Restaurant ${newStatus ? 'opened' : 'closed'} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
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
          <h1 className="section-title">Restaurant Profile</h1>
          <p className="section-subtitle">Manage your restaurant information and settings</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 'var(--spacing-xl)'
        }}>
          {/* Profile Form */}
          <div style={{
            backgroundColor: 'var(--white)',
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Restaurant Information</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cuisine Type</label>
                <select
                  className="form-control"
                  value={profile.cuisine_type}
                  onChange={(e) => setProfile({...profile, cuisine_type: e.target.value})}
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
                  className="form-control"
                  value={profile.description}
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Delivery Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={profile.delivery_fee}
                    onChange={(e) => setProfile({...profile, delivery_fee: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Time (minutes)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 30-45"
                    value={profile.delivery_time}
                    onChange={(e) => setProfile({...profile, delivery_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Restaurant Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={profile.image}
                  onChange={(e) => setProfile({...profile, image: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Status & Quick Actions */}
          <div>
            {/* Restaurant Status */}
            <div style={{
              backgroundColor: 'var(--white)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Restaurant Status</h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-md)'
              }}>
                <span>Currently:</span>
                <span className={`badge ${profile.is_open ? 'badge-success' : 'badge-danger'}`}>
                  {profile.is_open ? 'Open' : 'Closed'}
                </span>
              </div>

              <button 
                className={`btn ${profile.is_open ? 'btn-outline' : 'btn-primary'} btn-block`}
                onClick={toggleStatus}
                style={profile.is_open ? { color: 'var(--danger-color)', borderColor: 'var(--danger-color)' } : {}}
              >
                {profile.is_open ? 'Close Restaurant' : 'Open Restaurant'}
              </button>
            </div>

            {/* Restaurant Preview */}
            <div style={{
              backgroundColor: 'var(--white)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Preview</h4>
              
              {profile.image && (
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)'
                  }}
                />
              )}

              <h5 style={{ marginBottom: 'var(--spacing-xs)' }}>{profile.name}</h5>
              <p style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--medium-gray)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {profile.cuisine_type}
              </p>
              <p style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--dark-gray)',
                marginBottom: 'var(--spacing-md)'
              }}>
                {profile.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--dark-gray)'
              }}>
                <span><i className="fas fa-clock"></i> {profile.delivery_time || 'N/A'}</span>
                <span><i className="fas fa-dollar-sign"></i> ${profile.delivery_fee || 'Free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantProfile;