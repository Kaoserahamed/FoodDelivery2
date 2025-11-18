const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isAdmin } = require('../../middleware/auth');

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered') as total_revenue,
        (SELECT COUNT(*) FROM restaurants) as total_restaurants,
        (SELECT COUNT(*) FROM users WHERE user_type = 'customer') as total_customers
    `;

    const [stats] = await db.query(statsQuery);
    console.log('✅ Stats fetched:', stats[0]);
    
    res.status(200).json(stats[0]);
  } catch (err) {
    console.error('❌ Error fetching stats:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    console.log('👥 Fetching all users...');

    const query = `SELECT user_id, name, email, phone, user_type, address, created_at 
                   FROM users 
                   ORDER BY created_at DESC`;

    const [results] = await db.query(query);
    console.log(`✅ Fetched ${results.length} users`);
    
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Get all restaurants with details
router.get('/restaurants', async (req, res) => {
  try {
    console.log('🏪 Fetching all restaurants...');

    const query = `SELECT r.*, 
                          (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.restaurant_id) as total_orders,
                          (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.restaurant_id) as total_items
                   FROM restaurants r 
                   ORDER BY r.created_at DESC`;

    const [results] = await db.query(query);
    console.log(`✅ Fetched ${results.length} restaurants`);
    
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching restaurants:', err);
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    console.log('📦 Fetching all orders...');

    const query = `SELECT o.*, 
                          u.name as customer_name, u.email as customer_email,
                          r.name as restaurant_name
                   FROM orders o 
                   JOIN users u ON o.user_id = u.user_id 
                   JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                   ORDER BY o.order_date DESC LIMIT 100`;

    const [results] = await db.query(query);
    console.log(`✅ Fetched ${results.length} orders`);
    
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Get top restaurants
router.get('/top-restaurants', async (req, res) => {
  try {
    console.log('🏆 Fetching top restaurants...');

    const query = `
      SELECT r.restaurant_id, r.name, r.rating, r.image_url,
             COUNT(o.order_id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM restaurants r
      LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id 
        AND o.order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY r.restaurant_id
      ORDER BY total_revenue DESC
      LIMIT 5
    `;

    const [results] = await db.query(query);
    console.log(`✅ Fetched ${results.length} top restaurants`);
    
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching top restaurants:', err);
    res.status(500).json({ message: 'Error fetching top restaurants', error: err.message });
  }
});

// Suspend/Activate restaurant
router.put('/restaurants/:restaurantId/toggle', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`🔄 Toggling restaurant status: ${restaurantId}`);

    const [results] = await db.query('SELECT is_open FROM restaurants WHERE restaurant_id = ?', [restaurantId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const newStatus = !results[0].is_open;
    await db.query('UPDATE restaurants SET is_open = ? WHERE restaurant_id = ?', [newStatus, restaurantId]);

    console.log(`✅ Restaurant ${restaurantId} status updated to: ${newStatus}`);
    res.status(200).json({ 
      message: newStatus ? 'Restaurant activated' : 'Restaurant suspended',
      is_open: newStatus
    });
  } catch (err) {
    console.error('❌ Error updating restaurant:', err);
    res.status(500).json({ message: 'Error updating restaurant', error: err.message });
  }
});

// Get orders by status
router.get('/orders/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    console.log(`📦 Fetching orders with status: ${status}`);

    const query = `SELECT o.*, u.name as customer_name, r.name as restaurant_name 
                   FROM orders o 
                   JOIN users u ON o.user_id = u.user_id 
                   JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                   WHERE o.status = ? 
                   ORDER BY o.order_date DESC`;

    const [results] = await db.query(query, [status]);
    console.log(`✅ Fetched ${results.length} orders with status ${status}`);
    
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

module.exports = router;
