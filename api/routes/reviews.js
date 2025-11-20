const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../../middleware/auth');

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const query = `
            SELECT r.*, u.name as customer_name, o.order_number
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN orders o ON r.order_id = o.order_id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `;
        
        const [reviews] = await db.query(query, [restaurantId]);
        
        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching reviews',
            error: error.message 
        });
    }
});

// Get all reviews for restaurant owner
router.get('/my-reviews', verifyToken, async (req, res) => {
    try {
        // Get restaurant ID for this user
        const [restaurants] = await db.query(
            'SELECT restaurant_id FROM restaurants WHERE user_id = ?',
            [req.userId]
        );
        
        if (restaurants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }
        
        const restaurantId = restaurants[0].restaurant_id;
        
        const query = `
            SELECT r.*, u.name as customer_name, u.email as customer_email, o.order_number
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN orders o ON r.order_id = o.order_id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `;
        
        const [reviews] = await db.query(query, [restaurantId]);
        
        // Get statistics
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews
            WHERE restaurant_id = ?
        `, [restaurantId]);
        
        res.status(200).json({
            success: true,
            reviews,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching reviews',
            error: error.message 
        });
    }
});

// Create a review (customer)
router.post('/create', verifyToken, async (req, res) => {
    try {
        console.log('📝 Creating review - User:', req.userId);
        console.log('Request body:', req.body);
        
        const { restaurant_id, order_id, rating, comment } = req.body;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            console.log('❌ Invalid rating:', rating);
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        // Check if order exists and belongs to user
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE order_id = ? AND user_id = ? AND status = "delivered"',
            [order_id, req.userId]
        );
        
        console.log('Order check:', { order_id, user_id: req.userId, found: orders.length });
        
        if (orders.length === 0) {
            console.log('❌ Order not found or not delivered');
            return res.status(400).json({
                success: false,
                message: 'Order not found or not delivered yet'
            });
        }
        
        // Check if review already exists
        const [existing] = await db.query(
            'SELECT * FROM reviews WHERE order_id = ? AND user_id = ?',
            [order_id, req.userId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this order'
            });
        }
        
        // Insert review
        const query = `
            INSERT INTO reviews (user_id, restaurant_id, order_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            req.userId,
            restaurant_id,
            order_id,
            rating,
            comment || ''
        ]);
        
        // Update restaurant rating
        await updateRestaurantRating(restaurant_id);
        
        console.log('✅ Review created successfully:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating review:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating review',
            error: error.message 
        });
    }
});

// Update restaurant rating
async function updateRestaurantRating(restaurantId) {
    try {
        const [stats] = await db.query(`
            SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE restaurant_id = ?
        `, [restaurantId]);
        
        if (stats[0].total_reviews > 0) {
            await db.query(`
                UPDATE restaurants
                SET rating = ?, total_reviews = ?
                WHERE restaurant_id = ?
            `, [
                parseFloat(stats[0].avg_rating).toFixed(1),
                stats[0].total_reviews,
                restaurantId
            ]);
        }
    } catch (error) {
        console.error('Error updating restaurant rating:', error);
    }
}

module.exports = router;
