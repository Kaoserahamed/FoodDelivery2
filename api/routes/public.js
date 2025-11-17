const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Get all active restaurants (public endpoint)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.restaurant_id,
                r.name,
                r.description,
                r.cuisine_type,
                r.address,
                r.phone,
                r.email,
                r.opening_time,
                r.closing_time,
                r.delivery_time,
                r.price_range,
                r.image_url,
                r.is_open,
                r.rating,
                r.total_reviews
            FROM restaurants r
            WHERE 1=1
            ORDER BY r.rating DESC, r.name ASC
        `;

        const [restaurants] = await db.query(query);

        console.log('✅ Public restaurants fetched:', restaurants.length);

        res.status(200).json(restaurants);
    } catch (err) {
        console.error('❌ Error fetching restaurants:', err);
        res.status(500).json({ 
            message: 'Error fetching restaurants', 
            error: err.message 
        });
    }
});

// Get single restaurant by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                r.*
            FROM restaurants r
            WHERE r.restaurant_id = ?
        `;

        const [restaurants] = await db.query(query, [id]);

        if (restaurants.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json(restaurants[0]);
    } catch (err) {
        console.error('❌ Error fetching restaurant:', err);
        res.status(500).json({ 
            message: 'Error fetching restaurant', 
            error: err.message 
        });
    }
});

// Get restaurant menu (public)
router.get('/:id/menu', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                mi.*,
                mc.name as category_name,
                r.name as restaurant_name
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
            LEFT JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
            WHERE mi.restaurant_id = ? AND mi.is_available = 1
            ORDER BY mc.display_order, mi.name
        `;

        const [items] = await db.query(query, [id]);

        res.status(200).json({ success: true, items });
    } catch (err) {
        console.error('❌ Error fetching menu:', err);
        res.status(500).json({ 
            message: 'Error fetching menu', 
            error: err.message 
        });
    }
});

// Add to your menu routes
router.get('/items/public', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT mi.*, mc.name as category_name, r.name as restaurant_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
      LEFT JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
      WHERE mi.is_available = true
      ORDER BY mi.restaurant_id, mi.name
    `);

    res.status(200).json({ 
      success: true, 
      items 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching menu items',
      error: error.message 
    });
  }
});

module.exports = router;