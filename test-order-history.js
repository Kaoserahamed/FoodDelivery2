const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testOrderHistory() {
    try {
        // First, login as a customer
        console.log('🔐 Logging in as customer...');
        const loginData = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'test@example.com',
            password: 'password123'
        });
        
        console.log('Login response:', JSON.stringify(loginData, null, 2));
        
        if (!loginData.token) {
            console.error('❌ Login failed:', loginData.message || 'No token received');
            return;
        }

        console.log('✅ Login successful');
        console.log('Token:', loginData.token);
        console.log('User:', loginData.user);

        // Fetch order history
        console.log('\n📦 Fetching order history...');
        const ordersData = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/orders/my-orders',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!ordersData.success) {
            console.error('❌ Failed to fetch orders:', ordersData.message);
            return;
        }

        console.log('✅ Orders fetched successfully');
        console.log('Full API response:', JSON.stringify(ordersData, null, 2));
        console.log(`Total orders: ${ordersData.orders.length}`);
        
        if (ordersData.orders.length > 0) {
            console.log('\n📋 Order Details:');
            ordersData.orders.forEach((order, index) => {
                console.log(`\n--- Order ${index + 1} ---`);
                console.log(`Order ID: ${order.order_id}`);
                console.log(`Order Number: ${order.order_number}`);
                console.log(`Restaurant: ${order.restaurant_name}`);
                console.log(`Status: ${order.status}`);
                console.log(`Total Amount: $${parseFloat(order.total_amount).toFixed(2)}`);
                console.log(`Order Date: ${order.order_date}`);
                console.log(`Delivery Address: ${order.delivery_address}`);
                console.log(`Items: ${order.items ? order.items.length : 0}`);
                console.log('Items array:', JSON.stringify(order.items, null, 2));
                
                if (order.items && order.items.length > 0) {
                    console.log('  Items:');
                    order.items.forEach(item => {
                        console.log(`    - ${item.quantity}x ${item.item_name} @ $${parseFloat(item.item_price).toFixed(2)} = $${parseFloat(item.subtotal).toFixed(2)}`);
                    });
                } else {
                    console.log('  ⚠️ No items found for this order');
                }
            });
        } else {
            console.log('No orders found for this customer');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testOrderHistory();
