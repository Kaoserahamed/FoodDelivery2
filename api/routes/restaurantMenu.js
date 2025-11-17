const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// Get all menu categories for restaurant
router.get('/categories', verifyToken, isRestaurant, async (req, res) => {
  console.log('📂 GET /categories - userId:', req.userId);
  
  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      console.log('❌ Restaurant not found for userId:', req.userId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;
    console.log('✅ Restaurant found:', restaurantId);

    const [categories] = await db.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order', 
      [restaurantId]
    );

    console.log('✅ Categories fetched:', categories.length);

    res.status(200).json({ 
      success: true, 
      categories: categories 
    });

  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    return res.status(500).json({ 
      message: 'Error fetching categories', 
      error: err.message 
    });
  }
});

// Create menu category
router.post('/categories', verifyToken, isRestaurant, async (req, res) => {
  console.log('➕ POST /categories - userId:', req.userId);
  
  const { name, display_order } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const [result] = await db.query(
      'INSERT INTO menu_categories (restaurant_id, name, display_order) VALUES (?, ?, ?)', 
      [restaurantId, name, display_order || 0]
    );

    console.log('✅ Category created:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      categoryId: result.insertId
    });

  } catch (err) {
    console.error('❌ Error creating category:', err);
    return res.status(500).json({ 
      message: 'Error creating category', 
      error: err.message 
    });
  }
});

// Get all menu items for restaurant
router.get('/items', verifyToken, isRestaurant, async (req, res) => {
  console.log('🍽️ GET /items - userId:', req.userId);
  
  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      console.log('❌ Restaurant not found for userId:', req.userId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;
    console.log('✅ Restaurant found:', restaurantId);

    // Check what columns exist in your table
    const query = `
      SELECT mi.*, mc.name as category_name 
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id 
      WHERE mi.restaurant_id = ? 
      ORDER BY mc.display_order, mi.name
    `;

    const [items] = await db.query(query, [restaurantId]);

    console.log('✅ Menu items fetched:', items.length);

    res.status(200).json({ 
      success: true, 
      items: items 
    });

  } catch (err) {
    console.error('❌ Error fetching menu items:', err);
    return res.status(500).json({ 
      message: 'Error fetching menu items', 
      error: err.message 
    });
  }
});

// Create menu item
router.post('/items', verifyToken, isRestaurant, async (req, res) => {
  console.log('➕ POST /items - userId:', req.userId, 'body:', req.body);
  
  const { category_id, name, description, price, image_url, is_vegetarian, preparation_time, is_available } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const query = `INSERT INTO menu_items 
      (restaurant_id, category_id, name, description, price, image_url, is_vegetarian, preparation_time, is_available) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(query, [
      restaurantId,
      category_id || null,
      name,
      description || '',
      price,
      image_url || null,
      is_vegetarian !== undefined ? is_vegetarian : false,
      preparation_time || 15,
      is_available !== undefined ? is_available : true
    ]);

    console.log('✅ Menu item created:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      itemId: result.insertId
    });

  } catch (err) {
    console.error('❌ Error creating menu item:', err);
    return res.status(500).json({ 
      message: 'Error creating menu item', 
      error: err.message 
    });
  }
});

// Update menu item
router.put('/items/:id', verifyToken, isRestaurant, async (req, res) => {
  console.log('📝 PUT /items/:id - itemId:', req.params.id, 'userId:', req.userId);
  
  const itemId = req.params.id;
  const updates = req.body;

  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    // Verify item belongs to restaurant - check which column name is correct
    const [items] = await db.query(
      'SELECT * FROM menu_items WHERE (item_id = ? OR menu_item_id = ?) AND restaurant_id = ?', 
      [itemId, itemId, restaurantId]
    );

    if (items.length === 0) {
      console.log('❌ Menu item not found:', itemId);
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Build update query
    const allowedFields = ['category_id', 'name', 'description', 'price', 'image_url', 'is_vegetarian', 'is_available', 'preparation_time'];
    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Check which primary key column exists
    const primaryKey = items[0].item_id !== undefined ? 'item_id' : 'menu_item_id';
    updateValues.push(itemId);

    const [result] = await db.query(
      `UPDATE menu_items SET ${updateFields.join(', ')} WHERE ${primaryKey} = ?`, 
      updateValues
    );

    console.log('✅ Menu item updated');

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully'
    });

  } catch (err) {
    console.error('❌ Error updating item:', err);
    return res.status(500).json({ 
      message: 'Error updating item', 
      error: err.message 
    });
  }
});

// Delete menu item
router.delete('/items/:id', verifyToken, isRestaurant, async (req, res) => {
  console.log('🗑️ DELETE /items/:id - itemId:', req.params.id, 'userId:', req.userId);
  
  const itemId = req.params.id;

  try {
    const [restaurants] = await db.query(
      'SELECT restaurant_id FROM restaurants WHERE user_id = ?', 
      [req.userId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    // Try both possible primary key names
    const [result] = await db.query(
      'DELETE FROM menu_items WHERE (item_id = ? OR menu_item_id = ?) AND restaurant_id = ?', 
      [itemId, itemId, restaurantId]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Menu item not found:', itemId);
      return res.status(404).json({ message: 'Menu item not found' });
    }

    console.log('✅ Menu item deleted');

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (err) {
    console.error('❌ Error deleting item:', err);
    return res.status(500).json({ 
      message: 'Error deleting item', 
      error: err.message 
    });
  }
});

module.exports = router;