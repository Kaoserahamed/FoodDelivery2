const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------------------------------------------------
// RESTAURANT SIGNUP (FULLY FIXED - PROMISE VERSION)
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
      opening_time, closing_time, delivery_time, price_range, image_url, is_open)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
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
// RESTAURANT LOGIN (PROMISE VERSION)
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

    // if (!restaurant.is_open) {
    //   return res.status(403).json({
    //     message: "Restaurant pending approval",
    //     pendingApproval: true
    //   });
    // }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.user_type
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

module.exports = router;
