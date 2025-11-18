const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');

// Register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, user_type, phone, city } = req.body;

    console.log('📝 Registration attempt for:', email);

    if (!first_name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: first_name, email, password' });
    }

    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Combine first and last name
    const fullName = `${first_name} ${last_name || ''}`.trim();
    
    const query = 'INSERT INTO users (name, email, phone, password, user_type, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    const userPhone = phone || '';
    const userType = user_type || 'customer';
    const userAddress = city || '';

    const [result] = await db.query(query, [fullName, email, userPhone, hashedPassword, userType, userAddress]);

    console.log('✅ User registered successfully:', result.insertId);

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Query database
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    console.log('👤 User found:', user.name, '- Type:', user.user_type);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        userRole: user.user_type,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        fullName: user.name,
        email: user.email,
        userType: user.user_type,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [results] = await db.query('SELECT * FROM users WHERE user_id = ?', [decoded.userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    res.status(200).json({
      userId: user.user_id,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      fullName: user.name,
      email: user.email,
      userType: user.user_type,
      phone: user.phone,
      address: user.address
    });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

module.exports = router;
