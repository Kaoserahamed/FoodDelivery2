const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing Backend API Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');

    // Test 2: Restaurants
    console.log('2. Testing Restaurants Endpoint...');
    const restaurants = await axios.get(`${API_BASE}/restaurants`);
    console.log('✅ Restaurants Count:', restaurants.data.length);
    if (restaurants.data.length > 0) {
      console.log('   Sample Restaurant:', {
        id: restaurants.data[0].restaurant_id,
        name: restaurants.data[0].name,
        cuisine: restaurants.data[0].cuisine_type
      });
    }
    console.log('');

    // Test 3: Menu Items
    console.log('3. Testing Menu Items Endpoint...');
    const menu = await axios.get(`${API_BASE}/menu/items/public`);
    const menuData = menu.data.items || menu.data;
    console.log('✅ Menu Items Count:', Array.isArray(menuData) ? menuData.length : 0);
    if (Array.isArray(menuData) && menuData.length > 0) {
      console.log('   Sample Menu Item:', {
        id: menuData[0].item_id,
        name: menuData[0].name,
        price: menuData[0].price,
        restaurant: menuData[0].restaurant_name
      });
    }
    console.log('');

    console.log('🎉 All API endpoints are working correctly!');
    console.log('📝 Your React frontend should now be able to connect to the backend.');
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure your backend server is running on port 5000');
      console.log('   Run: node server.js');
    } else if (error.response) {
      console.log('\n📊 Response Status:', error.response.status);
      console.log('📊 Response Data:', error.response.data);
    }
  }
}

// Run the test
testConnection();