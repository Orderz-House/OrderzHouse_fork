/**
 * Migration 021: Allow status 'skipped' in tender_rotation_logs
 * (for minimum threshold rule: log when rotation is skipped due to < 300 tenders)
 */
const pool = require("../../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      ALTER TABLE public.tender_rotation_logs
      DROP CONSTRAINT IF EXISTS tender_rotation_logs_status_check
    `);
    await client.query(`
      ALTER TABLE public.tender_rotation_logs
      ADD CONSTRAINT tender_rotation_logs_status_check
      CHECK (status IN ('success', 'error', 'skipped'))
    `);
    await client.query("COMMIT");
    console.log("✅ tender_rotation_logs status check updated (success, error, skipped)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 021 error:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      ALTER TABLE public.tender_rotation_logs
      DROP CONSTRAINT IF EXISTS tender_rotation_logs_status_check
    `);
    await client.query(`
      ALTER TABLE public.tender_rotation_logs
      ADD CONSTRAINT tender_rotation_logs_status_check
      CHECK (status IN ('success', 'error'))
    `);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
