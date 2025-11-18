const fetch = require('node-fetch');

async function testPlaceOrder() {
    console.log('🧪 Testing Order Placement\n');

    // First, login to get a token
    console.log('1️⃣ Logging in as customer...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
        console.error('❌ Login failed:', loginData);
        return;
    }

    console.log('✅ Login successful');
    console.log('User:', loginData.user.fullName, '- Type:', loginData.user.userType);
    console.log('Token:', loginData.token.substring(0, 30) + '...\n');

    // Now place an order
    console.log('2️⃣ Placing order...');
    
    const orderData = {
        restaurant_id: 2, // ABCD Restaurant
        delivery_address: '123 Test Street, Test City, 12345',
        special_instructions: 'Please ring the doorbell',
        subtotal: 25.00,
        delivery_fee: 3.99,
        tax: 2.00,
        total_amount: 30.99,
        items: [
            {
                item_id: 1,
                item_name: 'Test Pizza',
                item_price: 12.50,
                quantity: 2,
                subtotal: 25.00
            }
        ]
    };

    console.log('Order data:', JSON.stringify(orderData, null, 2));

    const orderResponse = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify(orderData)
    });

    console.log('\n3️⃣ Response status:', orderResponse.status);

    const orderResult = await orderResponse.json();
    console.log('Response:', JSON.stringify(orderResult, null, 2));

    if (orderResponse.ok && orderResult.success) {
        console.log('\n✅ Order placed successfully!');
        console.log('Order ID:', orderResult.orderId);
        console.log('Order Number:', orderResult.orderNumber);
    } else {
        console.log('\n❌ Order failed');
        console.log('Error:', orderResult.message || orderResult.error);
    }
}

testPlaceOrder().catch(console.error);
