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
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO users (name, email)
      VALUES 
        ('Alice', 'alice@example.com'),
        ('Bob', 'bob@example.com'),
        ('Charlie', 'charlie@example.com')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database is set up and sample data inserted.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
  }
}

// Root route to show users
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching users');
  }
});

// Start app
app.listen(port, async () => {
  await setupDatabase();
  console.log(`App running on http://localhost:${port}`);
});
