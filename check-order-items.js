const db = require('./config/database');

async function checkOrderItems() {
    try {
        // Check orders
        console.log('📦 Checking orders...');
        const [orders] = await db.query('SELECT * FROM orders ORDER BY order_date DESC LIMIT 5');
        console.log(`Found ${orders.length} orders:`);
        orders.forEach(order => {
            console.log(`  Order #${order.order_id} - ${order.order_number} - Status: ${order.status} - Total: $${order.total_amount}`);
        });

        // Check order items
        console.log('\n📋 Checking order items...');
        const [items] = await db.query('SELECT * FROM order_items ORDER BY order_item_id DESC LIMIT 10');
        console.log(`Found ${items.length} order items:`);
        items.forEach(item => {
            console.log(`  Item #${item.order_item_id} - Order #${item.order_id} - ${item.quantity}x ${item.item_name} @ $${item.item_price} = $${item.subtotal}`);
        });

        // Check items for specific order
        if (orders.length > 0) {
            const orderId = orders[0].order_id;
            console.log(`\n🔍 Checking items for Order #${orderId}...`);
            const [orderItems] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
            console.log(`Found ${orderItems.length} items for this order:`);
            orderItems.forEach(item => {
                console.log(`  - ${item.quantity}x ${item.item_name} @ $${item.item_price} = $${item.subtotal}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOrderItems();
