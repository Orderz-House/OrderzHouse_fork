# Fake Project Rotation System

## Overview

When a client (role_id = 2 and `can_manage_tender_vault = true`) **publishes** tenders in Tender Vault, the system automatically injects 8–12 of them into the public projects pool as **fake** projects. They appear as normal projects (can receive bids) but **cannot be awarded**, cannot generate contracts, and cannot generate payments. After 12 hours they are removed and replaced with new ones, without reusing the same tenders consecutively.

---

## 1. Database Migration (015)

**File:** `backendEsModule/migrations/015_add_fake_project_rotation_system.js`

**projects table — added columns:**

| Column                 | Type    | Description |
|------------------------|---------|-------------|
| `is_fake`              | BOOLEAN | DEFAULT false. True for rotating tender rows. |
| `fake_source_id`       | INTEGER | FK → tender_vault_projects(id). Which tender this row was created from. |
| `fake_expires_at`      | TIMESTAMP | When this fake project should be removed (NOW() + 12 hours). |
| `fake_rotation_batch_id` | UUID | Optional grouping per batch. |

**tender_vault_projects table — added column:**

| Column                   | Type      | Description |
|--------------------------|-----------|-------------|
| `last_fake_displayed_at` | TIMESTAMP | Last time this tender was injected as a fake project (for duplicate prevention). |

**Why columns on `projects` (not a separate table)?**  
- Single table for all “projects” in listing; one query with a simple filter.  
- Award/contract/payment logic already keys off `projects.id`; a single check `is_fake` is enough.  
- Expiration is a simple `WHERE is_fake = true AND fake_expires_at < NOW()`.

---

## 2. Backend Service

**File:** `backendEsModule/services/fakeProjectRotation.js`

- **expireFakeProjects()** — Soft-deletes projects where `is_fake = true` and `fake_expires_at < NOW()`.
- **countActiveFakeProjects()** — Counts fake projects that are still visible (not deleted, not expired).
- **selectEligibleTendersForFake(limit)** — Selects up to `limit` random rows from `tender_vault_projects` where:
  - `status = 'published'`
  - `is_deleted = false`
  - `last_fake_displayed_at` is NULL or older than 24 hours (reuse cooldown)
  - No current active fake project already using this tender (`fake_source_id` not already in pool)
- **insertFakeProject(client, tender, batchId, expiresAt)** — Maps tender fields to `projects` and inserts one row with `is_fake = true`, `fake_source_id`, `fake_expires_at`, `fake_rotation_batch_id`, then updates `tender_vault_projects.last_fake_displayed_at = NOW()` for that tender.
- **generateFakeProjectBatch()** — Picks 8–12 random eligible tenders, creates one fake project per tender, sets 12h expiry, updates `last_fake_displayed_at`.
- **runFakeRotation()** — Runs expiration, then if active fake count &lt; 8, calls `generateFakeProjectBatch()`.

---

## 3. Cron Job

**File:** `backendEsModule/cron/tenderVaultRotation.js`

- New schedule: **every 5 minutes** (`*/5 * * * *`).
- Runs **runFakeRotation()** from `fakeProjectRotation.js`.
- Process: expire old fakes → count active fakes → if &lt; 8, create a new batch of 8–12.

---

## 4. Award / Contract / Payment Guards

- **Offers (approveOrRejectOffer):** SELECT includes `p.is_fake`. If `action === 'accept'` and `offer.is_fake`, return **400** with message that rotating tenders cannot be awarded.
- **Offers (completeOfferAcceptance):** Same `is_fake` check; if true, **throw** so Stripe confirm flow returns error (e.g. 500 with clear message).
- **Offers (adminApproveBiddingOffer):** After loading project, if `project.is_fake` return **400** so admin cannot approve a fake project.
- **Payments (createEscrow):** Before INSERT, load project; if `is_fake` return **400** — no escrow for fake projects.
- **Payments (releaseEscrow):** JOIN `projects` and select `is_fake`; if true, throw so release is blocked with a clear error.
- **Payments (releaseHeldEscrowForCompletedProjects):** Escrow query adds `AND COALESCE(p.is_fake, false) = false` so fake projects are never considered for release.

No separate “contract” or “milestone” controllers were found; award and payment guards cover the real workflow.

---

## 5. Listing Logic

**File:** `backendEsModule/controller/projectsManagment/projectsFiltering.js`

- **buildStatusCondition()** extended with:
  - `AND (COALESCE(p.is_fake, false) = false OR (p.is_fake = true AND p.fake_expires_at > NOW()))`
- So public listing:
  - Includes real projects (`is_fake` false or null).
  - Includes fake projects only when **not expired** (`fake_expires_at > NOW()`).
  - Excludes expired fakes and already soft-deleted rows.

No frontend changes required; expired fakes are filtered on the server.

---

## 6. Full Flow (Text Diagram)

```
[Client publishes tenders in Tender Vault]
         │
         ▼
tender_vault_projects.status = 'published'
         │
         │  (every 5 min)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ runFakeRotation()                                           │
│   1. expireFakeProjects()                                   │
│      → UPDATE projects SET is_deleted = true                 │
│        WHERE is_fake AND fake_expires_at < NOW()             │
│   2. countActiveFakeProjects()                               │
│   3. if active < 8:                                          │
│        generateFakeProjectBatch()                          │
│        → selectEligibleTendersForFake(8..12)                 │
│        → for each: INSERT projects (is_fake, fake_source_id,│
│                    fake_expires_at = NOW()+12h)              │
│        → UPDATE tender_vault_projects SET last_fake_...      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
Public listing (getProjectsByCategory etc.)
  → WHERE ... AND (NOT is_fake OR (is_fake AND fake_expires_at > NOW()))
  → Fake projects appear as normal; expired ones excluded.
         │
         ▼
Freelancers can place bids on fake projects (offers table).
         │
         ▼
If client tries to accept offer / pay / admin approve:
  → Check project.is_fake → 400 "rotating tender cannot be awarded".
Escrow create/release and release-held logic also block is_fake.
```

---

## 7. Duplicate-Prevention Logic

- **last_fake_displayed_at** on `tender_vault_projects`:  
  When a tender is chosen for a fake batch, we set `last_fake_displayed_at = NOW()`.  
  **Eligibility:** `last_fake_displayed_at IS NULL OR last_fake_displayed_at < NOW() - 24 hours`.  
  So the same tender is not selected again for at least 24 hours.

- **Currently in pool:**  
  We exclude tenders that already have an active fake project:  
  `NOT EXISTS (SELECT 1 FROM projects p WHERE p.fake_source_id = tv.id AND p.is_deleted = false AND (p.fake_expires_at IS NULL OR p.fake_expires_at > NOW()))`.  
  So we never create a second fake project from the same tender while the first is still active.

- **Batch size:**  
  Each run picks 8–12 random eligible tenders. After 12 hours they expire; the next run can pick a new set, again excluding recently used (24h) and currently active ones.

---

## 8. Part 1 — Routing Fix (Tender Vault)

**File:** `frontend/src/adminDash/pages/TenderVaultManager.jsx`

- **PATCH** status: `/tender-vault/${id}/status` → `/tender-vault/projects/${id}/status`
- **DELETE:** `/tender-vault/${id}` → `/tender-vault/projects/${id}`

So Publish, Archive, and Delete from the list page hit the correct backend routes.
