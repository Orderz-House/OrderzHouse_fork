import { pool } from "../models/db.js";
import { LogCreators, ACTION_TYPES } from "../services/loggingService.js";
import { debitWallet, creditWallet } from "../services/walletService.js";
import { NotificationCreators } from "../services/notificationService.js";
import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * Client records offline payment (creates payments row).
 * Admin will later approve it.
 */
export const recordOfflinePayment = [
  upload.single("proof"), // proof is the file field name
  async (req, res) => {
    const clientId = req.token?.userId;
    const { projectId, amount } = req.body;
    const proofFile = req.file;

    if (!projectId || !amount || !proofFile) {
      return res
        .status(400)
        .json({
          success: false,
          message: "projectId, amount, and proof file are required",
        });
    }

    try {
      // Upload proof to Cloudinary
      const result = await cloudinary.v2.uploader.upload(proofFile.path, {
        folder: "payment_proofs",
      });

      // Insert payment with proof URL
      const insert = await pool.query(
        `INSERT INTO payments (payer_id, receiver_id, project_id, amount, proof_url, payment_date)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [
          clientId,
          process.env.ADMIN_ID || 1,
          projectId,
          amount,
          result.secure_url,
        ]
      );

      const payment = insert.rows[0];

      await LogCreators.projectOperation(
        clientId,
        ACTION_TYPES.PAYMENT_PENDING,
        projectId,
        true,
        { payment_id: payment.id, amount }
      );

      // Clean up local file
      fs.unlinkSync(proofFile.path);

      return res.status(201).json({
        success: true,
        message: "Payment recorded as pending. Admin will review.",
        payment,
      });
    } catch (err) {
      console.error("recordOfflinePayment error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
];

/**
 * Admin approves/rejects a recorded offline payment.
 * - Approve: marks payment as approved (we use order_id = payment_id) and sets project.status = 'available'.
 * - Reject: updates payments.order_id = NULL (or sets a flag via order_id = -1) and optionally notify.
 */
export const approveOfflinePayment = async (req, res) => {
  const adminId = req.token?.userId;
  const { paymentId, action } = req.body; // action = "approve" | "reject"

  if (!paymentId || !action) {
    return res
      .status(400)
      .json({ success: false, message: "paymentId and action required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT p.id, p.payer_id, p.project_id, p.amount
       FROM payments p
       WHERE p.id = $1
       FOR UPDATE`,
      [paymentId]
    );

    if (!rows.length) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const payment = rows[0];

    if (action === "approve") {
      await client.query(`UPDATE payments SET order_id = $1 WHERE id = $2`, [
        paymentId,
        paymentId,
      ]);

      await client.query(
        `UPDATE projects SET status = 'available' WHERE id = $1`,
        [payment.project_id]
      );

      await client.query("COMMIT");

      await LogCreators.projectOperation(
        adminId,
        ACTION_TYPES.PAYMENT_APPROVED,
        payment.project_id,
        true,
        { paymentId, amount: payment.amount }
      );

      try {
        await NotificationCreators.paymentApproved(
          payment.id,
          payment.project_id,
          payment.payer_id,
          payment.amount
        );
      } catch (err) {
        console.error("notify paymentApproved error:", err);
      }

      return res.json({
        success: true,
        message: "Payment approved and project is now available",
      });
    }

    if (action === "reject") {
      await client.query(`UPDATE payments SET order_id = -1 WHERE id = $1`, [
        paymentId,
      ]);

      await client.query("COMMIT");

      await LogCreators.projectOperation(
        adminId,
        ACTION_TYPES.PAYMENT_REJECTED,
        payment.project_id,
        true,
        { paymentId, amount: payment.amount }
      );

      try {
        await NotificationCreators.paymentRejected(
          payment.id,
          payment.project_id,
          payment.payer_id
        );
      } catch (err) {
        console.error("notify paymentRejected error:", err);
      }

      return res.json({ success: true, message: "Payment rejected" });
    }

    await client.query("ROLLBACK");
    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveOfflinePayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

// Rest of your existing controller stays unchanged...

/**
 * Freelancer submits completion request
 * (updates projects.completion_status and logs history)
 */
export const submitWorkCompletion = async (req, res) => {
  const freelancerId = req.token?.userId;
  const { projectId } = req.params;

  try {
    // ensure assigned freelancer
    const check = await pool.query(
      `SELECT assigned_freelancer_id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (
      !check.rows.length ||
      check.rows[0].assigned_freelancer_id !== freelancerId
    ) {
      return res.status(403).json({
        success: false,
        message: "Only assigned freelancer can submit completion",
      });
    }

    // update project completion status
    await pool.query(
      `UPDATE projects
       SET completion_status = 'pending_review', completion_requested_at = NOW()
       WHERE id = $1`,
      [projectId]
    );

    // history
    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, 'completion_requested', NOW(), $2, $3)`,
      [projectId, freelancerId, "Freelancer requested completion"]
    );

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.PROJECT_STATUS_CHANGE,
      projectId,
      true,
      { action: "work_completion_requested" }
    );

    // notify client
    const proj = await pool.query(
      `SELECT user_id FROM projects WHERE id = $1`,
      [projectId]
    );
    if (proj.rows.length) {
      try {
        await NotificationCreators.workCompletionRequested(
          projectId,
          freelancerId,
          proj.rows[0].user_id
        );
      } catch (err) {
        console.error("notify workCompletionRequested error:", err);
      }
    }

    return res.json({ success: true, message: "Completion requested" });
  } catch (err) {
    console.error("submitWorkCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Release payment manually by client/admin:
 * - Validate caller is project owner
 * - Find escrow (status = 'held')
 * - credit freelancer wallet
 * - update escrow.status = 'released', projects.completion_status = 'approved', set payment_released_at
 * - insert completion_history entry
 */
export const releasePayment = async (req, res) => {
  const callerId = req.token?.userId;
  const { projectId, freelancerId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // verify project owner
    const projRes = await client.query(
      `SELECT user_id FROM projects WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [projectId]
    );
    if (!projRes.rows.length) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    const projectOwnerId = projRes.rows[0].user_id;
    if (projectOwnerId !== callerId) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "Only project owner can release payment",
      });
    }

    // find held escrow
    const escrowRes = await client.query(
      `SELECT id, amount FROM escrow WHERE project_id = $1 AND freelancer_id = $2 AND status = 'held' FOR UPDATE`,
      [projectId, freelancerId]
    );
    if (!escrowRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "No held escrow found for this freelancer/project",
      });
    }
    const escrow = escrowRes.rows[0];

    // credit freelancer wallet
    await client.query(`UPDATE users SET wallet = wallet + $1 WHERE id = $2`, [
      escrow.amount,
      freelancerId,
    ]);

    // update escrow + project
    await client.query(
      `UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1`,
      [escrow.id]
    );

    await client.query(
      `UPDATE projects SET completion_status = 'approved', payment_released_at = NOW(), completed_by_freelancer = true WHERE id = $1`,
      [projectId]
    );

    // history
    await client.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, 'payment_released', NOW(), $2, $3)`,
      [projectId, callerId, `Payment released to freelancer ${freelancerId}`]
    );

    await client.query("COMMIT");

    await LogCreators.projectOperation(
      callerId,
      ACTION_TYPES.PAYMENT_RELEASE,
      projectId,
      true,
      { freelancerId, amount: escrow.amount }
    );

    try {
      await NotificationCreators.paymentReleased(
        projectId,
        freelancerId,
        callerId,
        escrow.amount
      );
    } catch (err) {
      console.error("notify paymentReleased error:", err);
    }

    return res.json({
      success: true,
      message: "Payment released successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("releasePayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Auto-release cron:
 * - find escrows that have been held and projects in pending_review for >= 7 days
 * - release them (credit freelancer), update project + history
 */
export const autoReleasePaymentsCron = async () => {
  const client = await pool.connect();
  try {
    // find held escrow where project requested completion >= 7 days ago
    const { rows } = await client.query(
      `SELECT e.id AS escrow_id, e.project_id, e.freelancer_id, e.client_id, e.amount
       FROM escrow e
       JOIN projects p ON p.id = e.project_id
       WHERE e.status = 'held'
         AND p.completion_status = 'pending_review'
         AND p.completion_requested_at <= NOW() - INTERVAL '7 days'`
    );

    for (const r of rows) {
      await client.query("BEGIN");

      // credit wallet
      await client.query(
        `UPDATE users SET wallet = wallet + $1 WHERE id = $2`,
        [r.amount, r.freelancer_id]
      );

      // update escrow
      await client.query(
        `UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1`,
        [r.escrow_id]
      );

      // update project
      await client.query(
        `UPDATE projects SET completion_status = 'approved', payment_released_at = NOW(), completed_by_freelancer = true WHERE id = $1`,
        [r.project_id]
      );

      // history
      await client.query(
        `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
         VALUES ($1, 'payment_released', NOW(), $2, $3)`,
        [r.project_id, r.client_id, "Auto-released after 7 days"]
      );

      await client.query("COMMIT");

      await LogCreators.projectOperation(
        r.client_id,
        ACTION_TYPES.PAYMENT_AUTO_RELEASE,
        r.project_id,
        true,
        { freelancerId: r.freelancer_id, amount: r.amount }
      );

      try {
        await NotificationCreators.paymentReleased(
          r.project_id,
          r.freelancer_id,
          r.client_id,
          r.amount
        );
      } catch (err) {
        console.error("notify auto-release error:", err);
      }
    }

    console.log(`Auto-released payments for ${rows.length} escrow(s).`);
  } catch (err) {
    console.error("autoReleasePaymentsCron error:", err);
  } finally {
    client.release();
  }
};

export default {
  recordOfflinePayment,
  approveOfflinePayment,
  takeProject,
  submitWorkCompletion,
  releasePayment,
  autoReleasePaymentsCron,
};
