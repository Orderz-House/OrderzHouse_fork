# Tender Rotation System (Redesign — No Projects Table)

## Critical constraints

- **Do not** modify the real `projects` table.
- **Do not** add columns to `projects`.
- **Do not** touch the normal marketplace workflow.
- All rotation logic uses only:
  - **tender_vault_projects**
  - **tender_vault_cycles**
  - **tender_rotation_logs**

---

## 1. SQL and engine behaviour

### Expire cycles

```sql
UPDATE tender_vault_cycles
SET status = 'expired', updated_at = NOW()
WHERE status = 'active' AND display_end_time < NOW();
```

### Count active cycles

```sql
SELECT COUNT(*) AS cnt FROM tender_vault_cycles
WHERE status = 'active' AND display_end_time > NOW();
```

### Select eligible tenders (8–12 random)

Eligibility:

- `tender_vault_projects.status = 'published'`
- `tender_vault_projects.is_deleted = false`
- `usage_count < max_usage` (or `max_usage` is null)
- `last_displayed_at` is null or older than 24 hours
- `temporary_archived_until` is null or in the past
- Not already in an active cycle

```sql
SELECT tv.id, tv.usage_count, tv.max_usage
FROM tender_vault_projects tv
WHERE tv.status = 'published'
  AND tv.is_deleted = false
  AND (tv.max_usage IS NULL OR tv.usage_count < tv.max_usage)
  AND (tv.last_displayed_at IS NULL OR tv.last_displayed_at < NOW() - INTERVAL '24 hours')
  AND (tv.temporary_archived_until IS NULL OR tv.temporary_archived_until < NOW())
  AND NOT EXISTS (
    SELECT 1 FROM tender_vault_cycles tcy
    WHERE tcy.tender_id = tv.id
      AND tcy.status = 'active'
      AND tcy.display_end_time > NOW()
  )
ORDER BY RANDOM()
LIMIT 12;
```

### Insert cycle (per selected tender)

```sql
INSERT INTO tender_vault_cycles (
  tender_id, cycle_number, client_public_id, status,
  display_start_time, display_end_time
) VALUES ($tender_id, $cycle_number, $client_public_id, 'active', NOW(), NOW() + INTERVAL '12 hours');
```

Then update tender:

```sql
UPDATE tender_vault_projects
SET usage_count = COALESCE(usage_count, 0) + 1,
    last_displayed_at = NOW(),
    updated_at = NOW()
WHERE id = $tender_id;
```

### Logging (tender_rotation_logs)

```sql
INSERT INTO tender_rotation_logs (
  triggered_by_user_id, selected_count, skipped_cooldown, skipped_max_usage, skipped_archived,
  execution_time_ms, status, error_message
) VALUES (NULL, $selected_count, $skipped_cooldown, $skipped_max_usage, $skipped_archived, $execution_time_ms, 'success', NULL);
```

---

## 2. Public listing (UNION)

Listing does **not** read from `projects` for rotation. It:

- **A)** Loads real projects from `projects` (unchanged).
- **B)** Loads active rotation rows from `tender_vault_cycles` joined to `tender_vault_projects`.

Conditions for B:

- `tender_vault_cycles.status = 'active'`
- `tender_vault_cycles.display_end_time > NOW()`
- `tender_vault_projects.status = 'published'`
- `tender_vault_projects.is_deleted = false`

Rotation rows are mapped to the same shape as project list items and tagged with:

- `source_type = 'tender_rotation'`
- `cycle_id` = `tender_vault_cycles.id`
- `tender_id` = `tender_vault_projects.id`

So the effective “UNION” is: **real projects** + **active rotation cycles (mapped to project shape)**. No rows are inserted into `projects` for rotation.

Single-project fetch: if the requested id is not in `projects`, it is treated as a cycle id and resolved via `tender_vault_cycles` + `tender_vault_projects` (same conditions as above), again with `source_type = 'tender_rotation'`.

---

## 3. Cron (every 5 minutes)

**File:** `backendEsModule/cron/tenderVaultRotation.js`

- Runs **runTenderRotation()** from `backendEsModule/services/tenderRotationEngine.js`.

**runTenderRotation():**

1. Expire cycles: `UPDATE tender_vault_cycles SET status = 'expired'` where `status = 'active'` and `display_end_time < NOW()`.
2. Count active cycles.
3. If count &lt; 8: select 8–12 eligible tenders, for each insert a cycle row (12h window), update `usage_count` and `last_displayed_at` on the tender.
4. Insert one row into **tender_rotation_logs** (e.g. `triggered_by_user_id = NULL`, `selected_count`, `execution_time_ms`, `status = 'success'` or `'error'`, optional `error_message`).

