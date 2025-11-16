const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// Get all menu categories for restaurant
router.get('/categories', verifyToken, isRestaurant, (req, res) => {
  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    db.query('SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order', [restaurantId], (err, categories) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching categories', error: err });
      }

      res.status(200).json({ success: true, categories });
    });
  });
});

// Create menu category
router.post('/categories', verifyToken, isRestaurant, (req, res) => {
  const { name, display_order } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    db.query('INSERT INTO menu_categories (restaurant_id, name, display_order) VALUES (?, ?, ?)', 
      [restaurantId, name, display_order || 0], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating category', error: err });
      }

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        categoryId: result.insertId
      });
    });
  });
});

// Get all menu items for restaurant
router.get('/items', verifyToken, isRestaurant, (req, res) => {
  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const query = `
      SELECT mi.*, mc.name as category_name 
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id 
      WHERE mi.restaurant_id = ? 
      ORDER BY mc.display_order, mi.name
    `;

    db.query(query, [restaurantId], (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching menu items', error: err });
      }

      res.status(200).json({ success: true, items });
    });
  });
});

// Create menu item
router.post('/items', verifyToken, isRestaurant, (req, res) => {
  const { category_id, name, description, price, image_url, is_vegetarian, preparation_time } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const query = `INSERT INTO menu_items 
      (restaurant_id, category_id, name, description, price, image_url, is_vegetarian, preparation_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
      restaurantId,
      category_id || null,
      name,
      description || '',
      price,
      image_url || null,
      is_vegetarian || false,
      preparation_time || 15
    ], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating menu item', error: err });
      }

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        itemId: result.insertId
      });
    });
  });
});

// Update menu item
router.put('/items/:id', verifyToken, isRestaurant, (req, res) => {
  const itemId = req.params.id;
  const updates = req.body;

  // Get restaurant ID
  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    // Verify item belongs to restaurant
    db.query('SELECT item_id FROM menu_items WHERE item_id = ? AND restaurant_id = ?', 
      [itemId, restaurantId], (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Error finding item', error: err });
      }

      if (items.length === 0) {
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

      updateValues.push(itemId);

      db.query(`UPDATE menu_items SET ${updateFields.join(', ')}, updated_at = NOW() WHERE item_id = ?`, 
        updateValues, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating item', error: err });
        }

        res.status(200).json({
          success: true,
          message: 'Menu item updated successfully'
        });
      });
    });
  });
});

// Delete menu item
router.delete('/items/:id', verifyToken, isRestaurant, (req, res) => {
  const itemId = req.params.id;

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    db.query('DELETE FROM menu_items WHERE item_id = ? AND restaurant_id = ?', 
      [itemId, restaurantId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting item', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    });
  });
});

module.exports = router;