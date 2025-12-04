const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    // Check for created_at or similar timestamp columns in projects table
    const res = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND (column_name LIKE '%created%' OR column_name LIKE '%time%')
    `);
    
    console.log('Timestamp columns in projects table:');
    console.log(res.rows);
    
    // Also check all columns
    const allCols = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    console.log('\nAll columns in projects table:');
    console.log(allCols.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns();