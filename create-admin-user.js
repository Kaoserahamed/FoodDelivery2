const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...\n');

        const email = 'admin@tastenow.com';
        const password = 'admin123';
        const name = 'Admin User';

        // Check if admin already exists
        const [existingAdmins] = await db.query('SELECT * FROM users WHERE email = ? AND user_type = ?', [email, 'admin']);

        if (existingAdmins.length > 0) {
            console.log('⚠️  Admin user already exists. Updating password...');
            
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password = ?, user_type = ? WHERE email = ?', [hashedPassword, 'admin', email]);
            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('📝 Creating new admin user...');
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO users (name, email, phone, password, user_type, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [name, email, '+1234567890', hashedPassword, 'admin', 'Admin Office']
            );
            
            console.log('✅ Admin user created successfully! User ID:', result.insertId);
        }

        console.log('\n📋 Admin Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Login URL: http://localhost:5000/pages/admin/login.html');
        console.log('\n✨ You can now login to the admin panel!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdminUser();
