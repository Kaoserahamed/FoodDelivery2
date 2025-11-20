const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, isRestaurant } = require('../../middleware/auth');

// ----------------------------------------------------
// RESTAURANT SIGNUP
// ----------------------------------------------------
router.post('/signup', async (req, res) => {
  const { owner, restaurant } = req.body;

  if (!owner || !restaurant) {
    return res.status(400).json({ message: "Owner and restaurant info required" });
  }

  const requiredOwner = ["name", "email", "phone", "password"];
  for (let f of requiredOwner) {
    if (!owner[f]) return res.status(400).json({ message: `Owner ${f} is required` });
  }

  const requiredRestaurant = [
    "name", "description", "cuisine_type", "address",
    "phone", "opening_time", "closing_time",
    "delivery_time", "price_range"
  ];
  for (let f of requiredRestaurant) {
    if (!restaurant[f]) return res.status(400).json({ message: `Restaurant ${f} is required` });
  }

  if (owner.password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Check if email exists
    const [emailExists] = await conn.query(
      "SELECT user_id FROM users WHERE email = ?",
      [owner.email]
    );

    if (emailExists.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(owner.password, 10);

    const [userResult] = await conn.query(
      `INSERT INTO users (name, email, phone, password, user_type)
       VALUES (?, ?, ?, ?, ?)`,
      [owner.name, owner.email, owner.phone, hashedPassword, "restaurant"]
    );

    const userId = userResult.insertId;

    // Create restaurant
    const [restaurantResult] = await conn.query(
    `INSERT INTO restaurants 
    (user_id, name, description, cuisine_type, address, phone, email,
    opening_time, closing_time, delivery_time, price_range, image_url, is_open, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
    [
        userId,
        restaurant.name,
        restaurant.description,
        restaurant.cuisine_type,
        restaurant.address,
        restaurant.phone,
        restaurant.email || null,
        restaurant.opening_time,
        restaurant.closing_time,
        restaurant.delivery_time,
        restaurant.price_range,
        restaurant.image_url || null
    ]
);

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Restaurant registered successfully. Awaiting admin approval.",
      data: {
        userId: userId,
        restaurantId: restaurantResult.insertId
      }
    });

  } catch (err) {
    if (conn) await conn.rollback();
    return res.status(500).json({ message: "Signup failed", error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ----------------------------------------------------
// RESTAURANT LOGIN
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND user_type = 'restaurant'",
      [email]
    );

    if (users.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = users[0];

    if (!user.is_active)
      return res.status(403).json({ message: "Account deactivated by admin" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Fetch restaurant
    const [restaurants] = await db.query(
      "SELECT * FROM restaurants WHERE user_id = ?",
      [user.user_id]
    );

    if (restaurants.length === 0)
      return res.status(404).json({ message: "Restaurant profile not found" });

    const restaurant = restaurants[0];

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        userRole: user.user_type  // Changed from 'role' to 'userRole' for consistency
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    delete user.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
      restaurant
    });

  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// ----------------------------------------------------
// GET RESTAURANT PROFILE
// ----------------------------------------------------
router.get('/profile', verifyToken, isRestaurant, (req, res) => {
  const userId = req.userId;

  db.query(
    'SELECT * FROM restaurants WHERE user_id = ?',
    [userId],
    (err, restaurants) => {
      if (err) {
        return res.status(500).json({ message: 'Error finding restaurant', error: err });
      }

      if (restaurants.length === 0) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      res.status(200).json({
        success: true,
        restaurant: restaurants[0]
      });
    }
  );
});

// ----------------------------------------------------
// UPDATE RESTAURANT PROFILE
// ----------------------------------------------------
router.put('/profile', verifyToken, isRestaurant, (req, res) => {
  const userId = req.userId;
  const updates = req.body;

  const allowedFields = [
    'name', 'description', 'cuisine_type', 'address', 
    'phone', 'email', 'opening_time', 'closing_time',
    'delivery_time', 'price_range', 'image_url'
  ];

  const updateFields = [];
  const updateValues = [];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(updates[field]);
    }
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  updateValues.push(userId);

  db.query(
    `UPDATE restaurants SET ${updateFields.join(', ')} WHERE user_id = ?`,
    updateValues,
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
  );
});

// ----------------------------------------------------
// GET RESTAURANT DASHBOARD DATA
// ----------------------------------------------------
// ----------------------------------------------------
// GET RESTAURANT DASHBOARD DATA
// ----------------------------------------------------
router.get('/dashboard', verifyToken, isRestaurant, async (req, res) => {
  const userId = req.userId;
  console.log('📊 Dashboard request for userId:', userId);

  try {
    // Get restaurant details using promise
    const [restaurants] = await db.query('SELECT * FROM restaurants WHERE user_id = ?', [userId]);
    
    if (restaurants.length === 0) {
      console.log('❌ Restaurant not found for userId:', userId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurant = restaurants[0];
    const restaurantId = restaurant.restaurant_id;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('✅ Restaurant found:', restaurant.name, 'ID:', restaurantId);

    // Get all statistics in parallel
    const [
      [todayOrdersResult],
      [todayRevenueResult],
      [pendingOrdersResult],
      [avgRatingResult],
      recentOrders,
      popularItems
    ] = await Promise.all([
      // Today's orders count
      db.query(
        `SELECT COUNT(*) as count FROM orders 
         WHERE restaurant_id = ? AND DATE(order_date) = ?`,
        [restaurantId, today]
      ),
      // Today's revenue
      db.query(
        `SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders 
         WHERE restaurant_id = ? AND DATE(order_date) = ? AND status != 'cancelled'`,
        [restaurantId, today]
      ),
      // Pending orders count
      db.query(
        `SELECT COUNT(*) as count FROM orders 
         WHERE restaurant_id = ? AND status = 'pending'`,
        [restaurantId]
      ),
      // Average rating
      db.query(
        `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count 
         FROM reviews WHERE restaurant_id = ?`,
        [restaurantId]
      ),
      // Recent orders (last 5)
      db.query(
        `SELECT o.order_id, o.order_date, o.status, o.total_amount,
         u.name as customer_name, u.phone as customer_phone,
         (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
         FROM orders o
         JOIN users u ON o.user_id = u.user_id
         WHERE o.restaurant_id = ?
         ORDER BY o.order_date DESC
         LIMIT 5`,
        [restaurantId]
      ),
      // Popular menu items today
      db.query(
        `SELECT mi.item_id, mi.name, mi.price, mi.image_url,
         mc.name as category_name,
         COUNT(oi.order_item_id) as order_count
         FROM menu_items mi
         LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
         LEFT JOIN order_items oi ON mi.item_id = oi.item_id
         LEFT JOIN orders o ON oi.order_id = o.order_id AND DATE(o.order_date) = ?
         WHERE mi.restaurant_id = ?
         GROUP BY mi.item_id
         HAVING order_count > 0
         ORDER BY order_count DESC
         LIMIT 3`,
        [today, restaurantId]
      )
    ]);

    console.log('✅ All queries completed successfully');
    console.log('📈 Stats:', {
      todayOrders: todayOrdersResult[0].count,
      todayRevenue: todayRevenueResult[0].revenue,
      pendingOrders: pendingOrdersResult[0].count,
      recentOrdersCount: recentOrders[0].length
    });

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
          todayOrders: todayOrdersResult[0].count,
          todayRevenue: parseFloat(todayRevenueResult[0].revenue).toFixed(2),
          pendingOrders: pendingOrdersResult[0].count,
          averageRating: parseFloat(avgRatingResult[0].avg_rating).toFixed(1),
          reviewCount: avgRatingResult[0].review_count
        },
        recentOrders: recentOrders[0] || [],
        popularItems: popularItems[0] || []
      }
    });

  } catch (err) {
    console.error('❌ Dashboard error:', err);
    return res.status(500).json({ 
      message: 'Failed to load dashboard', 
      error: err.message 
    });
  }
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

// ----------------------------------------------------
// RESTAURANT DASHBOARD STATISTICS
// ----------------------------------------------------
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get restaurant info
    const [restaurants] = await db.query(
      'SELECT * FROM restaurants WHERE user_id = ?',
      [userId]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const restaurant = restaurants[0];
    const restaurantId = restaurant.restaurant_id;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get statistics
    const [todayOrdersResult] = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE restaurant_id = ? AND order_date >= ? AND order_date < ?',
      [restaurantId, today, tomorrow]
    );
    
    const [pendingOrdersResult] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND status IN ("pending", "confirmed")',
      [restaurantId]
    );
    
    const [reviewStats] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE restaurant_id = ?',
      [restaurantId]
    );
    
    // Get recent orders (last 5)
    const [recentOrders] = await db.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.restaurant_id = ?
      ORDER BY o.order_date DESC
      LIMIT 5
    `, [restaurantId]);
    
    // Get popular items (top 3 most ordered today)
    const [popularItems] = await db.query(`
      SELECT mi.*, mc.name as category_name, COUNT(oi.order_item_id) as order_count
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
      LEFT JOIN order_items oi ON mi.item_id = oi.item_id
      LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_date >= ? AND o.order_date < ?
      WHERE mi.restaurant_id = ?
      GROUP BY mi.item_id
      ORDER BY order_count DESC
      LIMIT 3
    `, [today, tomorrow, restaurantId]);
    
    const statistics = {
      todayOrders: todayOrdersResult[0].count,
      todayRevenue: '$' + parseFloat(todayOrdersResult[0].revenue || 0).toFixed(2),
      pendingOrders: pendingOrdersResult[0].count,
      averageRating: parseFloat(reviewStats[0].avg_rating || 0).toFixed(1),
      reviewCount: reviewStats[0].review_count || 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          restaurant_id: restaurant.restaurant_id,
          name: restaurant.name,
          is_open: restaurant.is_open,
          rating: restaurant.rating,
          total_reviews: restaurant.total_reviews
        },
        statistics,
        recentOrders,
        popularItems
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard',
      error: error.message
    });
  }
});

module.exports = router;