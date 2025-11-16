const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../../middleware/auth');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  const query = 'SELECT user_id, first_name, last_name, email, phone, city, user_type, created_at FROM users WHERE user_id = ?';

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching profile', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Update user profile
router.put('/profile/update', verifyToken, (req, res) => {
  const { first_name, last_name, phone, city } = req.body;

  const updates = {};
  if (first_name) updates.first_name = first_name;
  if (last_name) updates.last_name = last_name;
  if (phone) updates.phone = phone;
  if (city) updates.city = city;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  db.query('UPDATE users SET ? WHERE user_id = ?', [updates, req.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating profile', error: err });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// Change password
router.post('/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password required' });
  }

  db.query('SELECT password FROM users WHERE user_id = ?', [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords', error: err });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing password', error: err });
        }

        db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.userId], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating password', error: err });
          }

          res.status(200).json({ message: 'Password changed successfully' });
        });
      });
    });
  });
});

module.exports = router;
