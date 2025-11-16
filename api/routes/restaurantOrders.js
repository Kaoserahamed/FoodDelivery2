const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// Get all orders for the restaurant
router.get('/', verifyToken, isRestaurant, (req, res) => {
  const { status } = req.query;

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) return res.status(500).json({ message: 'Error finding restaurant', error: err });

    if (restaurants.length === 0)
      return res.status(404).json({ message: 'Restaurant not found' });

    const restaurantId = restaurants[0].restaurant_id;

    let query = `
      SELECT o.*, u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
      COUNT(oi.order_item_id) AS item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.restaurant_id = ?
    `;
    const params = [restaurantId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.order_id ORDER BY o.order_date DESC';

    db.query(query, params, (err, orders) => {
      if (err) return res.status(500).json({ message: 'Error fetching orders', error: err });

      res.status(200).json({ success: true, orders });
    });
  });
});

// Get single order
router.get('/:id', verifyToken, isRestaurant, (req, res) => {
  const orderId = req.params.id;

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) return res.status(500).json({ message: 'Error finding restaurant', error: err });

    if (restaurants.length === 0)
      return res.status(404).json({ message: 'Restaurant not found' });

    const restaurantId = restaurants[0].restaurant_id;

    const orderQuery = `
      SELECT o.*, u.name AS customer_name, u.phone AS customer_phone,
             u.email AS customer_email, u.address AS customer_default_address
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ? AND o.restaurant_id = ?
    `;

    db.query(orderQuery, [orderId, restaurantId], (err, orders) => {
      if (err) return res.status(500).json({ message: 'Error fetching order', error: err });

      if (orders.length === 0)
        return res.status(404).json({ message: 'Order not found' });

      const order = orders[0];

      db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
        if (err) return res.status(500).json({ message: 'Error fetching order items', error: err });

        order.items = items;

        res.status(200).json({ success: true, order });
      });
    });
  });
});

// Update order status
router.put('/:id/status', verifyToken, isRestaurant, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) return res.status(500).json({ message: 'Error finding restaurant', error: err });

    if (restaurants.length === 0)
      return res.status(404).json({ message: 'Restaurant not found' });

    const restaurantId = restaurants[0].restaurant_id;

    let query = 'UPDATE orders SET status = ?';
    const params = [status];

    if (status === 'delivered') {
      query += ', actual_delivery_time = NOW()';
    }

    query += ' WHERE order_id = ? AND restaurant_id = ?';
    params.push(orderId, restaurantId);

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating order status', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully'
      });
    });
  });
});

// Dashboard stats route
router.get('/stats/dashboard', verifyToken, isRestaurant, (req, res) => {
  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err)
      return res.status(500).json({ message: 'Error finding restaurant', error: err });

    if (restaurants.length === 0)
      return res.status(404).json({ message: 'Restaurant not found' });

    const restaurantId = restaurants[0].restaurant_id;

    const query = `
      SELECT 
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
        COUNT(CASE WHEN o.status = 'confirmed' THEN 1 END) AS confirmed_orders,
        COUNT(CASE WHEN o.status = 'preparing' THEN 1 END) AS preparing_orders,
        COUNT(CASE WHEN o.status = 'ready' THEN 1 END) AS ready_orders,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) AS delivered_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled_orders,
        SUM(CASE WHEN DATE(o.order_date) = CURDATE() THEN o.total_amount ELSE 0 END) AS today_revenue,
        SUM(CASE WHEN WEEK(o.order_date) = WEEK(CURDATE()) THEN o.total_amount ELSE 0 END) AS week_revenue,
        SUM(CASE WHEN MONTH(o.order_date) = MONTH(CURDATE()) THEN o.total_amount ELSE 0 END) AS month_revenue,
        SUM(o.total_amount) AS total_revenue
      FROM orders o
      WHERE o.restaurant_id = ?
    `;

    db.query(query, [restaurantId], (err, stats) => {
      if (err)
        return res.status(500).json({ message: 'Error fetching statistics', error: err });

      res.status(200).json({ success: true, stats: stats[0] });
    });
  });
});

module.exports = router;
