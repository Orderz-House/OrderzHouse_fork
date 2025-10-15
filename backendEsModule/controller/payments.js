/**
 * Payments Controller
 * 
 * Story:
 * - PROJECT PAYMENTS:
 *   - Clients can record offline payments for projects; these are pending admin review.
 *   - Admins can approve or reject project payments.
 *   - Once approved, the project becomes available to freelancers.
 *   - Clients can manually release escrowed payments to freelancers.
 *   - Auto-release cron releases payments if freelancer marks completion and client doesn't release in 7 days.
 * 
 * - FINANCIAL OVERVIEW:
 *   - Clients: wallet balance, payments made, escrow, and wallet transactions.
 *   - Freelancers: earned payments, wallet transactions.
 */

import pool from "../models/db.js";
import { LogCreators, ACTION_TYPES } from "../services/loggingService.js";
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
 * -------------------------------
 * PROJECT PAYMENTS (offline only)
 * -------------------------------
 */

// Record offline payment (project)
export const recordOfflinePayment = [
  upload.single("proof"),
  async (req, res) => {
    const clientId = req.token?.userId;
    const { projectId } = req.params;
    const { amount } = req.body;
    const proofFile = req.file;

    if (!projectId || !amount || !proofFile) {
      return res.status(400).json({
        success: false,
        message: "projectId, amount, and proof file are required",
      });
    }

    try {
      const result = await cloudinary.v2.uploader.upload(proofFile.path, {
        folder: "payment_proofs",
      });

      const insert = await pool.query(
        `INSERT INTO payments (payer_id, project_id, amount, proof_url, payment_date)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [clientId, projectId, amount, result.secure_url]
      );

      const payment = insert.rows[0];

      await LogCreators.projectOperation(
        clientId,
        ACTION_TYPES.PAYMENT_PENDING,
        projectId,
        true,
        { payment_id: payment.id, amount }
      );

      fs.unlinkSync(proofFile.path);

      try {
        const projectResult = await pool.query(
          "SELECT title FROM projects WHERE id = $1",
          [projectId]
        );
        const projectTitle = projectResult.rows.length ? projectResult.rows[0].title : `Project #${projectId}`;

        await NotificationCreators.projectPaymentSubmitted(payment.id, projectTitle, req.token.username, amount);
      } catch (notificationError) {
        console.error("Failed to create project payment submission notification:", notificationError);
      }

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

// Admin approves/rejects project payment
export const approveOfflinePayment = async (req, res) => {
  const adminId = req.token?.userId;
  const { paymentId, action } = req.body;

  if (!paymentId || !action) {
    return res.status(400).json({ success: false, message: "paymentId and action required" });
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
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const payment = rows[0];

    if (action === "approve") {
      await client.query(`UPDATE projects SET status = 'available' WHERE id = $1`, [payment.project_id]);

      await client.query("COMMIT");

      await LogCreators.projectOperation(
        adminId,
        ACTION_TYPES.PAYMENT_APPROVED,
        payment.project_id,
        true,
        { paymentId, amount: payment.amount }
      );

      try {
        await NotificationCreators.paymentApproved(payment.id, payment.project_id, payment.payer_id, payment.amount);
      } catch (err) {
        console.error("notify paymentApproved error:", err);
      }

      return res.json({
        success: true,
        message: "Payment approved and project is now available",
      });
    }

    if (action === "reject") {
      await client.query(`UPDATE payments SET order_id = -1 WHERE id = $1`, [paymentId]);

      await client.query("COMMIT");

      await LogCreators.projectOperation(
        adminId,
        ACTION_TYPES.PAYMENT_REJECTED,
        payment.project_id,
        true,
        { paymentId, amount: payment.amount }
      );

      try {
        await NotificationCreators.paymentRejected(payment.id, payment.project_id, payment.payer_id);
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

/**
 * -------------------------------
 * RELEASE PAYMENTS
 * -------------------------------
 */
export const releasePayment = async (req, res) => {
  const callerId = req.token?.userId;
  const { projectId, freelancerId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const projRes = await client.query(
      `SELECT user_id, title FROM projects WHERE id = $1 AND is_deleted = false FOR UPDATE`,
      [projectId]
    );

    if (!projRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const { user_id: projectOwnerId, title: projectTitle } = projRes.rows[0];
    if (projectOwnerId !== callerId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ success: false, message: "Only project owner can release payment" });
    }

    const escrowRes = await client.query(
      `SELECT id, amount FROM escrow WHERE project_id = $1 AND freelancer_id = $2 AND status = 'held' FOR UPDATE`,
      [projectId, freelancerId]
    );

    if (!escrowRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "No held escrow found for this freelancer/project" });
    }

    const escrow = escrowRes.rows[0];

    // Here you should credit freelancer's wallet
    // await creditWallet(freelancerId, escrow.amount, `Release payment for project ${projectId}`);

    await client.query(`UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1`, [escrow.id]);

    await client.query(
      `UPDATE projects SET completion_status = 'approved', payment_released_at = NOW(), completed_by_freelancer = true WHERE id = $1`,
      [projectId]
    );

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
      await NotificationCreators.paymentReleased(projectId, projectTitle, freelancerId, escrow.amount);
    } catch (err) {
      console.error("notify paymentReleased error:", err);
    }

    return res.json({ success: true, message: "Payment released successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("releasePayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * -------------------------------
 * AUTO RELEASE CRON
 * -------------------------------
 */
export const autoReleasePaymentsCron = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT e.id AS escrow_id, e.project_id, e.freelancer_id, p.user_id AS client_id, e.amount, p.title AS project_title
       FROM escrow e
       JOIN projects p ON p.id = e.project_id
       WHERE e.status = 'held'
         AND p.completion_status = 'pending_review'
         AND p.completion_requested_at <= NOW() - INTERVAL '7 days'`
    );

    for (const r of rows) {
      await client.query("BEGIN");

      // Credit freelancer's wallet here
      // await creditWallet(r.freelancer_id, r.amount, `Auto-release payment for project ${r.project_id}`);

      await client.query(`UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1`, [r.escrow_id]);

      await client.query(
        `UPDATE projects SET completion_status = 'approved', payment_released_at = NOW(), completed_by_freelancer = true WHERE id = $1`,
        [r.project_id]
      );

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
        await NotificationCreators.paymentReleased(r.project_id, r.project_title, r.freelancer_id, r.amount);
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
  releasePayment,
  autoReleasePaymentsCron,
};
