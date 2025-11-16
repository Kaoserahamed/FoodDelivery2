// database/db.js
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'tastenow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await connection.getConnection();
    console.log("✅ MySQL Database Connected Successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);
  }
})();

module.exports = connection;
