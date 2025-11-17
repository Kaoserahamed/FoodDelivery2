const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../../middleware/auth');

// Create order (customer places order)
router.post('/create', verifyToken, (req, res) => {
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

  // Validate required fields
  if (!restaurant_id || !delivery_address || !total_amount || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: restaurant_id, delivery_address, total_amount, items'
    });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }

    // 1. Create order
    const orderQuery = `
      INSERT INTO orders 
      (restaurant_id, user_id, delivery_address, special_instructions, subtotal, delivery_fee, tax, total_amount, status, order_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(
      orderQuery,
      [restaurant_id, req.userId, delivery_address, special_instructions || '', subtotal, delivery_fee, tax, total_amount],
      (err, orderResult) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ success: false, message: 'Error creating order', error: err });
          });
        }

        const orderId = orderResult.insertId;

        // 2. Insert order items
        let itemsInserted = 0;
        const itemInsertQuery = `
          INSERT INTO order_items 
          (order_id, menu_item_id, item_name, item_price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        items.forEach((item, index) => {
          db.query(
            itemInsertQuery,
            [orderId, item.item_id || 0, item.item_name, item.item_price, item.quantity, item.subtotal],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ success: false, message: 'Error creating order items', error: err });
                });
              }

              itemsInserted++;

              // When all items inserted, commit transaction
              if (itemsInserted === items.length) {
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ success: false, message: 'Error committing transaction', error: err });
                    });
                  }

                  // Update restaurant's order count
                  updateRestaurantOrderCount(restaurant_id);

                  res.status(201).json({
                    success: true,
                    message: 'Order placed successfully',
                    orderId: orderId,
                    orderData: {
                      order_id: orderId,
                      restaurant_id,
                      total_amount,
                      status: 'pending',
                      created_at: new Date()
                    }
                  });
                });
              }
            }
          );
        });
      }
    );
  });
});

// Get customer's orders
router.get('/my-orders', verifyToken, (req, res) => {
  const { status, limit = 10, offset = 0 } = req.query;

  let query = `
    SELECT 
      o.*,
      r.name AS restaurant_name,
      r.image AS restaurant_image,
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

  db.query(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching orders', error: err });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?';
    const countParams = [req.userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error counting orders', error: err });
      }

      res.status(200).json({
        success: true,
        orders,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    });
  });
});

// Get single order details
router.get('/:orderId', verifyToken, (req, res) => {
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

  db.query(query, [orderId, req.userId, req.userId], (err, orders) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching order', error: err });
    }

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching order items', error: err });
      }

      res.status(200).json({
        success: true,
        order: {
          ...order,
          items
        }
      });
    });
  });
});

// Cancel order
router.put('/:orderId/cancel', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  // Verify user owns the order
  db.query('SELECT order_id FROM orders WHERE order_id = ? AND user_id = ? AND status IN ("pending", "confirmed")', 
    [orderId, req.userId], 
    (err, orders) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error', error: err });
      }

      if (orders.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled' });
      }

      const updateQuery = `
        UPDATE orders 
        SET status = 'cancelled', cancellation_reason = ?, cancelled_at = NOW()
        WHERE order_id = ?
      `;

      db.query(updateQuery, [reason || '', orderId], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error cancelling order', error: err });
        }

        res.status(200).json({
          success: true,
          message: 'Order cancelled successfully'
        });
      });
    }
  );
});

// Helper function to update restaurant order count
function updateRestaurantOrderCount(restaurantId) {
  const query = `
    UPDATE restaurants 
    SET total_orders = (SELECT COUNT(*) FROM orders WHERE restaurant_id = ?)
    WHERE restaurant_id = ?
  `;
  db.query(query, [restaurantId, restaurantId], (err) => {
    if (err) console.error('Error updating restaurant order count:', err);
  });
}

module.exports = router;