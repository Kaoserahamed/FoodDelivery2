import React, { useState, useEffect } from 'react';
import RestaurantHeader from '../components/RestaurantHeader';
import RestaurantSidebar from '../components/RestaurantSidebar';
import { useRestaurant } from '../context/RestaurantContext';
import { uploadAPI } from '../utils/api';

const RestaurantMenu = () => {
  const { state, actions } = useRestaurant();
  const { menuItems, categories, loading, error } = state;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [returnToItemModal, setReturnToItemModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    display_order: 0
  });

  useEffect(() => {
    // Fetch menu data on component mount
    actions.fetchMenuData();
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) actions.clearError();
    };
  }, [error]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);

      const response = await uploadAPI.uploadImage(formDataUpload);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let updatedFormData = { ...formData };

      // Upload image if a new one is selected
      if (imageFile) {
        const imageUrl = await uploadImage();
        if (imageUrl) {
          updatedFormData.image_url = imageUrl;
        }
      }

      let result;
      if (editingItem) {
        result = await actions.updateMenuItem(editingItem.id, updatedFormData);
      } else {
        result = await actions.addMenuItem(updatedFormData);
      }

      if (result.success) {
        resetForm();
        alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
      } else {
        alert(result.error || 'Error saving item. Please try again.');
      }
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
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setImagePreview(item.image_url);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const result = await actions.deleteMenuItem(id);
    if (result.success) {
      alert('Item deleted successfully!');
    } else {
      alert(result.error || 'Error deleting item. Please try again.');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    const result = await actions.addCategory(categoryFormData);
    
    if (result.success) {
      resetCategoryForm();
      alert('Category added successfully!');
      
      // If we came from the item modal, return to it
      if (returnToItemModal) {
        setReturnToItemModal(false);
        setTimeout(() => {
          setShowAddModal(true);
        }, 300);
      }
    } else {
      alert(result.error || 'Error adding category. Please try again.');
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      display_order: 0
    });
    setShowCategoryModal(false);
  };

  const openCategoryFromItem = () => {
    setReturnToItemModal(true);
    setShowAddModal(false);
    setShowCategoryModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_available: true
    });
    setEditingItem(null);
    setShowAddModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const getImageUrl = (url) => {
    if (!url) return '/api/placeholder/300/200';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
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

  if (error) {
    return (
      <>
        <RestaurantHeader />
        <div className="container">
          <div className="layout-sidebar mt-xl mb-xl">
            <RestaurantSidebar />
            <main className="main-content" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
              <div className="text-center" style={{ padding: 'var(--spacing-3xl)', color: 'var(--danger-color)' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}></i>
                <h3>Error Loading Menu</h3>
                <p>{error}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => actions.fetchMenuData()}
                >
                  Try Again
                </button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RestaurantHeader />
      <div className="container">
        <div className="layout-sidebar mt-xl mb-xl">
          <RestaurantSidebar />
          <main className="main-content" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <div>
                <h1 className="section-title">Menu Management</h1>
                <p className="section-subtitle">Manage your restaurant menu items and categories</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <i className="fas fa-folder-plus"></i> Add Category
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="fas fa-plus"></i> Add New Item
                </button>
              </div>
            </div>

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
                      src={getImageUrl(item.image_url)} 
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
                    {/* Image Upload Section */}
                    <div className="form-group">
                      <label className="form-label">Item Image</label>
                      <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        {imagePreview && (
                          <img 
                            src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)}
                            alt="Item preview"
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-md)',
                              marginBottom: 'var(--spacing-md)'
                            }}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="form-control"
                        />
                        <small style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                          Upload an appetizing image of your dish (max 5MB)
                        </small>
                      </div>
                    </div>

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
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                        <select
                          className="form-control"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          style={{ flex: 1 }}
                        >
                          <option value="">
                            {categories.length === 0 ? 'No categories - Click + to add one' : 'Uncategorized (Optional)'}
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <button 
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={openCategoryFromItem}
                          title="Add new category"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <small style={{ color: categories.length === 0 ? 'var(--warning-color)' : 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                        {categories.length === 0 ? 'Add categories to organize your menu' : 'Optional - helps organize your menu'}
                      </small>
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
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading Image...' : editingItem ? 'Update Item' : 'Add Item'}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={resetForm} style={{ flex: 1 }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
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
                  maxWidth: '400px',
                  width: '90%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h3>Add New Category</h3>
                    <button 
                      onClick={resetCategoryForm}
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

                  <form onSubmit={handleCategorySubmit}>
                    <div className="form-group">
                      <label className="form-label">Category Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Appetizers, Main Course, Desserts"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        min="0"
                        value={categoryFormData.display_order}
                        onChange={(e) => setCategoryFormData({...categoryFormData, display_order: parseInt(e.target.value) || 0})}
                      />
                      <small style={{ color: 'var(--medium-gray)', fontSize: 'var(--font-size-sm)' }}>
                        Lower numbers appear first
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                      >
                        <i className="fas fa-save"></i> Add Category
                      </button>
                      <button type="button" className="btn btn-outline" onClick={resetCategoryForm} style={{ flex: 1 }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default RestaurantMenu;