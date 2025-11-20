const db = require('./config/database');

async function testReviewSystem() {
    try {
        console.log('🧪 Testing Review System...\n');
        
        // Check orders
        console.log('📦 Checking orders...');
        const [orders] = await db.query(`
            SELECT o.order_id, o.order_number, o.user_id, o.restaurant_id, o.status, 
                   u.name as customer_name, r.name as restaurant_name
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            ORDER BY o.order_date DESC
            LIMIT 10
        `);
        
        console.log(`Found ${orders.length} orders:`);
        orders.forEach(order => {
            console.log(`  Order #${order.order_id} - ${order.customer_name} → ${order.restaurant_name} - Status: ${order.status}`);
        });
        
        // Check delivered orders
        console.log('\n✅ Checking delivered orders...');
        const [deliveredOrders] = await db.query(`
            SELECT o.order_id, o.order_number, o.user_id, o.restaurant_id,
                   u.name as customer_name, r.name as restaurant_name
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            WHERE o.status = 'delivered'
            ORDER BY o.order_date DESC
            LIMIT 5
        `);
        
        console.log(`Found ${deliveredOrders.length} delivered orders:`);
        deliveredOrders.forEach(order => {
            console.log(`  Order #${order.order_id} - ${order.customer_name} → ${order.restaurant_name}`);
        });
        
        // Check existing reviews
        console.log('\n⭐ Checking existing reviews...');
        const [reviews] = await db.query(`
            SELECT r.*, u.name as customer_name, rest.name as restaurant_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
            ORDER BY r.created_at DESC
            LIMIT 5
        `);
        
        console.log(`Found ${reviews.length} reviews:`);
        reviews.forEach(review => {
            console.log(`  ${review.customer_name} → ${review.restaurant_name}: ${review.rating}⭐ - "${review.comment}"`);
        });
        
        // Check if we can create a test review
        if (deliveredOrders.length > 0) {
            const testOrder = deliveredOrders[0];
            
            // Check if review already exists
            const [existingReview] = await db.query(
                'SELECT * FROM reviews WHERE order_id = ? AND user_id = ?',
                [testOrder.order_id, testOrder.user_id]
            );
            
            if (existingReview.length > 0) {
                console.log(`\n⚠️ Order #${testOrder.order_id} already has a review`);
            } else {
                console.log(`\n✅ Order #${testOrder.order_id} can be reviewed by user ${testOrder.user_id}`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testReviewSystem();
