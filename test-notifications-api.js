const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testNotificationsAPI() {
    try {
        console.log('🧪 Testing Notifications API...\n');
        
        // Login as restaurant owner
        console.log('🔐 Logging in as restaurant owner...');
        const loginResult = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/restaurant/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'spicepalace@restaurant.com',
            password: 'password123'
        });
        
        if (loginResult.status !== 200 || !loginResult.data.token) {
            console.error('❌ Login failed:', loginResult.data);
            return;
        }
        
        console.log('✅ Login successful');
        console.log('Token:', loginResult.data.token.substring(0, 50) + '...');
        
        const token = loginResult.data.token;
        
        // Test notifications endpoint
        console.log('\n🔔 Fetching notifications...');
        const notificationsResult = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/notifications/restaurant',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', notificationsResult.status);
        console.log('Response:', JSON.stringify(notificationsResult.data, null, 2));
        
        if (notificationsResult.data.success) {
            console.log(`\n✅ Found ${notificationsResult.data.notifications.length} notifications`);
            console.log(`Unread count: ${notificationsResult.data.unreadCount}`);
        } else {
            console.log('❌ Failed to fetch notifications:', notificationsResult.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testNotificationsAPI();
