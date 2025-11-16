const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// Get menu by restaurant
router.get('/restaurant/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;

  const query = `SELECT mi.*, mc.category_name 
                 FROM menu_items mi 
                 LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id 
                 WHERE mi.restaurant_id = ? AND mi.is_available = true 
                 ORDER BY mc.category_name, mi.name`;

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching menu', error: err });
    }
    res.status(200).json(results);
  });
});

// Get menu categories by restaurant
router.get('/categories/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;

  const query = `SELECT DISTINCT mc.* FROM menu_categories mc 
                 JOIN menu_items mi ON mc.category_id = mi.category_id 
                 WHERE mi.restaurant_id = ? 
                 ORDER BY mc.category_name`;

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching categories', error: err });
    }
    res.status(200).json(results);
  });
});

// Search menu items
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const searchQuery = `%${query}%`;

  const sql = `SELECT mi.*, mc.category_name, r.name as restaurant_name 
               FROM menu_items mi 
               LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id 
               LEFT JOIN restaurants r ON mi.restaurant_id = r.restaurant_id 
               WHERE (mi.name LIKE ? OR mi.description LIKE ?) AND mi.is_available = true
               ORDER BY r.name, mc.category_name LIMIT 50`;

  db.query(sql, [searchQuery, searchQuery], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching menu items', error: err });
    }
    res.status(200).json(results);
  });
});

// Get single menu item
router.get('/item/:itemId', (req, res) => {
  const { itemId } = req.params;

  const query = `SELECT mi.*, mc.category_name 
                 FROM menu_items mi 
                 LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id 
                 WHERE mi.item_id = ?`;

  db.query(query, [itemId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching menu item', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Create menu item (restaurant owner)
router.post('/', verifyToken, isRestaurant, (req, res) => {
  const { restaurant_id, category_id, name, description, price, image_url, preparation_time, is_vegetarian } = req.body;

  if (!restaurant_id || !category_id || !name || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const item = {
    restaurant_id,
    category_id,
    name,
    description: description || '',
    price,
    image_url: image_url || '',
    preparation_time: preparation_time || 15,
    is_vegetarian: is_vegetarian || false,
    is_available: true,
    created_at: new Date()
  };

  db.query('INSERT INTO menu_items SET ?', item, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating menu item', error: err });
    }

    res.status(201).json({
      message: 'Menu item created successfully',
      itemId: result.insertId
    });
  });
});

// Update menu item
router.put('/:id', verifyToken, isRestaurant, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, preparation_time, is_vegetarian, is_available } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price) updates.price = price;
  if (image_url !== undefined) updates.image_url = image_url;
  if (preparation_time) updates.preparation_time = preparation_time;
  if (is_vegetarian !== undefined) updates.is_vegetarian = is_vegetarian;
  if (is_available !== undefined) updates.is_available = is_available;
  updates.updated_at = new Date();

  db.query('UPDATE menu_items SET ? WHERE item_id = ?', [updates, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating menu item', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item updated successfully' });
  });
});

// Delete menu item
router.delete('/:id', verifyToken, isRestaurant, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM menu_items WHERE item_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting menu item', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  });
});

module.exports = router;
