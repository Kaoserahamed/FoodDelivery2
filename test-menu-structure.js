const db = require('./config/database');

async function testMenuStructure() {
    try {
        console.log('Testing menu structure...\n');
        
        // Check menu_categories structure
        const [categories] = await db.query('DESCRIBE menu_categories');
        console.log('menu_categories columns:');
        console.log(categories);
        console.log('\n');
        
        // Check actual categories
        const [catData] = await db.query('SELECT * FROM menu_categories LIMIT 5');
        console.log('Sample categories:');
        console.log(catData);
        console.log('\n');
        
        // Check menu_items structure
        const [items] = await db.query('DESCRIBE menu_items');
        console.log('menu_items columns:');
        console.log(items);
        console.log('\n');
        
        // Test the actual query from public.js
        const [menuItems] = await db.query(`
            SELECT 
                mi.*,
                mc.name as category_name,
                r.name as restaurant_name
            FROM menu_items mi
            LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
            LEFT JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
            WHERE mi.restaurant_id = 1 AND mi.is_available = 1
            ORDER BY mc.display_order, mi.name
        `);
        
        console.log('Menu items for restaurant 1:');
        console.log(JSON.stringify(menuItems, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

testMenuStructure();
