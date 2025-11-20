// Using built-in fetch (Node 18+) or fallback

const API_BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 1; // Change this to test different restaurants

async function testMenuAPI() {
    console.log('='.repeat(60));
    console.log('Testing Menu API Endpoints');
    console.log('='.repeat(60));
    console.log('');

    // Test 1: Get Restaurant Data
    console.log('📍 Test 1: Fetching restaurant data...');
    console.log(`URL: ${API_BASE_URL}/restaurants/${RESTAURANT_ID}`);
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${RESTAURANT_ID}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        } else {
            const data = await response.json();
            console.log('✅ Restaurant Data:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    // Test 2: Get Restaurant Menu
    console.log('🍽️ Test 2: Fetching restaurant menu...');
    console.log(`URL: ${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu`);
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${RESTAURANT_ID}/menu`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        } else {
            const data = await response.json();
            console.log('✅ Menu Data Structure:', {
                hasSuccess: 'success' in data,
                hasItems: 'items' in data,
                isArray: Array.isArray(data),
                itemCount: Array.isArray(data) ? data.length : (data.items ? data.items.length : 0)
            });
            
            if (data.success && data.items) {
                console.log('✅ First Menu Item:', JSON.stringify(data.items[0], null, 2));
            } else if (Array.isArray(data) && data.length > 0) {
                console.log('✅ First Menu Item:', JSON.stringify(data[0], null, 2));
            } else {
                console.log('⚠️ Full Response:', JSON.stringify(data, null, 2));
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    // Test 3: Get All Restaurants
    console.log('🏪 Test 3: Fetching all restaurants...');
    console.log(`URL: ${API_BASE_URL}/restaurants`);
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        } else {
            const data = await response.json();
            console.log('✅ Total Restaurants:', data.length);
            if (data.length > 0) {
                console.log('✅ First Restaurant:', JSON.stringify(data[0], null, 2));
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('Test Complete');
    console.log('='.repeat(60));
}

// Run the test
testMenuAPI().catch(console.error);
