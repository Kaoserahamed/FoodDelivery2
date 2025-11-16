const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken, isCustomer } = require('../../middleware/auth');

// Get reviews by restaurant
router.get('/restaurant/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;

  const query = `SELECT r.*, u.first_name, u.last_name 
                 FROM reviews r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.restaurant_id = ? 
                 ORDER BY r.created_at DESC`;

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching reviews', error: err });
    }
    res.status(200).json(results);
  });
});

// Get restaurant average rating
router.get('/restaurant/:restaurantId/rating', (req, res) => {
  const { restaurantId } = req.params;

  const query = `SELECT 
                  AVG(rating) as average_rating,
                  COUNT(*) as total_reviews,
                  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                  SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                  SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                  SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                  SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                 FROM reviews 
                 WHERE restaurant_id = ?`;

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching rating', error: err });
    }
    res.status(200).json(results[0]);
  });
});

// Create review (customer)
router.post('/', verifyToken, isCustomer, (req, res) => {
  const { restaurant_id, order_id, rating, comment } = req.body;

  if (!restaurant_id || !rating) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  // Check if user already reviewed this restaurant for this order
  const checkQuery = `SELECT * FROM reviews WHERE user_id = ? AND restaurant_id = ? AND order_id = ?`;
  
  db.query(checkQuery, [req.userId, restaurant_id, order_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking review', error: err });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant for this order' });
    }

    const review = {
      user_id: req.userId,
      restaurant_id,
      order_id: order_id || null,
      rating,
      comment: comment || '',
      created_at: new Date()
    };

    db.query('INSERT INTO reviews SET ?', review, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating review', error: err });
      }

      res.status(201).json({
        message: 'Review created successfully',
        reviewId: result.insertId
      });
    });
  });
});

// Update review
router.put('/:reviewId', verifyToken, (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const updates = {};
  if (rating) updates.rating = rating;
  if (comment !== undefined) updates.comment = comment;
  updates.updated_at = new Date();

  db.query('UPDATE reviews SET ? WHERE review_id = ?', [updates, reviewId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating review', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review updated successfully' });
  });
});

// Delete review
router.delete('/:reviewId', verifyToken, (req, res) => {
  const { reviewId } = req.params;

  db.query('DELETE FROM reviews WHERE review_id = ?', [reviewId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting review', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  });
});

module.exports = router;
