const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL, // Use connection URL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Database connected successfully');
  connection.release(); // Release the connection back to the pool
});

// Handle pool errors (e.g., connection lost)
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

// Export the promise version of the pool
module.exports = pool.promise();
