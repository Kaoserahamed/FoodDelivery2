const db = require('./config/database');

async function checkRestaurants() {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.user_id,
        u.email, 
        u.user_type, 
        r.name as restaurant_name, 
        r.restaurant_id 
      FROM users u 
      LEFT JOIN restaurants r ON u.user_id = r.user_id 
      WHERE u.user_type = 'restaurant' 
      LIMIT 5
    `);
    
    console.log('Restaurants in database:');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length === 0) {
      console.log('\nNo restaurants found. The orders placed are for restaurant_id 1.');
      console.log('Let me check which restaurant has ID 1:');
      
      const [restaurant] = await db.query('SELECT * FROM restaurants WHERE restaurant_id = 1');
      console.log(JSON.stringify(restaurant, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRestaurants();
