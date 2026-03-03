/**
 * Migration 020: Tender Pool Rotation — add columns to tender_vault_projects
 * and create tender_rotation_batch_items for non-repeating batches.
 */
const pool = require("../../models/db.js");

function randomBase36(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

async function up() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: cols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tender_vault_projects'
    `);
    const has = (name) => cols.some((r) => r.column_name === name);

    if (!has("client_public_id")) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        ADD COLUMN client_public_id VARCHAR(20) UNIQUE
      `);
      const { rows: existing } = await client.query(
        `SELECT id FROM public.tender_vault_projects`
      );
      const used = new Set();
      for (const r of existing) {
        let id;
        for (let i = 0; i < 20; i++) {
          id = "TV-" + randomBase36(12);
          if (!used.has(id)) break;
        }
        used.add(id);
        await client.query(
          `UPDATE public.tender_vault_projects SET client_public_id = $1 WHERE id = $2`,
          [id, r.id]
        );
      }
      if (existing.length > 0) {
        await client.query(`
          ALTER TABLE public.tender_vault_projects
          ALTER COLUMN client_public_id SET NOT NULL
        `);
      }
      console.log("✅ tender_vault_projects.client_public_id added");
    }

    if (!has("rotation_visible_until")) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        ADD COLUMN rotation_visible_until TIMESTAMP NULL
      `);
      console.log("✅ tender_vault_projects.rotation_visible_until added");
    }

    if (!has("last_rotated_at")) {
      await client.query(`
        ALTER TABLE public.tender_vault_projects
        ADD COLUMN last_rotated_at TIMESTAMP NULL
      `);
      console.log("✅ tender_vault_projects.last_rotated_at added");
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tvp_rotation_visible_until
      ON public.tender_vault_projects(rotation_visible_until)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tvp_last_rotated_at
      ON public.tender_vault_projects(last_rotated_at)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.tender_rotation_batch_items (
        log_id INTEGER NOT NULL REFERENCES public.tender_rotation_logs(id) ON DELETE CASCADE,
        tender_id INTEGER NOT NULL REFERENCES public.tender_vault_projects(id) ON DELETE CASCADE,
        PRIMARY KEY (log_id, tender_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tender_rotation_batch_items_log_id
      ON public.tender_rotation_batch_items(log_id)
    `);
    console.log("✅ tender_rotation_batch_items created");

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration 020 error:", err);
    throw err;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DROP TABLE IF EXISTS public.tender_rotation_batch_items CASCADE");
    await client.query("DROP INDEX IF EXISTS public.idx_tvp_rotation_visible_until");
    await client.query("DROP INDEX IF EXISTS public.idx_tvp_last_rotated_at");
    await client.query("ALTER TABLE public.tender_vault_projects DROP COLUMN IF EXISTS rotation_visible_until");
    await client.query("ALTER TABLE public.tender_vault_projects DROP COLUMN IF EXISTS last_rotated_at");
    await client.query("ALTER TABLE public.tender_vault_projects DROP COLUMN IF EXISTS client_public_id");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
