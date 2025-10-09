import pool  from "../models/db.js";


export const sendOffer = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { projectId } = req.params;
    const { bid_amount, delivery_time, proposal } = req.body;

    // Required fields check
    if (!projectId || bid_amount == null || !delivery_time || !proposal) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: projectId, bid_amount, delivery_time, proposal",
      });
    }

    // Get project
    const projectQuery = await pool.query(
      `SELECT status, budget_min, budget_max, duration_days, duration_hours
       FROM projects
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (projectQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectQuery.rows[0];

    // Project must be in bidding status
    if (project.status !== "bidding") {
      return res.status(400).json({
        success: false,
        message: "Offers can only be sent to projects open for bidding",
      });
    }

    // Validate bid amount range
    if (
      project.budget_min != null &&
      project.budget_max != null &&
      (bid_amount < parseFloat(project.budget_min) || bid_amount > parseFloat(project.budget_max))
    ) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be between ${project.budget_min} and ${project.budget_max}`,
      });
    }

    // Validate delivery time against project duration
    if (
      project.duration_days != null &&
      delivery_time > project.duration_days
    ) {
      return res.status(400).json({
        success: false,
        message: `Delivery time cannot exceed the project duration of ${project.duration_days} days`,
      });
    }

    if (
      project.duration_hours != null &&
      delivery_time > project.duration_hours
    ) {
      return res.status(400).json({
        success: false,
        message: `Delivery time cannot exceed the project duration of ${project.duration_hours} hours`,
      });
    }

    // Prevent multiple pending offers from same freelancer for the same project
    const existingOffer = await pool.query(
      `SELECT id FROM offers 
       WHERE project_id = $1 AND freelancer_id = $2 AND offer_status = 'pending'`,
      [projectId, freelancerId]
    );

    if (existingOffer.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending offer for this project",
      });
    }

    // Insert new offer
    const insertQuery = await pool.query(
      `INSERT INTO offers (freelancer_id, project_id, bid_amount, delivery_time, proposal, offer_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [freelancerId, projectId, bid_amount, delivery_time, proposal]
    );

    res.status(201).json({
      success: true,
      message: "Offer sent successfully",
      offer: insertQuery.rows[0],
    });
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
      return res.status(401).json({
        success: false,
        message: "Unauthorized: freelancer not logged in",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing projectId parameter",
      });
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

    res.status(200).json({
      success: true,
      offers: offersQuery.rows,
    });
  } catch (err) {
    console.error("getMyOffersForProject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getOffersForMyProjects = async (req, res) => {
  try {
    const ownerId = req.token?.userId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not logged in",
      });
    }

    const offersQuery = await pool.query(
      `SELECT o.id AS offer_id,
              o.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.email AS freelancer_email,
              o.project_id,
              p.title AS project_title,
              o.bid_amount,
              o.delivery_time,
              o.proposal,
              o.offer_status,
              o.submitted_at AS submitted_at
       FROM offers o
       JOIN projects p ON o.project_id = p.id
       JOIN users u ON o.freelancer_id = u.id
       WHERE p.user_id = $1
       ORDER BY o.submitted_at DESC`,
      [ownerId]
    );

    res.status(200).json({
      success: true,
      offers: offersQuery.rows,
    });
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
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not logged in",
      });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'accept' or 'reject'.",
      });
    }

    const offerQuery = await pool.query(
      `SELECT o.project_id, p.user_id, o.offer_status
       FROM offers o
       JOIN projects p ON o.project_id = p.id
       WHERE o.id = $1`,
      [offerId]
    );

    if (offerQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const offer = offerQuery.rows[0];

    if (offer.user_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only respond to offers for your own projects",
      });
    }

    if (action === "accept") {
      const acceptedOffer = await pool.query(
        `SELECT id FROM offers
         WHERE project_id = $1 AND offer_status = 'accepted'`,
        [offer.project_id]
      );

      if (acceptedOffer.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Only one offer can be accepted per project",
        });
      }

      // Accept this offer
      await pool.query(
        `UPDATE offers SET offer_status = 'accepted' WHERE id = $1`,
        [offerId]
      );
    } else if (action === "reject") {
      // Reject this offer
      await pool.query(
        `UPDATE offers SET offer_status = 'rejected' WHERE id = $1`,
        [offerId]
      );
    }

    res.status(200).json({
      success: true,
      message: `Offer ${action}ed successfully`,
    });
  } catch (err) {
    console.error("respondToOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

