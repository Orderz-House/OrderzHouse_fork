/**
 * Migration 019: Add single duration column (integer days) to tender_vault_projects.
 * Tender Vault uses tv.duration only; duration_value/duration_unit remain for other modules.
 */
const pool = require("../../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tender_vault_projects' AND column_name = 'duration'
    `);
    if (rows.length === 0) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        ADD COLUMN duration INTEGER
      `);
      console.log("✅ Added tender_vault_projects.duration");

      await client.query(`
        UPDATE public.tender_vault_projects
        SET duration = duration_value
        WHERE duration_unit = 'days' AND duration_value IS NOT NULL
      `);
      console.log("✅ Backfilled duration from duration_value (days)");
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 019 error:", err);
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
      ALTER TABLE public.tender_vault_projects
      DROP COLUMN IF EXISTS duration
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
