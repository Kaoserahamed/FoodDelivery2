/**
 * Test Restaurant Orders Flow
 * This script tests:
 * 1. Login as restaurant
 * 2. Fetch restaurant orders
 */

const API_URL = 'http://localhost:5000/api';

async function testRestaurantOrders() {
  console.log('🧪 Testing Restaurant Orders...\n');

  try {
    // Step 1: Login as restaurant
    console.log('Step 1: Login as restaurant...');
    
    // First, let's check if we have a restaurant user
    const loginResponse = await fetch(`${API_URL}/restaurant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'spicepalace@restaurant.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.token) {
      console.error('❌ Restaurant login failed:', loginData.message || 'No token received');
      console.log('   Trying to create a restaurant user...\n');
      
      // Try to register a restaurant
      const signupResponse = await fetch(`${API_URL}/restaurant/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Restaurant',
          email: 'restaurant@test.com',
          password: 'password123',
          phone: '+1234567890',
          address: '123 Restaurant Street',
          cuisine_type: 'Italian',
          description: 'Test restaurant for order management'
        })
      });

      const signupData = await signupResponse.json();
      
      if (!signupResponse.ok || !signupData.token) {
        console.error('❌ Restaurant signup failed:', signupData.message);
        return;
      }

      console.log('✅ Restaurant created and logged in');
      var token = signupData.token;
    } else {
      console.log('✅ Restaurant login successful');
      var token = loginData.token;
    }

    console.log('   Token:', token.substring(0, 20) + '...\n');

    // Step 2: Fetch restaurant orders
    console.log('Step 2: Fetching restaurant orders...');
    const ordersResponse = await fetch(`${API_URL}/restaurant/orders?limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text();
      console.error('❌ Failed to fetch orders');
      console.error('   Status:', ordersResponse.status);
      console.error('   Response:', errorText);
      return;
    }

    const ordersData = await ordersResponse.json();

    if (!ordersResponse.ok) {
      console.error('❌ Failed to fetch orders');
      console.error('   Status:', ordersResponse.status);
      console.error('   Message:', ordersData.message || ordersData.error);
      return;
    }

    console.log('✅ Orders fetched successfully!');
    console.log(`   Total orders: ${ordersData.orders.length}`);
    
    if (ordersData.orders.length > 0) {
      console.log('\n   Recent orders:');
      ordersData.orders.slice(0, 5).forEach(order => {
        console.log(`   - Order #${order.order_id}: ${order.customer_name} - $${order.total_amount} (${order.status})`);
      });
    } else {
      console.log('   No orders found for this restaurant yet.');
    }

    // Step 3: Get order statistics
    console.log('\nStep 3: Fetching order statistics...');
    const statsResponse = await fetch(`${API_URL}/restaurant/orders/stats/by-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const statsData = await statsResponse.json();

    if (statsResponse.ok && statsData.success) {
      console.log('✅ Statistics fetched successfully!');
      console.log('   Status breakdown:');
      Object.entries(statsData.statusCounts).forEach(([status, count]) => {
        if (count > 0) {
          console.log(`   - ${status}: ${count}`);
        }
      });
    }

    console.log('\n🎉 Restaurant orders system is working!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRestaurantOrders();
