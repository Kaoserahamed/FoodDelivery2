const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// Get all restaurant's orders (with filters)
router.get('/', verifyToken, isRestaurant, async (req, res) => {
  try {
    console.log('📦 GET /restaurant/orders - userId:', req.userId);
    const { status, date, sort = 'latest', limit = 20, offset = 0 } = req.query;

    // Get restaurant ID
    const [restaurants] = await db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId]);

    if (restaurants.length === 0) {
      console.error('❌ Restaurant not found for userId:', req.userId);
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;
    console.log('✅ Restaurant found - ID:', restaurantId);

    let query = `
      SELECT 
        o.order_id,
        o.user_id,
        o.restaurant_id,
        o.delivery_address,
        o.special_instructions,
        o.subtotal,
        o.delivery_fee,
        o.tax,
        o.total_amount,
        o.status,
        o.order_date,
        o.actual_delivery_time,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        COUNT(oi.order_item_id) AS item_count,
        SUM(oi.quantity) AS total_items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.restaurant_id = ?
    `;

    const params = [restaurantId];

    // Filter by status
    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    // Filter by date
    if (date) {
      query += ' AND DATE(o.order_date) = ?';
      params.push(date);
    }

    // Add grouping
    query += ' GROUP BY o.order_id';

    // Add sorting
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY o.order_date ASC';
        break;
      case 'highest_amount':
        query += ' ORDER BY o.total_amount DESC';
        break;
      case 'lowest_amount':
        query += ' ORDER BY o.total_amount ASC';
        break;
      default: // latest
        query += ' ORDER BY o.order_date DESC';
    }

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    console.log('🔍 Executing orders query for restaurant:', restaurantId);
    const [orders] = await db.query(query, params);
    console.log('✅ Orders fetched:', orders.length);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE restaurant_id = ?';
    const countParams = [restaurantId];

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (date) {
      countQuery += ' AND DATE(order_date) = ?';
      countParams.push(date);
    }

    const [countResult] = await db.query(countQuery, countParams);

    console.log('✅ Sending response with', orders.length, 'orders');
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /restaurant/orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Get single order details with items
router.get('/:orderId', verifyToken, isRestaurant, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get restaurant ID
    const [restaurants] = await db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId]);

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        u.address AS customer_default_address
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ? AND o.restaurant_id = ?
    `;

    const [orders] = await db.query(orderQuery, [orderId, restaurantId]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        m.name AS menu_item_name,
        m.description AS menu_item_description
      FROM order_items oi
      LEFT JOIN menu_items m ON oi.item_id = m.item_id
      WHERE oi.order_id = ?
    `;

    const [items] = await db.query(itemsQuery, [orderId]);

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
  }
});

// Update order status
router.put('/:orderId/status', verifyToken, isRestaurant, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    console.log(`📝 Updating order ${orderId} to status: ${status}`);

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Get restaurant ID
    const [restaurants] = await db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId]);

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    // Verify order belongs to restaurant
    const [orders] = await db.query(
      'SELECT order_id FROM orders WHERE order_id = ? AND restaurant_id = ?',
      [orderId, restaurantId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to your restaurant' });
    }

    // Update order status
    let updateQuery = 'UPDATE orders SET status = ?';
    const params = [status];

    if (status === 'delivered') {
      updateQuery += ', actual_delivery_time = NOW()';
    }

    updateQuery += ' WHERE order_id = ?';
    params.push(orderId);

    await db.query(updateQuery, params);

    console.log(`✅ Order ${orderId} updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      orderId: parseInt(orderId),
      newStatus: status
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', verifyToken, isRestaurant, (req, res) => {
  const { date } = req.query;

  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const dateFilter = date ? `DATE(o.order_date) = '${date}'` : 'DATE(o.order_date) = CURDATE()';

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
        COUNT(CASE WHEN o.status = 'confirmed' THEN 1 END) AS confirmed_orders,
        COUNT(CASE WHEN o.status = 'preparing' THEN 1 END) AS preparing_orders,
        COUNT(CASE WHEN o.status = 'ready' THEN 1 END) AS ready_orders,
        COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) AS delivered_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled_orders,
        SUM(o.total_amount) AS total_revenue,
        AVG(o.total_amount) AS average_order_value,
        SUM(oi.quantity) AS total_items_sold
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.restaurant_id = ? AND ${dateFilter}
    `;

    db.query(statsQuery, [restaurantId], (err, stats) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching statistics', error: err });
      }

      res.status(200).json({
        success: true,
        stats: stats[0] || {}
      });
    });
  });
});

// Get orders by status count
router.get('/stats/by-status', verifyToken, isRestaurant, (req, res) => {
  db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [req.userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const restaurantId = restaurants[0].restaurant_id;

    const query = `
      SELECT 
        status,
        COUNT(*) AS count
      FROM orders
      WHERE restaurant_id = ?
      GROUP BY status
    `;

    db.query(query, [restaurantId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching status counts', error: err });
      }

      // Format results
      const statusCounts = {
        pending: 0,
        accepted: 0,
        confirmed: 0,
        preparing: 0,
        ready: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
      };

      results.forEach(result => {
        if (statusCounts.hasOwnProperty(result.status)) {
          statusCounts[result.status] = result.count;
        }
      });

      res.status(200).json({
        success: true,
        statusCounts
      });
    });
  });
});

module.exports = router;