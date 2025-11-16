// Quick registration test
const http = require('http');

console.log('Starting registration test...');

const postData = JSON.stringify({
  first_name: 'Test',
  last_name: 'User',
  email: `test${Date.now()}@test.com`,
  password: 'test123',
  user_type: 'customer',
  phone: '555-1234',
  city: 'NYC'
});

console.log('Request data:', postData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Connecting to:', options.hostname + ':' + options.port);

const req = http.request(options, (res) => {
  console.log('Response received with status:', res.statusCode);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ Status:', res.statusCode);
      console.log('📨 Response:', JSON.stringify(parsed, null, 2));
    } catch(e) {
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('Make sure backend is running on port 5000');
  process.exit(1);
});

console.log('Sending request...');
req.write(postData);
req.end();
