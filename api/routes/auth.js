const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');

// Register
router.post('/register', (req, res) => {
  const { first_name, last_name, email, password, user_type, phone, city } = req.body;

  if (!first_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields: first_name, email, password' });
  }

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error during user check:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Error hashing password', error: err.message });
      }

      // Combine first and last name
      const fullName = `${first_name} ${last_name || ''}`.trim();
      
      const query = 'INSERT INTO users (name, email, phone, password, user_type, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      const userPhone = phone || '';
      const userType = user_type || 'customer';
      const userAddress = city || '';

      db.query(query, [fullName, email, userPhone, hashedPassword, userType, userAddress], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).json({ message: 'Error registering user', error: err.message });
        }

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Error comparing passwords', error: err.message });
      }

      if (!isMatch) {
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
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query('SELECT * FROM users WHERE user_id = ?', [decoded.userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

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
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

module.exports = router;
