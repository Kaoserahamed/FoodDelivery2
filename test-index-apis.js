const http = require('http');

function makeRequest(options) {
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
        req.end();
    });
}

async function testAPIs() {
    try {
        // Test restaurants API
        console.log('🏪 Testing Restaurants API...');
        const restaurants = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/restaurants',
            method: 'GET'
        });
        
        console.log('Restaurants response type:', Array.isArray(restaurants) ? 'Array' : typeof restaurants);
        if (Array.isArray(restaurants)) {
            console.log(`Found ${restaurants.length} restaurants`);
            if (restaurants.length > 0) {
                console.log('Sample restaurant:', JSON.stringify(restaurants[0], null, 2));
            }
        } else {
            console.log('Response:', JSON.stringify(restaurants, null, 2));
        }

        // Test menu items API
        console.log('\n🍽️ Testing Menu Items API...');
        const menuItems = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/menu/items/public',
            method: 'GET'
        });
        
        console.log('Menu items response type:', typeof menuItems);
        if (menuItems.success && Array.isArray(menuItems.items)) {
            console.log(`Found ${menuItems.items.length} menu items`);
            if (menuItems.items.length > 0) {
                console.log('Sample item:', JSON.stringify(menuItems.items[0], null, 2));
            }
        } else if (Array.isArray(menuItems)) {
            console.log(`Found ${menuItems.length} menu items (direct array)`);
            if (menuItems.length > 0) {
                console.log('Sample item:', JSON.stringify(menuItems[0], null, 2));
            }
        } else {
            console.log('Response:', JSON.stringify(menuItems, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAPIs();
