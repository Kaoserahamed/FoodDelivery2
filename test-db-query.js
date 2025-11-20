const db = require('./config/database');

async function testQuery() {
    try {
        console.log('Testing database query...');
        
        // Test 1: Simple query
        const [result1] = await db.query('SELECT 1 as test');
        console.log('✅ Test 1 passed:', result1);
        
        // Test 2: Find restaurant
        const [result2] = await db.query('SELECT restaurant_id FROM restaurants WHERE user_id = ?', [5]);
        console.log('✅ Test 2 passed - Restaurant:', result2);
        
        // Test 3: Get orders
        if (result2.length > 0) {
            const restaurantId = result2[0].restaurant_id;
            const [result3] = await db.query('SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ?', [restaurantId]);
            console.log('✅ Test 3 passed - Orders count:', result3);
        }
        
        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testQuery();
