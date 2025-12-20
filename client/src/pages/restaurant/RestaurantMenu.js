import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import axios from 'axios';

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_available: true
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [itemsRes, categoriesRes] = await Promise.all([
        axios.get('/api/restaurant/menu/items', config),
        axios.get('/api/restaurant/menu/categories', config)
      ]);

      setMenuItems(itemsRes.data.items || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingItem) {
        await axios.put(`/api/restaurant/menu/items/${editingItem.id}`, formData, config);
      } else {
        await axios.post('/api/restaurant/menu/items', formData, config);
      }

      fetchMenuData();
      resetForm();
      alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || '',
      is_available: item.is_available
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('restaurantToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/restaurant/menu/items/${id}`, config);
      fetchMenuData();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      is_available: true
    });
    setEditingItem(null);
    setShowAddModal(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <h1 className="section-title">Menu Management</h1>
            <p className="section-subtitle">Manage your restaurant menu items</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i> Add New Item
          </button>
        </div>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--dark-gray)' }}>
            <i className="fas fa-utensils" style={{ fontSize: '80px', color: 'var(--medium-gray)', marginBottom: 'var(--spacing-lg)' }}></i>
            <h3>No menu items yet</h3>
            <p>Add your first menu item to get started</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {menuItems.map((item) => (
              <div key={item.id} className="card">
                <img 
                  src={item.image || '/api/placeholder/300/200'} 
                  alt={item.name}
                  className="card-img"
                />
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-sm)' }}>
                    <h4 className="card-title">{item.name}</h4>
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="card-text">{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <span className="price">${item.price}</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--medium-gray)' }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(item)}
                      style={{ flex: 1 }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(item.id)}
                      style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <button 
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 'var(--font-size-2xl)',
                    cursor: 'pointer',
                    color: 'var(--medium-gray)'
                  }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    Available for ordering
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={resetForm} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RestaurantMenu;