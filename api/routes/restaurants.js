const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isAdmin, isRestaurant } = require('../../middleware/auth');

// Get all restaurants
router.get('/', (req, res) => {
  const query = `SELECT r.*, u.first_name, u.last_name, u.email, u.phone 
                 FROM restaurants r 
                 JOIN users u ON r.owner_id = u.user_id 
                 ORDER BY r.rating DESC`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching restaurants', error: err });
    }
    res.status(200).json(results);
  });
});

// Get single restaurant
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT r.*, u.first_name, u.last_name, u.email, u.phone 
                 FROM restaurants r 
                 JOIN users u ON r.owner_id = u.user_id 
                 WHERE r.restaurant_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching restaurant', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Search restaurants
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const searchQuery = `%${query}%`;

  const sql = `SELECT r.*, u.first_name, u.last_name 
               FROM restaurants r 
               JOIN users u ON r.owner_id = u.user_id 
               WHERE r.name LIKE ? OR r.cuisine LIKE ? OR r.address LIKE ?
               ORDER BY r.rating DESC LIMIT 20`;

  db.query(sql, [searchQuery, searchQuery, searchQuery], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error searching restaurants', error: err });
    }
    res.status(200).json(results);
  });
});

// Get restaurant by owner (authenticated)
router.get('/owner/restaurant', verifyToken, isRestaurant, (req, res) => {
  const query = `SELECT * FROM restaurants WHERE owner_id = ?`;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching restaurant', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Create restaurant (admin)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { owner_id, name, cuisine, address, phone, email, delivery_fee, min_order, rating } = req.body;

  if (!owner_id || !name || !cuisine || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const restaurant = {
    owner_id,
    name,
    cuisine,
    address,
    phone: phone || '',
    email: email || '',
    delivery_fee: delivery_fee || 2.99,
    min_order: min_order || 0,
    rating: rating || 4.5,
    is_active: true,
    created_at: new Date()
  };

  db.query('INSERT INTO restaurants SET ?', restaurant, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating restaurant', error: err });
    }

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurantId: result.insertId
    });
  });
});

// Update restaurant
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, cuisine, address, phone, email, delivery_fee, min_order, is_active } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (cuisine) updates.cuisine = cuisine;
  if (address) updates.address = address;
  if (phone) updates.phone = phone;
  if (email) updates.email = email;
  if (delivery_fee !== undefined) updates.delivery_fee = delivery_fee;
  if (min_order !== undefined) updates.min_order = min_order;
  if (is_active !== undefined) updates.is_active = is_active;
  updates.updated_at = new Date();

  db.query('UPDATE restaurants SET ? WHERE restaurant_id = ?', [updates, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating restaurant', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ message: 'Restaurant updated successfully' });
  });
});

// Delete restaurant (admin)
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM restaurants WHERE restaurant_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting restaurant', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ message: 'Restaurant deleted successfully' });
  });
});

module.exports = router;
