/**
 * Migration 018: Simplify tender_vault_projects — drop country and sub_sub_category_id
 * We no longer use: country, sub_sub_category_id (and metadata sub_category_id/sub_sub_category_id/skills are not dropped from metadata column).
 */
const pool = require("../../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE public.tender_vault_projects
      DROP COLUMN IF EXISTS country
    `);
    console.log("✅ Dropped tender_vault_projects.country");

    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tender_vault_projects' AND column_name = 'sub_sub_category_id'
    `);
    if (rows.length > 0) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        DROP COLUMN IF EXISTS sub_sub_category_id
      `);
      console.log("✅ Dropped tender_vault_projects.sub_sub_category_id");
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 018 error:", err);
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
      ADD COLUMN IF NOT EXISTS country VARCHAR(100)
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
