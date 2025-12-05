import pool from "./models/db.js";

async function testSchema() {
  try {
    const res = await pool.query(`SELECT * FROM offers LIMIT 1`);
    console.log("Column names:", Object.keys(res.rows[0]));
    console.log("Sample row:", res.rows[0]);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
}

testSchema();