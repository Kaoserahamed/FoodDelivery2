const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetPassword() {
    try {
        console.log('🔧 Resetting restaurant password...\n');

        const email = 'spicepalace@restaurant.com';
        const password = 'password123';

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        console.log('✅ Password updated successfully!');

        console.log('\n📋 Restaurant Login Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Restaurant: Spice Palace (ID: 1)');
        console.log('\n✨ You can now login at: http://localhost:5000/pages/restaurant/login.html');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetPassword();
