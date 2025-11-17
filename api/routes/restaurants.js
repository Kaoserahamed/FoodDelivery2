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

router.get('/dashboard', verifyToken, isRestaurant, (req, res) => {
  const userId = req.userId;

  // Get restaurant details
  db.query('SELECT * FROM restaurants WHERE user_id = ?', [userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding restaurant', error: err });
    }

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurant = restaurants[0];
    const restaurantId = restaurant.restaurant_id;
    const today = new Date().toISOString().split('T')[0];

    // Today's orders count
    db.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE restaurant_id = ? AND DATE(order_date) = ?`,
      [restaurantId, today],
      (err, todayOrders) => {
        if (err) return res.status(500).json({ message: 'Error fetching orders', error: err });

        // Today's revenue
        db.query(
          `SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders 
           WHERE restaurant_id = ? AND DATE(order_date) = ? AND status != 'cancelled'`,
          [restaurantId, today],
          (err, todayRevenue) => {
            if (err) return res.status(500).json({ message: 'Error fetching revenue', error: err });

            // Pending orders count
            db.query(
              `SELECT COUNT(*) as count FROM orders 
               WHERE restaurant_id = ? AND status = 'pending'`,
              [restaurantId],
              (err, pendingOrders) => {
                if (err) return res.status(500).json({ message: 'Error fetching pending orders', error: err });

                // Average rating
                db.query(
                  `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count 
                   FROM reviews WHERE restaurant_id = ?`,
                  [restaurantId],
                  (err, avgRating) => {
                    if (err) return res.status(500).json({ message: 'Error fetching rating', error: err });

                    // Recent orders (last 5)
                    db.query(
                      `SELECT o.*, u.name as customer_name, u.phone as customer_phone,
                       COUNT(oi.order_item_id) as item_count
                       FROM orders o
                       JOIN users u ON o.user_id = u.user_id
                       LEFT JOIN order_items oi ON o.order_id = oi.order_id
                       WHERE o.restaurant_id = ?
                       GROUP BY o.order_id
                       ORDER BY o.order_date DESC
                       LIMIT 5`,
                      [restaurantId],
                      (err, recentOrders) => {
                        if (err) return res.status(500).json({ message: 'Error fetching recent orders', error: err });

                        // Popular menu items today
                        db.query(
                          `SELECT mi.*, mc.name as category_name, COUNT(oi.order_item_id) as order_count
                           FROM menu_items mi
                           LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
                           LEFT JOIN order_items oi ON mi.item_id = oi.item_id
                           LEFT JOIN orders o ON oi.order_id = o.order_id AND DATE(o.order_date) = ?
                           WHERE mi.restaurant_id = ?
                           GROUP BY mi.item_id
                           ORDER BY order_count DESC
                           LIMIT 3`,
                          [today, restaurantId],
                          (err, popularItems) => {
                            if (err) return res.status(500).json({ message: 'Error fetching popular items', error: err });

                            // Send response
                            return res.status(200).json({
                              success: true,
                              data: {
                                restaurant: {
                                  id: restaurant.restaurant_id,
                                  name: restaurant.name,
                                  description: restaurant.description,
                                  cuisine_type: restaurant.cuisine_type,
                                  address: restaurant.address,
                                  phone: restaurant.phone,
                                  email: restaurant.email,
                                  is_open: restaurant.is_open,
                                  opening_time: restaurant.opening_time,
                                  closing_time: restaurant.closing_time,
                                  image_url: restaurant.image_url
                                },
                                statistics: {
                                  todayOrders: todayOrders[0].count,
                                  todayRevenue: parseFloat(todayRevenue[0].revenue).toFixed(2),
                                  pendingOrders: pendingOrders[0].count,
                                  averageRating: parseFloat(avgRating[0].avg_rating).toFixed(1),
                                  reviewCount: avgRating[0].review_count
                                },
                                recentOrders: recentOrders,
                                popularItems: popularItems
                              }
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// ----------------------------------------------------
// UPDATE RESTAURANT STATUS (OPEN/CLOSED)
// ----------------------------------------------------
router.put('/status', verifyToken, isRestaurant, (req, res) => {
  const userId = req.userId;
  const { is_open } = req.body;

  db.query(
    'UPDATE restaurants SET is_open = ? WHERE user_id = ?',
    [is_open, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating status', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Restaurant ${is_open ? 'opened' : 'closed'} successfully`
      });
    }
  );
});


module.exports = router;
