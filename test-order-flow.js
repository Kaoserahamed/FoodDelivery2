/**
 * Test Order Flow
 * This script tests the complete order placement flow:
 * 1. Login as customer
 * 2. Get menu items
 * 3. Add items to cart (simulate)
 * 4. Place order
 */

const API_URL = 'http://localhost:5000/api';

async function testOrderFlow() {
  console.log('🧪 Testing Order Flow...\n');

  try {
    // Step 1: Login as customer
    console.log('Step 1: Login as customer...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.token) {
      console.error('❌ Login failed:', loginData.message || 'No token received');
      console.error('   Response:', loginData);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful');
    console.log('   User:', loginData.user.name);
    console.log('   Token:', token.substring(0, 20) + '...\n');

    // Step 2: Get menu items
    console.log('Step 2: Fetching menu items...');
    const menuResponse = await fetch(`${API_URL}/menu/items/public`);
    const menuData = await menuResponse.json();

    if (!menuResponse.ok) {
      console.error('❌ Failed to fetch menu items');
      return;
    }

    const items = menuData.items || menuData;
    console.log(`✅ Found ${items.length} menu items`);
    
    if (items.length === 0) {
      console.error('❌ No menu items available');
      return;
    }

    // Pick first 2 items
    const selectedItems = items.slice(0, 2);
    console.log('   Selected items:');
    selectedItems.forEach(item => {
      console.log(`   - ${item.name} ($${item.price}) from restaurant ID: ${item.restaurant_id}`);
    });
    console.log('');

    // Step 3: Simulate cart (prepare order data)
    console.log('Step 3: Preparing order...');
    const restaurantId = selectedItems[0].restaurant_id;
    
    const cartItems = selectedItems.map(item => ({
      item_id: item.item_id || item.menu_item_id,
      item_name: item.name,
      item_price: parseFloat(item.price),
      quantity: 2,
      subtotal: parseFloat(item.price) * 2
    }));

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = 3.99;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + deliveryFee + tax;

    const orderData = {
      restaurant_id: restaurantId,
      delivery_address: '123 Test Street, Test City, TC 12345',
      special_instructions: 'Test order - please handle with care',
      subtotal: parseFloat(subtotal.toFixed(2)),
      delivery_fee: deliveryFee,
      tax: parseFloat(tax.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      items: cartItems
    };

    console.log('   Order Summary:');
    console.log(`   - Restaurant ID: ${restaurantId}`);
    console.log(`   - Items: ${cartItems.length}`);
    console.log(`   - Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   - Delivery Fee: $${deliveryFee.toFixed(2)}`);
    console.log(`   - Tax: $${tax.toFixed(2)}`);
    console.log(`   - Total: $${totalAmount.toFixed(2)}`);
    console.log('');

    // Step 4: Place order
    console.log('Step 4: Placing order...');
    const orderResponse = await fetch(`${API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const orderResult = await orderResponse.json();

    if (!orderResponse.ok || !orderResult.success) {
      console.error('❌ Order placement failed');
      console.error('   Status:', orderResponse.status);
      console.error('   Message:', orderResult.message || orderResult.error);
      return;
    }

    console.log('✅ Order placed successfully!');
    console.log(`   Order ID: ${orderResult.orderId}`);
    console.log(`   Order Number: ${orderResult.orderNumber}`);
    console.log('');

    // Step 5: Verify order
    console.log('Step 5: Verifying order...');
    const verifyResponse = await fetch(`${API_URL}/orders/${orderResult.orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.success) {
      console.error('❌ Failed to verify order');
      return;
    }

    console.log('✅ Order verified successfully!');
    console.log(`   Status: ${verifyData.order.status}`);
    console.log(`   Items in order: ${verifyData.order.items.length}`);
    console.log('');

    console.log('🎉 All tests passed! Order flow is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testOrderFlow();
