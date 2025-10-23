import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

/**
 * -------------------------------
 * GET ALL PROJECTS FOR OFFER
 * -------------------------------
 */
export const getAllProjectForOffer = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.id AS user_id, u.first_name, u.last_name, u.email, u.username
       FROM projects p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'bidding'`
    );

    res.status(200).json({
      success: true,
      message: "All projects open for bidding",
      projects: result.rows,
    });
  } catch (err) {
    console.error("getAllProjectForOffer error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err,
    });
  }
};

/**
 * -------------------------------
 * SEND OFFER (FREELANCER)
 * -------------------------------
 */
export const sendOffer = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const freelancerName = req.token?.username || "Freelancer";
    const { projectId } = req.params;
    const { bid_amount, proposal } = req.body;

    if (!projectId || bid_amount == null || !proposal) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const projectQuery = await pool.query(
      `SELECT user_id, title, status, budget_min, budget_max
       FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!projectQuery.rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const project = projectQuery.rows[0];

    if (project.status !== "bidding") {
      return res
        .status(400)
        .json({ success: false, message: "Project not open for bidding" });
    }

    if (
      (project.budget_min != null && bid_amount < project.budget_min) ||
      (project.budget_max != null && bid_amount > project.budget_max)
    ) {
      return res.status(400).json({
        success: false,
        message: `Bid must be between ${project.budget_min} and ${project.budget_max}`,
      });
    }

    const existingOffer = await pool.query(
      `SELECT id 
       FROM offers 
       WHERE project_id = $1 
         AND freelancer_id = $2 
         AND offer_status = 'pending'`,
      [projectId, freelancerId]
    );

    if (existingOffer.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pending offer already exists" });
    }

    const insertQuery = await pool.query(
      `INSERT INTO offers (freelancer_id, project_id, bid_amount, proposal, offer_status)
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING *`,
      [freelancerId, projectId, bid_amount, proposal]
    );

    const newOffer = insertQuery.rows[0];

    try {
      await NotificationCreators.offerSubmitted(
        newOffer.id,
        projectId,
        project.title,
        freelancerName
      );
    } catch (e) {
      console.error("Notification error on offer submission:", e);
    }

    res.status(201).json({
      success: true,
      message: "Offer sent successfully",
      offer: newOffer,
    });
  } catch (err) {
    console.error("sendOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * APPROVE OR REJECT OFFER (CLIENT)
 * -------------------------------
 */
export const approveOrRejectOffer = async (req, res) => {
  const client = await pool.connect();
  try {
    const clientId = req.token?.userId;
    const { offerId, action } = req.body;

    if (!["accept", "reject"].includes(action))
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });

    const { rows: offerRows } = await client.query(
      `SELECT o.*, p.user_id AS client_id, p.title AS project_title 
       FROM offers o 
       JOIN projects p ON o.project_id = p.id 
       WHERE o.id = $1`,
      [offerId]
    );

    if (!offerRows.length)
      return res.status(404).json({ success: false, message: "Offer not found" });

    const offer = offerRows[0];
    if (offer.client_id !== clientId)
      return res.status(403).json({ success: false, message: "Not authorized" });

    await client.query("BEGIN");

    if (action === "reject") {
      await client.query(`UPDATE offers SET offer_status = 'rejected' WHERE id = $1`, [offerId]);
      try {
        await NotificationCreators.offerStatusChanged(
          offer.id,
          offer.project_title,
          offer.freelancer_id,
          false
        );
      } catch (e) {
        console.error(e);
      }
      await client.query("COMMIT");
      return res.json({ success: true, message: "Offer rejected" });
    }

    if (action === "accept") {
      const acceptedOffer = await client.query(
        `SELECT id FROM offers WHERE project_id = $1 AND offer_status = 'accepted'`,
        [offer.project_id]
      );
      if (acceptedOffer.rows.length > 0)
        return res
          .status(400)
          .json({ success: false, message: "Only one offer can be accepted per project" });

      const freelancerWork = await client.query(
        `SELECT id
         FROM projects
         WHERE assigned_freelancer_id = $1
           AND is_deleted = false
           AND completion_status IN ('in_progress', 'pending_review', 'revision_requested')`,
        [offer.freelancer_id]
      );

      if (freelancerWork.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message:
            "This freelancer already has an in-progress, reviewing, or revision-requested project.",
        });
      }

      const activeAssignment = await client.query(
        `SELECT id 
         FROM project_assignments 
         WHERE freelancer_id = $1 
           AND status IN ('active', 'pending_acceptance', 'in_progress')`,
        [offer.freelancer_id]
      );

      if (activeAssignment.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "This freelancer is already assigned to another active or pending project.",
        });
      }

      await client.query(`UPDATE offers SET offer_status = 'accepted' WHERE id = $1`, [offerId]);

      // Mark all other offers for this project as "not_chosen"
      await client.query(
        `UPDATE offers 
         SET offer_status = 'not_chosen' 
         WHERE project_id = $1 
           AND id <> $2 
           AND offer_status IN ('pending', 'rejected')`,
        [offer.project_id, offerId]
      );

      await client.query(
        `UPDATE projects SET assigned_freelancer_id = $1, completion_status = 'not_started' WHERE id = $2`,
        [offer.freelancer_id, offer.project_id]
      );
      await client.query(
        `INSERT INTO escrow (project_id, freelancer_id, amount, status) VALUES ($1, $2, $3, 'held')`,
        [offer.project_id, offer.freelancer_id, offer.bid_amount]
      );

      try {
        await NotificationCreators.offerStatusChanged(
          offer.id,
          offer.project_title,
          offer.freelancer_id,
          true
        );
        await NotificationCreators.freelancerAssignmentChanged(
          offer.project_id,
          offer.project_title,
          offer.freelancer_id,
          true
        );
        await NotificationCreators.escrowFunded(
          offer.project_id,
          offer.project_title,
          offer.freelancer_id,
          offer.bid_amount
        );
      } catch (e) {
        console.error(e);
      }

      await client.query("COMMIT");
      return res.json({
        success: true,
        message: "Offer accepted, other offers marked as not chosen, freelancer assigned, escrow funded",
      });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("approveOrRejectOffer error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};


/**
 * -------------------------------
 * GET MY OFFERS (FREELANCER)
 * -------------------------------
 */
export const getMyOffersForProject = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { projectId } = req.params;

    if (!freelancerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!projectId)
      return res.status(400).json({ success: false, message: "Missing projectId" });

    const offersQuery = await pool.query(
      `SELECT o.id, o.freelancer_id, o.bid_amount, o.proposal, o.offer_status, o.created_at,
              p.title AS project_title, p.budget_min, p.budget_max
       FROM offers o
       JOIN projects p ON o.project_id = p.id
       WHERE o.project_id = $1 AND o.freelancer_id = $2
       ORDER BY o.created_at DESC`,
      [projectId, freelancerId]
    );

    res.status(200).json({ success: true, offers: offersQuery.rows });
  } catch (err) {
    console.error("getMyOffersForProject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * GET OFFERS FOR MY PROJECTS (CLIENT)
 * -------------------------------
 */
export const getOffersForMyProjects = async (req, res) => {
  try {
    const ownerId = req.token?.userId;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const offersQuery = await pool.query(
      `SELECT o.id AS offer_id, o.freelancer_id, u.first_name || ' ' || u.last_name AS freelancer_name,
              u.email AS freelancer_email, o.project_id, p.title AS project_title, o.bid_amount,
              o.proposal, o.offer_status, o.created_at AS submitted_at
       FROM offers o
       JOIN projects p ON o.project_id = p.id
       JOIN users u ON o.freelancer_id = u.id
       WHERE p.user_id = $1
       ORDER BY o.created_at DESC`,
      [ownerId]
    );

    res.status(200).json({ success: true, offers: offersQuery.rows });
  } catch (err) {
    console.error("getOffersForMyProjects error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * Allows a freelancer to withdraw their pending offer
 */
export const cancelOffer = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { offerId } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM offers WHERE id = $1 AND freelancer_id = $2`,
      [offerId, freelancerId]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Offer not found" });

    const offer = rows[0];
    if (offer.offer_status !== "pending")
      return res.status(400).json({ success: false, message: "Only pending offers can be cancelled" });

    await pool.query(
      `UPDATE offers SET offer_status = 'withdrawn', updated_at = NOW() WHERE id = $1`,
      [offerId]
    );

    res.json({ success: true, message: "Offer withdrawn successfully" });
  } catch (err) {
    console.error("cancelOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const autoExpireOldOffers = async () => {
  try {
    const { rows } = await pool.query(
      `UPDATE offers 
       SET offer_status = 'expired', updated_at = NOW()
       WHERE offer_status = 'pending'
         AND (
           created_at <= NOW() - INTERVAL '7 days'
           OR project_id IN (SELECT id FROM projects WHERE status != 'bidding')
         )
       RETURNING id`
    );
    if (rows.length > 0)
      console.log(`Auto-expired ${rows.length} old offers`);
  } catch (err) {
    console.error("autoExpireOldOffers error:", err);
  }
};

/**
 * Allows admin or client to view all accepted offers
 */
export const getAcceptedOffers = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const role = req.token?.role;

    let query;
    let params;

    if (role === 1) {
      query = `
        SELECT o.*, p.title AS project_title, u.username AS freelancer_name
        FROM offers o
        JOIN projects p ON o.project_id = p.id
        JOIN users u ON o.freelancer_id = u.id
        WHERE o.offer_status = 'accepted'
        ORDER BY o.updated_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT o.*, p.title AS project_title, u.username AS freelancer_name
        FROM offers o
        JOIN projects p ON o.project_id = p.id
        JOIN users u ON o.freelancer_id = u.id
        WHERE o.offer_status = 'accepted' AND p.user_id = $1
        ORDER BY o.updated_at DESC
      `;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    res.json({ success: true, offers: rows });
  } catch (err) {
    console.error("getAcceptedOffers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
