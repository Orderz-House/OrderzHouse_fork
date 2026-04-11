import pool from "../models/db.js";
import { createEscrowHeld } from "./escrowService.js";
import { activateSubscriptionOnFirstAcceptance } from "./subscriptionActivation.js";
import eventBus from "../events/eventBus.js";

/** Distinct from assignFreelancer invitation flow; used for stats + direct hire at create. */
export const ASSIGNMENT_TYPE_CLIENT_PICK_AT_CREATE = "client_pick_at_create";

/**
 * Apply direct active assignment for a client-enabled manual pick at project creation.
 * @param {object} opts
 * @param {import("pg").Pool|import("pg").PoolClient} opts.queryClient
 * @param {number} opts.clientUserId
 * @param {number} opts.projectId
 * @param {unknown} opts.rawFreelancerId
 * @param {number|null} [opts.paymentId] — when paid (Stripe), create held escrow
 * @param {number|null} [opts.escrowAmount] — JOD amount for escrow row
 * @param {boolean} [opts.softFailUnauthorized] — if true, skip silently when not allowed (post-payment confirm)
 * @returns {Promise<{ applied: boolean, reason?: string, assignmentId?: number }>}
 */
export async function maybeApplyClientPickFreelancerOnCreate({
  queryClient = pool,
  clientUserId,
  projectId,
  rawFreelancerId,
  paymentId = null,
  escrowAmount = null,
  softFailUnauthorized = false,
}) {
  const fid = parseInt(String(rawFreelancerId ?? "").trim(), 10);
  if (!Number.isFinite(fid) || fid < 1) {
    return { applied: false, reason: "no_freelancer_id" };
  }

  const { rows: clientRows } = await queryClient.query(
    `SELECT role_id, COALESCE(can_assign_freelancer_on_create, false) AS can_pick
     FROM users WHERE id = $1 AND is_deleted = false`,
    [clientUserId]
  );

  if (!clientRows.length || Number(clientRows[0].role_id) !== 2) {
    if (softFailUnauthorized) {
      console.warn(
        "[clientDirectFreelancerPick] skip: not a client",
        { clientUserId, projectId }
      );
      return { applied: false, reason: "not_client" };
    }
    const e = new Error("Only client accounts may assign a freelancer at create");
    e.statusCode = 403;
    throw e;
  }

  if (!clientRows[0].can_pick) {
    if (softFailUnauthorized) {
      console.warn(
        "[clientDirectFreelancerPick] strip unauthorized pick (post-checkout)",
        { clientUserId, projectId, fid }
      );
      return { applied: false, reason: "not_enabled" };
    }
    const e = new Error("Manual freelancer assignment is not enabled for your account");
    e.statusCode = 403;
    throw e;
  }

  const { rows: frRows } = await queryClient.query(
    `SELECT id FROM users
     WHERE id = $1 AND role_id = 3 AND is_deleted = false AND COALESCE(is_verified, false) = true`,
    [fid]
  );
  if (!frRows.length) {
    const e = new Error("Invalid or unverified freelancer");
    e.statusCode = 400;
    throw e;
  }

  const { rows: dup } = await queryClient.query(
    `SELECT id FROM project_assignments WHERE project_id = $1 AND status = 'active' LIMIT 1`,
    [projectId]
  );
  if (dup.length) {
    return { applied: false, reason: "already_assigned" };
  }

  const assignedAt = new Date();
  const { rows: ins } = await queryClient.query(
    `INSERT INTO project_assignments
      (project_id, freelancer_id, assigned_at, status, assignment_type, user_invited)
     VALUES ($1, $2, $3, 'active', $4, true)
     RETURNING id`,
    [projectId, fid, assignedAt, ASSIGNMENT_TYPE_CLIENT_PICK_AT_CREATE]
  );
  const assignmentId = ins[0]?.id;

  await queryClient.query(
    `UPDATE projects
     SET assigned_freelancer_id = $1,
         status = 'in_progress',
         completion_status = 'in_progress',
         updated_at = NOW()
     WHERE id = $2`,
    [fid, projectId]
  );

  if (paymentId && escrowAmount != null && Number(escrowAmount) > 0) {
    try {
      await createEscrowHeld(
        {
          projectId,
          clientId: clientUserId,
          freelancerId: fid,
          amount: escrowAmount,
          paymentId,
        },
        queryClient
      );
    } catch (escErr) {
      console.error("[clientDirectFreelancerPick] escrow create failed:", escErr);
    }
  }

  try {
    await activateSubscriptionOnFirstAcceptance(fid, queryClient, assignmentId);
  } catch (subErr) {
    console.error("[clientDirectFreelancerPick] subscription activation:", subErr);
  }

  try {
    const { rows: titleRows } = await queryClient.query(
      `SELECT title FROM projects WHERE id = $1`,
      [projectId]
    );
    const projectTitle = titleRows[0]?.title || "";
    eventBus.emit("freelancer.assigned", {
      freelancerId: fid,
      projectId,
      projectTitle,
    });
  } catch (emitErr) {
    console.error("[clientDirectFreelancerPick] emit:", emitErr);
  }

  return { applied: true, assignmentId };
}
