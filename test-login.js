const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
    console.log('🧪 Testing Login Functionality\n');
    console.log('═══════════════════════════════════════════════════');

    // Test 1: Health Check
    console.log('\n1️⃣ Testing Backend Health...');
    try {
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Backend is running:', healthData);
    } catch (error) {
        console.error('❌ Backend health check failed:', error.message);
        return;
    }

    // Test 2: Login with test credentials
    console.log('\n2️⃣ Testing Login Endpoint...');
    const testCredentials = {
        email: 'test@example.com',
        password: 'password123'
    };

    try {
        console.log('📤 Sending login request with:', testCredentials);
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testCredentials)
        });

        console.log('📥 Response Status:', loginResponse.status);
        console.log('📥 Response Headers:', Object.fromEntries(loginResponse.headers.entries()));

        const responseText = await loginResponse.text();
        console.log('📥 Raw Response:', responseText);

        let loginData;
        try {
            loginData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response');
            return;
        }

        if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('Token:', loginData.token?.substring(0, 20) + '...');
            console.log('User:', loginData.user);
        } else {
            console.log('❌ Login failed:', loginData.message);
            
            // Try to register the user first
            console.log('\n3️⃣ Attempting to register test user...');
            const registerData = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                password: 'password123',
                phone: '+1234567890',
                user_type: 'customer'
            };

            const registerResponse = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const registerResult = await registerResponse.json();
            
            if (registerResponse.ok) {
                console.log('✅ User registered successfully:', registerResult);
                
                // Try login again
                console.log('\n4️⃣ Retrying login...');
                const retryResponse = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(testCredentials)
                });

                const retryData = await retryResponse.json();
                
                if (retryResponse.ok) {
                    console.log('✅ Login successful after registration!');
                    console.log('Token:', retryData.token?.substring(0, 20) + '...');
                    console.log('User:', retryData.user);
                } else {
                    console.log('❌ Login still failed:', retryData.message);
                }
            } else {
                console.log('❌ Registration failed:', registerResult.message);
            }
        }
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✨ Test completed\n');
}

testLogin();
