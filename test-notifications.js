const db = require('./config/database');

async function testNotifications() {
    try {
        console.log('🔔 Testing Notifications System...\n');
        
        // Check if notifications table exists
        console.log('📋 Checking if notifications table exists...');
        try {
            const [tables] = await db.query("SHOW TABLES LIKE 'notifications'");
            if (tables.length === 0) {
                console.log('❌ Notifications table does NOT exist!');
                console.log('\n📝 Creating notifications table...');
                
                await db.query(`
                    CREATE TABLE IF NOT EXISTS notifications (
                        notification_id INT PRIMARY KEY AUTO_INCREMENT,
                        restaurant_id INT NOT NULL,
                        type ENUM('order', 'review', 'system', 'alert') NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        reference_id INT NULL,
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
                        INDEX idx_restaurant_read (restaurant_id, is_read),
                        INDEX idx_created_at (created_at)
                    )
                `);
                
                console.log('✅ Notifications table created!');
                
                // Insert sample notifications
                console.log('\n📝 Inserting sample notifications...');
                await db.query(`
                    INSERT INTO notifications (restaurant_id, type, title, message, reference_id, is_read) VALUES
                    (1, 'order', 'New Order Received', 'You have received a new order #ORD123', 7, 0),
                    (1, 'review', 'New Review', 'A customer left a 5-star review for your restaurant', 1, 0),
                    (1, 'system', 'Welcome!', 'Welcome to TasteNow! Start managing your orders and menu.', NULL, 1)
                `);
                
                console.log('✅ Sample notifications inserted!');
            } else {
                console.log('✅ Notifications table exists');
            }
        } catch (error) {
            console.error('❌ Error checking/creating table:', error.message);
        }
        
        // Check existing notifications
        console.log('\n📋 Checking existing notifications...');
        const [notifications] = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10');
        console.log(`Found ${notifications.length} notifications:`);
        notifications.forEach(n => {
            console.log(`  [${n.is_read ? 'READ' : 'UNREAD'}] ${n.type.toUpperCase()}: ${n.title} - ${n.message}`);
        });
        
        // Check restaurants
        console.log('\n🏪 Checking restaurants...');
        const [restaurants] = await db.query('SELECT restaurant_id, user_id, name FROM restaurants');
        console.log(`Found ${restaurants.length} restaurants:`);
        restaurants.forEach(r => {
            console.log(`  Restaurant #${r.restaurant_id} (User #${r.user_id}): ${r.name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testNotifications();