---

## 4. Bidding and award guard

- **Bids for rotation:** Stored in **offers** with `tender_cycle_id` set and `project_id` null (migration 017 adds `tender_cycle_id` and allows `project_id` to be null).
- **Create bid:** `POST /offers/tender-rotation/:cycleId` with `bid_amount` and `proposal`. Validates cycle is active and tender budget; inserts offer with `project_id = NULL`, `tender_cycle_id = cycleId`.
- **Award:** In **approveOrRejectOffer** and **completeOfferAcceptance**, if the offer has `tender_cycle_id` set:
  - Return **400** with message: *"Rotating tenders cannot be awarded. They are for display only."*
- **adminApproveBiddingOffer:** If the accepted offer has `tender_cycle_id`, return 400 (same message).

No payment or escrow logic runs for rotation offers (award is blocked before any project/escrow flow).

---

## 5. Full text flow diagram

```
[Client publishes tenders]
         │
         ▼
tender_vault_projects.status = 'published'
         │
         │  (Cron every 5 min)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ runTenderRotation()                                                 │
│   1. Expire: UPDATE tender_vault_cycles SET status='expired'        │
│      WHERE status='active' AND display_end_time < NOW()             │
│   2. Count active cycles                                            │
│   3. If active < 8:                                                 │
│      - Select 8–12 eligible tenders (published, cooldown, no        │
│        active cycle, usage < max_usage, not archived)               │
│      - For each: INSERT tender_vault_cycles (active, 12h window),    │
│        UPDATE tender_vault_projects (usage_count++, last_displayed)  │
│   4. INSERT tender_rotation_logs                                    │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
Public listing
  → Real projects (from projects table)
  → UNION with active cycles: tender_vault_cycles JOIN tender_vault_projects
    (status=active, display_end_time > NOW(), tender published, not deleted)
  → Mapped to project shape; source_type='tender_rotation', cycle_id, tender_id
         │
         ▼
Freelancer sees rotation items like normal projects
  → To bid: POST /offers/tender-rotation/:cycleId (bid stored with tender_cycle_id)
         │
         ▼
If client tries to accept / admin approve
  → Check offer.tender_cycle_id → 400 "Rotating tenders cannot be awarded"
  → No project created, no escrow, no payment
```

---

## 6. Files touched

| Purpose | File |
|--------|------|
| Migration: rotation logs | `backendEsModule/migrations/016_create_tender_rotation_logs.js` |
| Migration: offers.tender_cycle_id | `backendEsModule/migrations/017_add_offers_tender_cycle_id.js` |
| Rotation engine (expire, select, insert cycles, log) | `backendEsModule/services/tenderRotationEngine.js` |
| Cron (every 5 min) | `backendEsModule/cron/tenderVaultRotation.js` |
| Listing (UNION + cycle fetch) | `backendEsModule/controller/projectsManagment/projectsFiltering.js` |
| getProjectById (resolve by cycle_id) | same file |
| Create offer for cycle | `backendEsModule/controller/offers.js` → sendOfferForTenderCycle |
| Route POST /offers/tender-rotation/:cycleId | `backendEsModule/router/offers.js` |
| Award guards (tender_cycle_id) | `backendEsModule/controller/offers.js` (approveOrRejectOffer, completeOfferAcceptance, adminApproveBiddingOffer) |
| Reverted (no projects table fakes) | buildStatusCondition, payments.js is_fake checks removed |

---

## 7. Duplicate prevention

- **last_displayed_at:** When a tender is chosen for a cycle, set `last_displayed_at = NOW()`. Eligibility requires `last_displayed_at IS NULL OR last_displayed_at < NOW() - 24 hours`, so the same tender is not reused for 24 hours.
- **Active cycle check:** Exclude tenders that already have a row in `tender_vault_cycles` with `status = 'active'` and `display_end_time > NOW()`, so we never create a second active cycle for the same tender.
- **usage_count / max_usage:** Optional cap per tender (e.g. `usage_count < max_usage`).

---

## 8. Running migrations

```bash
cd backendEsModule
node migrations/016_create_tender_rotation_logs.js
node migrations/017_add_offers_tender_cycle_id.js
```

(Use your existing migration runner if you have one.)
