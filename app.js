require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3010;

// PostgreSQL connection pool
const pool = new Pool();

// Function to create table and insert data
async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('[Database] Setting up database and inserting sample data...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    console.log('[Database] Table "users" ensured.');

    await client.query(`
      INSERT INTO users (name, email)
      VALUES 
        ('Alice', 'alice@example.com'),
        ('Bob', 'bob@example.com'),
        ('Charlie', 'charlie@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('[Database] Sample user data inserted (if not already present).');

  } catch (err) {
    console.error('[Database] Error during setup:', err);
  } finally {
    client.release();
  }
}

// Root route to show users
app.get('/', async (req, res) => {
  console.log('[Route: GET /] Fetching users from database...');
  try {
    const result = await pool.query('SELECT * FROM users;');
    console.log(`[Route: GET /] Retrieved ${result.rowCount} users.`);
    res.json(result.rows);
  } catch (err) {
    console.error('[Route: GET /] Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});

// Start app
app.listen(port, async () => {
  console.log(`[App] Starting server on port ${port}...`);
  await setupDatabase();
  console.log(`[App] Server is running at http://localhost:${port}`);
});
