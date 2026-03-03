/**
 * Fake Project Rotation System
 *
 * Injects 8–12 random PUBLISHED tender_vault_projects into the public projects pool
 * as fake projects (is_fake = true). They can receive bids but cannot be awarded,
 * cannot generate contracts or payments. After 12 hours they are removed and replaced.
 *
 * Duplicate prevention: last_fake_displayed_at on tender_vault_projects;
 * do not reuse the same tender within 24 hours.
 */

import pool from "../models/db.js";
import { randomUUID } from "crypto";

const MIN_FAKE_PROJECTS = 8;
const MAX_FAKE_PROJECTS = 12;
const FAKE_DURATION_HOURS = 12;
const REUSE_COOLDOWN_HOURS = 24;

/**
 * 1) Expire old fake projects (fake_expires_at < NOW())
 *    Soft-delete them so listing and count are correct.
 */
export async function expireFakeProjects() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE projects
       SET is_deleted = true, updated_at = NOW()
       WHERE is_fake = true AND fake_expires_at IS NOT NULL AND fake_expires_at < NOW() AND is_deleted = false
       RETURNING id`
    );
    const count = rows.length;
    if (count > 0) {
      console.log(`[FakeRotation] Expired ${count} fake project(s)`);
    }
    return { expired: count };
  } finally {
    client.release();
  }
}

/**
 * 2) Count currently active fake projects (visible in pool, not expired)
 */
export async function countActiveFakeProjects() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM projects
     WHERE is_fake = true AND is_deleted = false
       AND (fake_expires_at IS NULL OR fake_expires_at > NOW())`
  );
  return Number(rows[0]?.cnt || 0);
}

/**
 * 3) Select 8–12 random published tenders eligible for fake display
 *    - status = 'published'
 *    - is_deleted = false
 *    - Not currently in pool (no active project with fake_source_id = tv.id)
 *    - last_fake_displayed_at IS NULL OR last_fake_displayed_at < NOW() - 24 hours
 */
export async function selectEligibleTendersForFake(limit) {
  const { rows } = await pool.query(
    `SELECT tv.id, tv.title, tv.description, tv.category_id, tv.budget_min, tv.budget_max,
            tv.currency, tv.duration_value, tv.duration_unit, tv.country, tv.attachments, tv.metadata
     FROM tender_vault_projects tv
     WHERE tv.status = 'published'
       AND tv.is_deleted = false
       AND (tv.last_fake_displayed_at IS NULL OR tv.last_fake_displayed_at < NOW() - ($1::text || ' hours')::interval)
       AND NOT EXISTS (
         SELECT 1 FROM projects p
         WHERE p.fake_source_id = tv.id AND p.is_deleted = false
           AND (p.fake_expires_at IS NULL OR p.fake_expires_at > NOW())
       )
     ORDER BY RANDOM()
     LIMIT $2`,
    [REUSE_COOLDOWN_HOURS, limit]
  );
  return rows;
}

/**
 * 4) Map tender duration_value/unit to projects duration_days/duration_hours
 */
function mapDuration(tender) {
  const value = tender.duration_value ? Number(tender.duration_value) : null;
  const unit = (tender.duration_unit || "").toLowerCase();
  if (unit === "days" && value != null) {
    return { duration_days: value, duration_hours: null };
  }
  if (unit === "hours" && value != null) {
    return { duration_days: null, duration_hours: value };
  }
  return { duration_days: null, duration_hours: null };
}

/**
 * 5) Create one fake project row from a tender and insert
 */
async function insertFakeProject(client, tender, batchId, expiresAt) {
  const meta = tender.metadata && typeof tender.metadata === "object"
    ? tender.metadata
    : (typeof tender.metadata === "string" ? JSON.parse(tender.metadata || "{}") : {});
  const subCategoryId = meta.sub_category_id ? parseInt(meta.sub_category_id, 10) : null;
  const subSubCategoryId = meta.sub_sub_category_id ? parseInt(meta.sub_sub_category_id, 10) : null;
  const { duration_days, duration_hours } = mapDuration(tender);
  const attachments =
    Array.isArray(tender.attachments) ? tender.attachments : (typeof tender.attachments === "string" ? JSON.parse(tender.attachments || "[]") : []);

  const { rows } = await client.query(
    `INSERT INTO projects (
       user_id, category_id, sub_category_id, sub_sub_category_id,
       title, description, budget_min, budget_max,
       duration_days, duration_hours,
       country, preferred_skills, project_type, status, completion_status, is_deleted,
       is_fake, fake_source_id, fake_expires_at, fake_rotation_batch_id,
       created_at, updated_at
     ) VALUES (
       NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
       'bidding', 'bidding', 'not_started', false,
       true, $12, $13, $14::uuid,
       NOW(), NOW()
     )
     RETURNING id`,
    [
      tender.category_id,
      subCategoryId,
      subSubCategoryId,
      tender.title,
      tender.description,
      tender.budget_min ?? null,
      tender.budget_max ?? null,
      duration_days,
      duration_hours,
      tender.country ?? null,
      Array.isArray(meta.skills) ? meta.skills : (meta.skills ? [meta.skills] : []),
      tender.id,
      expiresAt,
      batchId,
    ]
  );
  return rows[0].id;
}

/**
 * 6) Generate a new batch of fake projects (8–12) and update last_fake_displayed_at
 */
export async function generateFakeProjectBatch() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const count = Math.floor(
      Math.random() * (MAX_FAKE_PROJECTS - MIN_FAKE_PROJECTS + 1) + MIN_FAKE_PROJECTS
    );
    const tenders = await selectEligibleTendersForFake(count);
    if (tenders.length === 0) {
      await client.query("COMMIT");
      return { created: 0, message: "No eligible published tenders" };
    }

    const batchId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + FAKE_DURATION_HOURS);

    const createdIds = [];
    for (const tender of tenders) {
      try {
        const id = await insertFakeProject(client, tender, batchId, expiresAt);
        createdIds.push(id);
        await client.query(
          `UPDATE tender_vault_projects
           SET last_fake_displayed_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [tender.id]
        );
      } catch (err) {
        console.error(`[FakeRotation] Failed to insert fake project from tender ${tender.id}:`, err.message);
      }
    }

    await client.query("COMMIT");
    console.log(`[FakeRotation] Created ${createdIds.length} fake project(s), batch ${batchId}`);
    return {
      success: true,
      created: createdIds.length,
      project_ids: createdIds,
      batch_id: batchId,
      expires_at: expiresAt,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[FakeRotation] generateFakeProjectBatch error:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 7) Full rotation step: expire old, then if active count < 8, generate new batch
 */
export async function runFakeRotation() {
  const { expired } = await expireFakeProjects();
  const active = await countActiveFakeProjects();
  if (active < MIN_FAKE_PROJECTS) {
    const result = await generateFakeProjectBatch();
    return { expired, active, ...result };
  }
  return { expired, active, created: 0 };
}
