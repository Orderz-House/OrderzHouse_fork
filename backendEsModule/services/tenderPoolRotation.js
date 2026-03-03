/**
 * Tender Pool Rotation (40–70 tenders every 12 hours)
 * - Does NOT use projects table or tender_vault_cycles for this pool.
 * - Uses tender_vault_projects.rotation_visible_until, last_rotated_at.
 * - Tenders with rotation_visible_until > NOW() appear in public Projects pool.
 * - Batch tracking via tender_rotation_batch_items so next cycle does not reuse last batch.
 */

import pool from "../models/db.js";

const VISIBILITY_HOURS = 12;
const COOLDOWN_HOURS = 24;
const MIN_VISIBLE = 40;
const BATCH_MIN = 40;
const BATCH_MAX = 70;
const MIN_TENDERS_TO_START = 300;

/**
 * A) Expire tenders whose rotation_visible_until has passed.
 */
export async function expireRotatedTenders() {
  const { rowCount } = await pool.query(
    `UPDATE tender_vault_projects
     SET rotation_visible_until = NULL
     WHERE rotation_visible_until IS NOT NULL
       AND rotation_visible_until <= NOW()
       AND is_deleted = false`
  );
  return rowCount ?? 0;
}

/**
 * B) Count tenders currently visible in pool (rotation_visible_until > NOW()).
 */
export async function countVisibleInPool() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM tender_vault_projects
     WHERE rotation_visible_until IS NOT NULL
       AND rotation_visible_until > NOW()
       AND status = 'published'
       AND is_deleted = false`
  );
  return Number(rows[0]?.cnt || 0);
}

/**
 * C) Select eligible tenders for next batch.
 * - status = 'published', is_deleted = false
 * - rotation_visible_until IS NULL (not currently visible)
 * - last_rotated_at IS NULL OR last_rotated_at < NOW() - cooldownHours
 * - Exclude tenders that were in the most recent batch (tender_rotation_batch_items with latest log_id)
 */
export async function selectEligibleTenders(batchSize, cooldownHours = COOLDOWN_HOURS) {
  const { rows } = await pool.query(
    `WITH last_batch AS (
       SELECT tender_id FROM tender_rotation_batch_items
       WHERE log_id = (SELECT MAX(id) FROM tender_rotation_logs)
     )
     SELECT tv.id
     FROM tender_vault_projects tv
     WHERE tv.status = 'published'
       AND tv.is_deleted = false
       AND (tv.rotation_visible_until IS NULL OR tv.rotation_visible_until <= NOW())
       AND (tv.last_rotated_at IS NULL OR tv.last_rotated_at < NOW() - ($1::text || ' hours')::interval)
       AND NOT EXISTS (SELECT 1 FROM last_batch lb WHERE lb.tender_id = tv.id)
     ORDER BY RANDOM()
     LIMIT $2`,
    [String(cooldownHours), batchSize]
  );
  return rows.map((r) => r.id);
}

/**
 * D) Activate a batch: set rotation_visible_until = NOW() + 12h, last_rotated_at = NOW().
 */
export async function activateBatch(tenderIds) {
  if (!Array.isArray(tenderIds) || tenderIds.length === 0) return;
  const { rows } = await pool.query(
    `UPDATE tender_vault_projects
     SET rotation_visible_until = NOW() + ($1::text || ' hours')::interval,
         last_rotated_at = NOW()
     WHERE id = ANY($2)
     RETURNING id`,
    [String(VISIBILITY_HOURS), tenderIds]
  );
  return rows.length;
}

/**
 * Count published, non-deleted tenders (used for minimum threshold and admin status).
 */
export async function countPublishedTenders() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM tender_vault_projects
     WHERE status = 'published' AND is_deleted = false`
  );
  return Number(rows[0]?.cnt || 0);
}

/**
 * E) Run one rotation cycle: expire, then if visible count < 40, select 40–70 and activate.
 * Does NOT run unless total published tenders >= MIN_TENDERS_TO_START (300).
 * Logs to tender_rotation_logs and records batch in tender_rotation_batch_items.
 */
export async function runRotation() {
  const startMs = Date.now();
  let selectedCount = 0;
  let skippedCooldown = 0;

  const totalPublished = await countPublishedTenders();
  if (totalPublished < MIN_TENDERS_TO_START) {
    const executionTimeMs = Date.now() - startMs;
    await logPoolRun(0, 0, executionTimeMs, "skipped", "Minimum 300 tenders required to start rotation");
    return { expired: 0, activated: 0, visible: 0, skipped: true, totalPublished };
  }

  const expired = await expireRotatedTenders();
  const visibleNow = await countVisibleInPool();

  if (visibleNow >= MIN_VISIBLE) {
    const executionTimeMs = Date.now() - startMs;
    await logPoolRun(selectedCount, skippedCooldown, executionTimeMs, "success", null);
    return { expired, activated: 0, visible: visibleNow };
  }

  const batchSize = Math.floor(BATCH_MIN + Math.random() * (BATCH_MAX - BATCH_MIN + 1));
  const tenderIds = await selectEligibleTenders(batchSize, COOLDOWN_HOURS);
  selectedCount = tenderIds.length;

  if (tenderIds.length === 0) {
    const executionTimeMs = Date.now() - startMs;
    await logPoolRun(selectedCount, skippedCooldown, executionTimeMs, "success", null);
    return { expired, activated: 0, visible: visibleNow };
  }

  await activateBatch(tenderIds);
  const logId = await logPoolRun(selectedCount, skippedCooldown, Date.now() - startMs, "success", null);
  if (logId != null) {
    for (const tid of tenderIds) {
      await pool.query(
        `INSERT INTO tender_rotation_batch_items (log_id, tender_id) VALUES ($1, $2) ON CONFLICT (log_id, tender_id) DO NOTHING`,
        [logId, tid]
      );
    }
  }

  const visibleAfter = await countVisibleInPool();
  return { expired, activated: tenderIds.length, visible: visibleAfter };
}

/**
 * Insert tender_rotation_logs row (pool run); return log id for batch_items.
 */
async function logPoolRun(selectedCount, skippedCooldown, executionTimeMs, status, errorMessage) {
  const { rows } = await pool.query(
    `INSERT INTO tender_rotation_logs (
       triggered_by_user_id, selected_count, skipped_cooldown, skipped_max_usage, skipped_archived,
       execution_time_ms, status, error_message
     ) VALUES (NULL, $1, $2, 0, 0, $3, $4, $5)
     RETURNING id`,
    [selectedCount, skippedCooldown, executionTimeMs, status, errorMessage ?? null]
  );
  return rows[0]?.id ?? null;
}
