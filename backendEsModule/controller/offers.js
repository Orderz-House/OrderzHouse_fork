import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

// Allows clients to accept or reject freelancer offers and handle escrow
export const approveOrRejectOffer = async (req, res) => {
  // This function uses a transaction to ensure all steps succeed or none do.
  const client = await pool.connect();
  try {
    const clientId = req.token.userId;
    const { offerId, action } = req.body;

    // Fetch all necessary info for validation and notifications
    const { rows: offerRows } = await client.query(
      `SELECT o.*, 
              p.user_id AS client_id, 
              p.title AS project_title 
       FROM offers o 
       JOIN projects p ON o.project_id = p.id 
       WHERE o.id = $1`,
      [offerId]
    );
    if (!offerRows.length) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    const offer = offerRows[0];
    if (offer.client_id !== clientId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await client.query("BEGIN");

    if (action === "reject") {
      await client.query(`UPDATE offers SET offer_status = 'rejected' WHERE id = $1`, [offerId]);
      
      try {
        await NotificationCreators.offerStatusChanged(offer.id, offer.project_title, offer.freelancer_id, false);
      } catch (e) { console.error(`Failed to send offer rejection notification for offer ${offer.id}:`, e); }

      await client.query("COMMIT");
      return res.json({ success: true, message: "Offer rejected" });
    }

    if (action === "accept") {
      // Mark offer accepted
      await client.query(`UPDATE offers SET offer_status = 'accepted' WHERE id = $1`, [offerId]);

      // Assign freelancer
      const { rows: assignmentRows } = await client.query(
        `INSERT INTO project_assignments (project_id, freelancer_id, status)
         VALUES ($1, $2, 'active') ON CONFLICT DO NOTHING RETURNING *`,
        [offer.project_id, offer.freelancer_id]
      );

      // Update project table to reflect assigned freelancer
      await client.query(
        `UPDATE projects SET assigned_freelancer_id = $1, completion_status = 'not_started' WHERE id = $2`,
        [offer.freelancer_id, offer.project_id]
      );

      // Move budget into escrow
      await client.query(
        `INSERT INTO escrow (project_id, freelancer_id, amount, status) VALUES ($1, $2, $3, 'held')`,
        [offer.project_id, offer.freelancer_id, offer.bid_amount]
      );

      // ✨ NOTIFICATION INTEGRATION (ACCEPT): Send multiple notifications for this event.
      try {
        await NotificationCreators.offerStatusChanged(offer.id, offer.project_title, offer.freelancer_id, true);
        await NotificationCreators.freelancerAssignmentChanged(offer.project_id, offer.project_title, offer.freelancer_id, true);
        await NotificationCreators.escrowFunded(offer.project_id, offer.project_title, offer.freelancer_id, offer.bid_amount);
      } catch (e) { console.error(`Failed to send offer acceptance notifications for offer ${offer.id}:`, e); }

      await client.query("COMMIT");
      return res.json({
        success: true,
        message: "Offer accepted, freelancer assigned, escrow funded",
        assignment: assignmentRows[0],
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("approveOrRejectOffer error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

export const sendOffer = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const freelancerName = req.token?.username; // Assuming username is in token
    const { projectId } = req.params;
    const { bid_amount, delivery_time, proposal } = req.body;

    if (!projectId || bid_amount == null || !delivery_time || !proposal) {
      return res.status(400).json({ success: false, message: "Missing required fields: projectId, bid_amount, delivery_time, proposal" });
    }

    const projectQuery = await pool.query(
      `SELECT user_id, title, status, budget_min, budget_max, duration_days, duration_hours
       FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (projectQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const project = projectQuery.rows[0];

    if (project.status !== "bidding") {
      return res.status(400).json({ success: false, message: "Offers can only be sent to projects open for bidding" });
    }

    if (project.budget_min != null && project.budget_max != null && (bid_amount < parseFloat(project.budget_min) || bid_amount > parseFloat(project.budget_max))) {
      return res.status(400).json({ success: false, message: `Bid amount must be between ${project.budget_min} and ${project.budget_max}` });
    }

    if (project.duration_days != null && delivery_time > project.duration_days) {
      return res.status(400).json({ success: false, message: `Delivery time cannot exceed the project duration of ${project.duration_days} days` });
    }

    if (project.duration_hours != null && delivery_time > project.duration_hours) {
      return res.status(400).json({ success: false, message: `Delivery time cannot exceed the project duration of ${project.duration_hours} hours` });
    }

    const existingOffer = await pool.query(`SELECT id FROM offers WHERE project_id = $1 AND freelancer_id = $2 AND offer_status = 'pending'`, [projectId, freelancerId]);
    if (existingOffer.rows.length > 0) {
      return res.status(400).json({ success: false, message: "You already have a pending offer for this project" });
    }

    const insertQuery = await pool.query(
      `INSERT INTO offers (freelancer_id, project_id, bid_amount, delivery_time, proposal, offer_status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [freelancerId, projectId, bid_amount, delivery_time, proposal]
    );
    const newOffer = insertQuery.rows[0];

    try {
        await NotificationCreators.offerSubmitted(newOffer.id, projectId, project.title, freelancerName || 'a freelancer');
    } catch (e) { console.error(`Failed to send 'offerSubmitted' notification for offer ${newOffer.id}:`, e); }

    res.status(201).json({ success: true, message: "Offer sent successfully", offer: newOffer });
  } catch (err) {
    console.error("sendOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyOffersForProject = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { projectId } = req.params;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Unauthorized: freelancer not logged in" });
    }
    if (!projectId) {
      return res.status(400).json({ success: false, message: "Missing projectId parameter" });
    }

    const offersQuery = await pool.query(
      `SELECT o.id, o.freelancer_id, o.bid_amount, o.delivery_time, o.proposal, o.offer_status, o.created_at,
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

export const getOffersForMyProjects = async (req, res) => {
  try {
    const ownerId = req.token?.userId;

    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized: user not logged in" });
    }

    const offersQuery = await pool.query(
      `SELECT o.id AS offer_id, o.freelancer_id, u.first_name || ' ' || u.last_name AS freelancer_name,
              u.email AS freelancer_email, o.project_id, p.title AS project_title, o.bid_amount,
              o.delivery_time, o.proposal, o.offer_status, o.created_at AS submitted_at
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

export const respondToOffer = async (req, res) => {
  try {
    const ownerId = req.token?.userId;
    const { offerId } = req.params;
    const { action } = req.body; // "accept" or "reject"

    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized: user not logged in" });
    }
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action. Must be 'accept' or 'reject'." });
    }

    const offerQuery = await pool.query(
      `SELECT o.project_id, o.freelancer_id, p.user_id, p.title as project_title, o.offer_status
       FROM offers o
       JOIN projects p ON o.project_id = p.id
       WHERE o.id = $1`,
      [offerId]
    );

    if (offerQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }
    const offer = offerQuery.rows[0];

    if (offer.user_id !== ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only respond to offers for your own projects" });
    }

    if (action === "accept") {
      const acceptedOffer = await pool.query(`SELECT id FROM offers WHERE project_id = $1 AND offer_status = 'accepted'`, [offer.project_id]);
      if (acceptedOffer.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Only one offer can be accepted per project" });
      }
      await pool.query(`UPDATE offers SET offer_status = 'accepted' WHERE id = $1`, [offerId]);
      
      // The `approveOrRejectOffer` function handles the more complex case with escrow.
      try {
        await NotificationCreators.offerStatusChanged(offerId, offer.project_title, offer.freelancer_id, true);
      } catch(e) { console.error("Notification error on accept:", e); }

    } else if (action === "reject") {
      await pool.query(`UPDATE offers SET offer_status = 'rejected' WHERE id = $1`, [offerId]);

      try {
        await NotificationCreators.offerStatusChanged(offerId, offer.project_title, offer.freelancer_id, false);
      } catch(e) { console.error("Notification error on reject:", e); }
    }

    res.status(200).json({ success: true, message: `Offer ${action}ed successfully` });
  } catch (err) {
    console.error("respondToOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
