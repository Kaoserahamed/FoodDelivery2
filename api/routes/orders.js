const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isCustomer, isRestaurant } = require('../../middleware/auth');

// Create order
router.post('/', verifyToken, isCustomer, (req, res) => {
  const { restaurant_id, items, subtotal, delivery_fee, tax, special_instructions } = req.body;

  if (!restaurant_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  const total_amount = subtotal + delivery_fee + tax;

  const order = {
    user_id: req.userId,
    restaurant_id,
    subtotal,
    delivery_fee,
    tax,
    total_amount,
    status: 'pending',
    special_instructions: special_instructions || '',
    created_at: new Date()
  };

  db.query('INSERT INTO orders SET ?', order, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating order', error: err });
    }

    const orderId = result.insertId;

    // Insert order items
    let completed = 0;
    items.forEach((item) => {
      const orderItem = {
        order_id: orderId,
        item_id: item.itemId,
        quantity: item.quantity,
        item_price: item.price,
        subtotal: item.price * item.quantity
      };

      db.query('INSERT INTO order_items SET ?', orderItem, (err) => {
        completed++;
        if (completed === items.length) {
          res.status(201).json({
            message: 'Order created successfully',
            orderId
          });
        }
      });
    });
  });
});

// Get customer orders
router.get('/customer/list', verifyToken, isCustomer, (req, res) => {
  const query = `SELECT o.*, r.name as restaurant_name, r.cuisine 
                 FROM orders o 
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                 WHERE o.user_id = ? 
                 ORDER BY o.created_at DESC`;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders', error: err });
    }
    res.status(200).json(results);
  });
});

// Get restaurant orders
router.get('/restaurant/list', verifyToken, isRestaurant, (req, res) => {
  const query = `SELECT o.*, u.first_name, u.last_name, u.phone, u.city, r.name as restaurant_name
                 FROM orders o 
                 JOIN users u ON o.user_id = u.user_id 
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                 WHERE o.restaurant_id = (SELECT restaurant_id FROM restaurants WHERE owner_id = ?) 
                 ORDER BY o.created_at DESC`;

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders', error: err });
    }
    res.status(200).json(results);
  });
});

// Get order details
router.get('/:orderId', verifyToken, (req, res) => {
  const { orderId } = req.params;

  const query = `SELECT o.*, r.name as restaurant_name, r.delivery_fee, r.phone, r.address
                 FROM orders o 
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
                 WHERE o.order_id = ?`;

  db.query(query, [orderId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching order', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = results[0];

    // Get order items
    db.query(`SELECT oi.*, mi.name as item_name, mi.image_url 
              FROM order_items oi 
              JOIN menu_items mi ON oi.item_id = mi.item_id 
              WHERE oi.order_id = ?`, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order items', error: err });
      }

      res.status(200).json({
        ...order,
        items
      });
    });
  });
});

// Update order status
router.put('/:orderId/status', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const update = {
    status,
    updated_at: new Date()
  };

  if (status === 'delivered') {
    update.delivered_at = new Date();
  }

  db.query('UPDATE orders SET ? WHERE order_id = ?', [update, orderId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating order', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  });
});

// Cancel order
router.put('/:orderId/cancel', verifyToken, (req, res) => {
  const { orderId } = req.params;

  db.query('UPDATE orders SET status = ?, updated_at = ? WHERE order_id = ?', 
    ['cancelled', new Date(), orderId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error cancelling order', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ message: 'Order cancelled successfully' });
    });
});

module.exports = router;
