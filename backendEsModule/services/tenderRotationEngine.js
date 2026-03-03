/**
 * Tender Rotation Engine (cycle-only, no projects table)
 *
 * Uses only tender_vault_projects, tender_vault_cycles, tender_rotation_logs.
 * - Expires cycles where display_end_time < NOW()
 * - Keeps 8–12 active cycles from published tenders
 * - Logs each run to tender_rotation_logs
 */

import pool from "../models/db.js";

const MIN_ACTIVE_CYCLES = 8;
const MAX_SELECT = 12;
const DISPLAY_HOURS = 12;
const REUSE_COOLDOWN_HOURS = 24;

function generateTemporaryClientId() {
  const n = Math.floor(100000000 + Math.random() * 900000000);
  return `CL-${n}`;
}

async function ensureUniqueClientId() {
  for (let i = 0; i < 10; i++) {
    const clientId = generateTemporaryClientId();
    const { rows } = await pool.query(
      `SELECT id FROM tender_vault_cycles WHERE client_public_id = $1`,
      [clientId]
    );
    if (rows.length === 0) return clientId;
  }
  throw new Error("Could not generate unique client_public_id");
}

/**
 * 1) Expire cycles: SET status = 'expired' WHERE status = 'active' AND display_end_time < NOW()
 */
export async function expireActiveCycles() {
  const { rows } = await pool.query(
    `UPDATE tender_vault_cycles
     SET status = 'expired', updated_at = NOW()
     WHERE status = 'active' AND display_end_time < NOW()
     RETURNING id`
  );
  return rows.length;
}

/**
 * 2) Count active cycles (status = 'active' AND display_end_time > NOW())
 */
export async function countActiveCycles() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM tender_vault_cycles
     WHERE status = 'active' AND display_end_time > NOW()`
  );
  return Number(rows[0]?.cnt || 0);
}

/**
 * 3) Select eligible tenders (published, not deleted, usage < max_usage, cooldown, not archived, not already in active cycle)
 *    Returns up to `limit` rows.
 */
export async function selectEligibleTenders(limit) {
  const { rows } = await pool.query(
    `SELECT tv.id, tv.usage_count, tv.max_usage
     FROM tender_vault_projects tv
     WHERE tv.status = 'published'
       AND tv.is_deleted = false
       AND (tv.max_usage IS NULL OR tv.usage_count < tv.max_usage)
       AND (tv.last_displayed_at IS NULL OR tv.last_displayed_at < NOW() - ($1::text || ' hours')::interval)
       AND (tv.temporary_archived_until IS NULL OR tv.temporary_archived_until < NOW())
       AND NOT EXISTS (
         SELECT 1 FROM tender_vault_cycles tcy
         WHERE tcy.tender_id = tv.id
           AND tcy.status = 'active'
           AND tcy.display_end_time > NOW()
       )
     ORDER BY RANDOM()
     LIMIT $2`,
    [REUSE_COOLDOWN_HOURS, limit]
  );
  return rows;
}

/**
 * 4) Insert one cycle and update tender (usage_count, last_displayed_at)
 */
async function insertCycleAndUpdateTender(client, tenderId, cycleNumber, clientPublicId, displayStart, displayEnd) {
  await client.query(
    `INSERT INTO tender_vault_cycles (
       tender_id, cycle_number, client_public_id, status,
       display_start_time, display_end_time
     ) VALUES ($1, $2, $3, 'active', $4, $5)`,
    [tenderId, cycleNumber, clientPublicId, displayStart, displayEnd]
  );
  await client.query(
    `UPDATE tender_vault_projects
     SET usage_count = COALESCE(usage_count, 0) + 1,
         last_displayed_at = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [displayStart, tenderId]
  );
}

/**
 * 5) Run full rotation: expire → count → if active < 8, create new cycles (8–12) → log
 */
export async function runTenderRotation() {
  const startMs = Date.now();
  let selectedCount = 0;
  let skippedCooldown = 0;
  let skippedMaxUsage = 0;
  let skippedArchived = 0;
  let status = "success";
  let errorMessage = null;

  try {
    const expired = await expireActiveCycles();
    if (expired > 0) {
      console.log(`[TenderRotation] Expired ${expired} cycle(s)`);
    }

    const active = await countActiveCycles();
    if (active >= MIN_ACTIVE_CYCLES) {
      const executionTimeMs = Date.now() - startMs;
      await logRotationRun(null, selectedCount, skippedCooldown, skippedMaxUsage, skippedArchived, executionTimeMs, "success", null);
      return { expired, active, created: 0, executionTimeMs };
    }

    const toCreate = Math.min(MAX_SELECT, Math.max(MIN_ACTIVE_CYCLES - active, 0));
    const eligible = await selectEligibleTenders(toCreate);

    if (eligible.length === 0) {
      const executionTimeMs = Date.now() - startMs;
      await logRotationRun(null, 0, skippedCooldown, skippedMaxUsage, skippedArchived, executionTimeMs, "success", null);
      return { expired, active, created: 0, message: "No eligible tenders", executionTimeMs };
    }

    const displayStart = new Date();
    const displayEnd = new Date();
    displayEnd.setHours(displayEnd.getHours() + DISPLAY_HOURS);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const t of eligible) {
        const clientPublicId = await ensureUniqueClientId();
        const cycleNumber = (t.usage_count || 0) + 1;
        await insertCycleAndUpdateTender(client, t.id, cycleNumber, clientPublicId, displayStart, displayEnd);
        selectedCount++;
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const executionTimeMs = Date.now() - startMs;
    await logRotationRun(null, selectedCount, skippedCooldown, skippedMaxUsage, skippedArchived, executionTimeMs, "success", null);
    console.log(`[TenderRotation] Created ${selectedCount} cycle(s), active now ${active + selectedCount}`);

    return {
      expired,
      active: active + selectedCount,
      created: selectedCount,
      executionTimeMs,
    };
  } catch (err) {
    status = "error";
    errorMessage = err.message || String(err);
    const executionTimeMs = Date.now() - startMs;
    await logRotationRun(null, selectedCount, skippedCooldown, skippedMaxUsage, skippedArchived, executionTimeMs, "error", errorMessage).catch(() => {});
    console.error("[TenderRotation] Error:", err);
    throw err;
  }
}

/**
 * 6) Insert one row into tender_rotation_logs
 */
async function logRotationRun(triggeredByUserId, selectedCount, skippedCooldown, skippedMaxUsage, skippedArchived, executionTimeMs, status, errorMessage) {
  await pool.query(
    `INSERT INTO tender_rotation_logs (
       triggered_by_user_id, selected_count, skipped_cooldown, skipped_max_usage, skipped_archived,
       execution_time_ms, status, error_message
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      triggeredByUserId ?? null,
      selectedCount,
      skippedCooldown,
      skippedMaxUsage,
      skippedArchived,
      executionTimeMs,
      status,
      errorMessage ?? null,
    ]
  );
}
