/**
 * Migration 016: Create tender_rotation_logs table
 * Logs each run of the tender rotation engine (cycle-only, no projects table).
 */
const pool = require("../../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.tender_rotation_logs (
        id SERIAL PRIMARY KEY,
        triggered_by_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
        selected_count INTEGER NOT NULL DEFAULT 0,
        skipped_cooldown INTEGER NOT NULL DEFAULT 0,
        skipped_max_usage INTEGER NOT NULL DEFAULT 0,
        skipped_archived INTEGER NOT NULL DEFAULT 0,
        execution_time_ms INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tender_rotation_logs_created_at
      ON public.tender_rotation_logs(created_at);
    `);

    await client.query("COMMIT");
    console.log("✅ tender_rotation_logs table created");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 016 error:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DROP TABLE IF EXISTS public.tender_rotation_logs CASCADE;");
    await client.query("COMMIT");
    console.log("✅ tender_rotation_logs dropped");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
