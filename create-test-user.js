const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createTestUser() {
    try {
        console.log('🔧 Creating test user...\n');

        const email = 'test@example.com';
        const password = 'password123';
        const name = 'Test User';

        // Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            console.log('⚠️  User already exists. Updating password...');
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Update user
            await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
            console.log('✅ Password updated successfully!');
        } else {
            console.log('📝 Creating new user...');
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            const [result] = await db.query(
                'INSERT INTO users (name, email, phone, password, user_type, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [name, email, '+1234567890', hashedPassword, 'customer', 'Test City']
            );
            
            console.log('✅ User created successfully! User ID:', result.insertId);
        }

        console.log('\n📋 Test Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('\n✨ You can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUser();
