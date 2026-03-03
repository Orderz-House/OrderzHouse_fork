/**
 * Migration 015: Fake Project Rotation System
 *
 * 1) projects table: add columns for fake (tender-vault-injected) projects
 *    - is_fake BOOLEAN DEFAULT false
 *    - fake_source_id INTEGER REFERENCES tender_vault_projects(id) ON DELETE SET NULL
 *    - fake_expires_at TIMESTAMP
 *    - fake_rotation_batch_id UUID (optional grouping per batch)
 *
 * 2) tender_vault_projects: add last_fake_displayed_at for duplicate prevention
 *    - last_fake_displayed_at TIMESTAMP
 *
 * Using columns on projects (not a separate table) keeps listing as a single query
 * and makes award/contract/payment guards trivial (check p.is_fake).
 */

const pool = require("../models/db.js");

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- 1) projects: fake rotation columns ---
    const projectCols = [
      { name: "is_fake", type: "BOOLEAN NOT NULL DEFAULT false" },
      {
        name: "fake_source_id",
        type:
          "INTEGER REFERENCES public.tender_vault_projects(id) ON DELETE SET NULL",
      },
      { name: "fake_expires_at", type: "TIMESTAMP" },
      { name: "fake_rotation_batch_id", type: "UUID" },
    ];

    for (const col of projectCols) {
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = $1`,
        [col.name]
      );
      if (rows.length === 0) {
        await client.query(
          `ALTER TABLE public.projects ADD COLUMN ${col.name} ${col.type}`
        );
        console.log(`✅ projects: added column ${col.name}`);
      }
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_fake_expires
      ON public.projects(is_fake, fake_expires_at)
      WHERE is_fake = true
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_fake_source_id
      ON public.projects(fake_source_id)
      WHERE fake_source_id IS NOT NULL
    `);

    // --- 2) tender_vault_projects: last_fake_displayed_at ---
    const { rows: tvCols } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'tender_vault_projects' AND column_name = 'last_fake_displayed_at'`
    );
    if (tvCols.length === 0) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        ADD COLUMN last_fake_displayed_at TIMESTAMP
      `);
      console.log("✅ tender_vault_projects: added column last_fake_displayed_at");
    }

    await client.query("COMMIT");
    console.log("✅ Migration 015 (fake project rotation) completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 015 error:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`DROP INDEX IF EXISTS public.idx_projects_fake_expires`);
    await client.query(`DROP INDEX IF EXISTS public.idx_projects_fake_source_id`);

    for (const col of [
      "is_fake",
      "fake_source_id",
      "fake_expires_at",
      "fake_rotation_batch_id",
    ]) {
      await client.query(
        `ALTER TABLE public.projects DROP COLUMN IF EXISTS ${col}`
      );
    }

    await client.query(`
      ALTER TABLE public.tender_vault_projects
      DROP COLUMN IF EXISTS last_fake_displayed_at
    `);

    await client.query("COMMIT");
    console.log("✅ Migration 015 reverted");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 015 down error:", err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
