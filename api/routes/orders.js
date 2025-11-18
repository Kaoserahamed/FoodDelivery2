const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../../middleware/auth');

// Create order (customer places order)
router.post('/create', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      restaurant_id,
      delivery_address,
      special_instructions,
      subtotal,
      delivery_fee,
      tax,
      total_amount,
      items
    } = req.body;

    console.log('📦 Creating order for user:', req.userId);
    console.log('Order data:', { restaurant_id, total_amount, items: items.length });

    // Validate required fields
    if (!restaurant_id || !delivery_address || !total_amount || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: restaurant_id, delivery_address, total_amount, items'
      });
    }

    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Start transaction
    await connection.beginTransaction();

    // 1. Create order
    const orderQuery = `
      INSERT INTO orders 
      (restaurant_id, user_id, order_number, delivery_address, special_instructions, subtotal, delivery_fee, tax, total_amount, status, order_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const [orderResult] = await connection.query(
      orderQuery,
      [restaurant_id, req.userId, orderNumber, delivery_address, special_instructions || '', subtotal, delivery_fee, tax, total_amount]
    );

    const orderId = orderResult.insertId;
    console.log('✅ Order created with ID:', orderId);

    // 2. Insert order items
    const itemInsertQuery = `
      INSERT INTO order_items 
      (order_id, item_id, item_name, item_price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connection.query(
        itemInsertQuery,
        [orderId, item.item_id || 0, item.item_name, item.item_price, item.quantity, item.subtotal]
      );
    }

    console.log(`✅ Inserted ${items.length} order items`);

    // Commit transaction
    await connection.commit();

    // Update restaurant's order count (async, don't wait)
    updateRestaurantOrderCount(restaurant_id);

    console.log('✅ Order placed successfully:', orderId);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId,
      orderNumber: orderNumber,
      orderData: {
        order_id: orderId,
        order_number: orderNumber,
        restaurant_id,
        total_amount,
        status: 'pending',
        created_at: new Date()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// Get customer's orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT 
        o.*,
        r.name AS restaurant_name,
        r.image_url AS restaurant_image,
        COUNT(oi.order_item_id) AS item_count
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = ?
    `;

    const params = [req.userId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.order_id ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?';
    const countParams = [req.userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);

    console.log(`✅ Fetched ${orders.length} orders for user ${req.userId}`);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Get single order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const query = `
      SELECT 
        o.*,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        r.phone AS restaurant_phone,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ? AND (o.user_id = ? OR (SELECT COUNT(*) FROM restaurants WHERE restaurant_id = o.restaurant_id AND user_id = ?) > 0)
    `;

    const [orders] = await db.query(query, [orderId, req.userId, req.userId]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    console.log(`✅ Fetched order ${orderId} with ${items.length} items`);

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
  }
});

// Cancel order
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Verify user owns the order
    const [orders] = await db.query(
      'SELECT order_id FROM orders WHERE order_id = ? AND user_id = ? AND status IN ("pending", "confirmed")', 
      [orderId, req.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled' });
    }

    const updateQuery = `
      UPDATE orders 
      SET status = 'cancelled'
      WHERE order_id = ?
    `;

    await db.query(updateQuery, [orderId]);

    console.log(`✅ Order ${orderId} cancelled by user ${req.userId}`);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Error cancelling order', error: error.message });
  }
});

// Helper function to update restaurant order count
async function updateRestaurantOrderCount(restaurantId) {
  try {
    // Note: This assumes restaurants table doesn't have total_orders column
    // If it does, uncomment the query below
    /*
    const query = `
      UPDATE restaurants 
      SET total_orders = (SELECT COUNT(*) FROM orders WHERE restaurant_id = ?)
      WHERE restaurant_id = ?
    `;
    await db.query(query, [restaurantId, restaurantId]);
    */
    console.log(`Updated order count for restaurant ${restaurantId}`);
  } catch (error) {
    console.error('Error updating restaurant order count:', error);
  }
}

module.exports = router;