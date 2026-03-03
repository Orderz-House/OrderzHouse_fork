/**
 * Migration 017: Add tender_cycle_id to offers for rotation bids
 * When set, the offer is for a rotating tender (cycle); award must be blocked.
 */
const pool = require("../../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'offers' AND column_name = 'tender_cycle_id'`
    );
    if (rows.length === 0) {
      await client.query(`
        ALTER TABLE public.offers
        ADD COLUMN tender_cycle_id INTEGER REFERENCES public.tender_vault_cycles(id) ON DELETE SET NULL
      `);
      console.log("✅ offers.tender_cycle_id added");
    }

    // Allow project_id to be NULL when offer is for a rotation tender (tender_cycle_id set)
    await client.query(`
      ALTER TABLE public.offers ALTER COLUMN project_id DROP NOT NULL
    `).catch(() => {});

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 017 error:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("ALTER TABLE public.offers DROP COLUMN IF EXISTS tender_cycle_id");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
