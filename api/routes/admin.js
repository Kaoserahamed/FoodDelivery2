const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isAdmin } = require('../../middleware/auth');

// Get dashboard statistics
router.get('/dashboard/stats', verifyToken, isAdmin, (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT SUM(total_amount) FROM orders WHERE status = 'delivered') as total_revenue,
      (SELECT COUNT(*) FROM restaurants) as total_restaurants,
      (SELECT COUNT(*) FROM users WHERE user_type = 'customer') as total_customers
  `;

  db.query(statsQuery, (err, stats) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching stats', error: err });
    }

    res.status(200).json(stats[0]);
  });
});

// Get all users
router.get('/users', verifyToken, isAdmin, (req, res) => {
  const query = `SELECT user_id, first_name, last_name, email, phone, user_type, created_at 
                 FROM users 
                 ORDER BY created_at DESC`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }
    res.status(200).json(results);
  });
});

// Get all restaurants with details
router.get('/restaurants', verifyToken, isAdmin, (req, res) => {
  const query = `SELECT r.*, u.first_name, u.last_name, u.email, 
                        (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.restaurant_id) as total_orders,
                        (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.restaurant_id) as total_items
                 FROM restaurants r 
                 JOIN users u ON r.owner_id = u.user_id 
                 ORDER BY r.created_at DESC`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching restaurants', error: err });
    }
    res.status(200).json(results);
  });
});

// Get all orders
router.get('/orders', verifyToken, isAdmin, (req, res) => {
  const query = `SELECT o.*, 
                        u.first_name, u.last_name, u.email,
                        r.name as restaurant_name
                 FROM orders o 
                 JOIN users u ON o.user_id = u.user_id 
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                 ORDER BY o.created_at DESC LIMIT 100`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders', error: err });
    }
    res.status(200).json(results);
  });
});

// Get admin logs
router.get('/logs', verifyToken, isAdmin, (req, res) => {
  const query = `SELECT al.*, u.first_name, u.last_name 
                 FROM admin_logs al 
                 LEFT JOIN users u ON al.admin_id = u.user_id 
                 ORDER BY al.created_at DESC LIMIT 200`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching logs', error: err });
    }
    res.status(200).json(results);
  });
});

// Suspend/Activate restaurant
router.put('/restaurants/:restaurantId/toggle', verifyToken, isAdmin, (req, res) => {
  const { restaurantId } = req.params;

  db.query('SELECT is_active FROM restaurants WHERE restaurant_id = ?', [restaurantId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching restaurant', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const newStatus = !results[0].is_active;

    db.query('UPDATE restaurants SET is_active = ? WHERE restaurant_id = ?', [newStatus, restaurantId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating restaurant', error: err });
      }

      res.status(200).json({ 
        message: newStatus ? 'Restaurant activated' : 'Restaurant suspended'
      });
    });
  });
});

// Deactivate user
router.put('/users/:userId/deactivate', verifyToken, isAdmin, (req, res) => {
  const { userId } = req.params;

  db.query('UPDATE users SET is_active = false WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deactivating user', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deactivated successfully' });
  });
});

// Get orders by status
router.get('/orders/status/:status', verifyToken, isAdmin, (req, res) => {
  const { status } = req.params;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const query = `SELECT o.*, u.first_name, u.last_name, r.name as restaurant_name 
                 FROM orders o 
                 JOIN users u ON o.user_id = u.user_id 
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                 WHERE o.status = ? 
                 ORDER BY o.created_at DESC`;

  db.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders', error: err });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
