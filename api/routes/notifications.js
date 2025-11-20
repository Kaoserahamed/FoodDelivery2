const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyToken } = require('../../middleware/auth');

// Get notifications for restaurant
router.get('/restaurant', verifyToken, async (req, res) => {
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
        
        // Get notifications
        const query = `
            SELECT n.*, 
                   CASE 
                       WHEN n.type = 'order' THEN o.order_number
                       WHEN n.type = 'review' THEN CONCAT(u.name, ' left a review')
                       ELSE NULL
                   END as reference_text
            FROM notifications n
            LEFT JOIN orders o ON n.reference_id = o.order_id AND n.type = 'order'
            LEFT JOIN reviews r ON n.reference_id = r.review_id AND n.type = 'review'
            LEFT JOIN users u ON r.user_id = u.user_id
            WHERE n.restaurant_id = ?
            ORDER BY n.created_at DESC
            LIMIT 50
        `;
        
        const [notifications] = await db.query(query, [restaurantId]);
        
        // Get unread count
        const [unreadCount] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE restaurant_id = ? AND is_read = 0',
            [restaurantId]
        );
        
        res.status(200).json({
            success: true,
            notifications,
            unreadCount: unreadCount[0].count
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
});

// Mark notification as read
router.put('/:notificationId/read', verifyToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
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
        
        // Update notification
        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND restaurant_id = ?',
            [notificationId, restaurantId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message
        });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', verifyToken, async (req, res) => {
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
        
        // Update all notifications
        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE restaurant_id = ? AND is_read = 0',
            [restaurantId]
        );
        
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
});

// Delete notification
router.delete('/:notificationId', verifyToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
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
        
        // Delete notification
        await db.query(
            'DELETE FROM notifications WHERE notification_id = ? AND restaurant_id = ?',
            [notificationId, restaurantId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
});

// Create notification (helper function for internal use)
async function createNotification(restaurantId, type, title, message, referenceId = null) {
    try {
        await db.query(
            'INSERT INTO notifications (restaurant_id, type, title, message, reference_id) VALUES (?, ?, ?, ?, ?)',
            [restaurantId, type, title, message, referenceId]
        );
        console.log(`✅ Notification created for restaurant ${restaurantId}: ${title}`);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Export helper function
router.createNotification = createNotification;

module.exports = router;
