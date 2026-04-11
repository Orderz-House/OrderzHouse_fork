/**
 * Migration 024: Optional manual freelancer assignment at project create (selected clients only).
 * Adds users.can_assign_freelancer_on_create (default false).
 *
 * Run from backendEsModule: node migrations/024_add_can_assign_freelancer_on_create.js
 */

import pool from "../models/db.js";

export async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS can_assign_freelancer_on_create BOOLEAN NOT NULL DEFAULT false;
    `);
    await client.query("COMMIT");
    console.log("✅ Migration 024: can_assign_freelancer_on_create on users");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 024 up failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS can_assign_freelancer_on_create;
    `);
    await client.query("COMMIT");
    console.log("✅ Migration 024 reverted");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 024 down failed:", err);
    throw err;
  } finally {
    client.release();
  }
}
